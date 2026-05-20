-- 1. Ensure user_id in subscriptions is nullable
ALTER TABLE public.subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- 2. Deduplicate and add unique constraint
DO $$
BEGIN
    -- Delete duplicates keeping the newest one (highest created_at or highest id if same timestamp)
    DELETE FROM public.subscriptions
    WHERE id NOT IN (
        SELECT id FROM (
            SELECT DISTINCT ON (user_id) id
            FROM public.subscriptions
            WHERE user_id IS NOT NULL
            ORDER BY user_id, created_at DESC, id
        ) t
    ) AND user_id IS NOT NULL;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_user_id_key'
    ) THEN
        ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- 3. Update handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_display_name TEXT;
BEGIN
    -- Extract display name
    v_display_name := COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), '')
    );

    -- Insert profile
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, v_display_name)
    ON CONFLICT (user_id) DO NOTHING;

    -- Link pending subscriptions by email
    -- We use a subquery to avoid unique constraint violation if there's somehow a conflict
    UPDATE public.subscriptions
    SET user_id = NEW.id
    WHERE user_id IS NULL 
    AND lower(buyer_email) = lower(NEW.email)
    AND NOT EXISTS (SELECT 1 FROM public.subscriptions s2 WHERE s2.user_id = NEW.id);

    -- If a subscription was linked or already exists, update profile if it's lifetime
    IF EXISTS (
        SELECT 1 FROM public.subscriptions 
        WHERE user_id = NEW.id AND plan_type = 'lifetime'
    ) THEN
        UPDATE public.profiles SET is_lifetime = true WHERE user_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$function$;

-- 4. Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
