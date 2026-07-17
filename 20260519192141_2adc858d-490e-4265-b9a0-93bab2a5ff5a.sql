-- 1. Create a unified view for user access status
CREATE OR REPLACE VIEW public.user_access_status AS
SELECT 
    p.user_id,
    p.is_lifetime OR EXISTS (
        SELECT 1 FROM public.subscriptions s 
        WHERE s.user_id = p.user_id 
        AND s.status = 'active' 
        AND (s.plan_type = 'lifetime' OR s.expires_at > now())
    ) OR EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = p.user_id 
        AND ur.role = 'admin'
    ) as has_active_access,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id AND ur.role = 'admin') THEN 'admin'
        WHEN p.is_lifetime THEN 'lifetime'
        ELSE (
            SELECT plan_type FROM public.subscriptions s 
            WHERE s.user_id = p.user_id 
            AND s.status = 'active' 
            ORDER BY created_at DESC LIMIT 1
        )
    END as current_plan
FROM public.profiles p;

-- 2. Grant access to the view
GRANT SELECT ON public.user_access_status TO authenticated;

-- 3. Function to ensure profile exists
CREATE OR REPLACE FUNCTION public.ensure_profile_exists(p_user_id UUID, p_display_name TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (p_user_id, p_display_name)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update Chapters RLS for sales page
DROP POLICY IF EXISTS "Chapters are viewable by everyone" ON public.chapters;
CREATE POLICY "Chapters are viewable by everyone" 
ON public.chapters FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.ebooks 
        WHERE ebooks.id = chapters.ebook_id 
        AND (ebooks.status = 'published' OR ebooks.is_public = true OR ebooks.user_id = auth.uid())
    )
);

-- 5. Fix purchases RLS for buyer visibility
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;
CREATE POLICY "Users can view their own purchases"
ON public.purchases FOR SELECT
USING (
    auth.uid() = user_id 
    OR buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
