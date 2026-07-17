-- Add is_lifetime to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_lifetime BOOLEAN DEFAULT FALSE;

-- Function to set lifetime access by email
CREATE OR REPLACE FUNCTION public.set_lifetime_by_email(target_email TEXT)
RETURNS VOID AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET is_lifetime = TRUE 
    WHERE user_id = target_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to existing users
SELECT public.set_lifetime_by_email('tr8200774@gmail.com');
SELECT public.set_lifetime_by_email('wtarthur15@gmail.com');
SELECT public.set_lifetime_by_email('phrs244@gmail.com');

-- Update the profile creation trigger to handle lifetime emails
-- First, find the trigger function name. Usually it's handle_new_user() or similar.
-- We'll create a new function or update the existing one if we can identify it.
-- But the most reliable way in this environment is to add a separate trigger or just handle it here.

CREATE OR REPLACE FUNCTION public.handle_lifetime_on_profile_creation()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    IF user_email IN ('tr8200774@gmail.com', 'wtarthur15@gmail.com', 'phrs244@gmail.com') THEN
        NEW.is_lifetime := TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_handle_lifetime_on_profile_creation ON public.profiles;
CREATE TRIGGER tr_handle_lifetime_on_profile_creation
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_lifetime_on_profile_creation();
