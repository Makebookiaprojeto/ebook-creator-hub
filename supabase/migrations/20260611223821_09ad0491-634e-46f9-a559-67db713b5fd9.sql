DROP VIEW IF EXISTS public.public_ebooks;

CREATE VIEW public.public_ebooks AS
SELECT 
    id,
    user_id,
    title,
    subtitle,
    cover_url,
    price_cents,
    slug,
    content_json,
    created_at,
    status,
    is_public
FROM public.ebooks
WHERE is_public = true AND status = 'published';

GRANT SELECT ON public.public_ebooks TO anon, authenticated, service_role;