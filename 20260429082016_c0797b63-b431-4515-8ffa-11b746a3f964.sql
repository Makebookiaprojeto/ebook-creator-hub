-- 1. Restrict check_email_exists to authenticated users only (avoid email enumeration by public)
REVOKE EXECUTE ON FUNCTION public.check_email_exists(text) FROM public;
REVOKE EXECUTE ON FUNCTION public.check_email_exists(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO authenticated;

-- 2. Restrict is_admin and has_role (though internal, it's good practice)
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 3. Restrict get_public_ebook_pdf_url
REVOKE EXECUTE ON FUNCTION public.get_public_ebook_pdf_url(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_public_ebook_pdf_url(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_public_ebook_pdf_url(uuid) TO authenticated;

-- 4. Restrict template lookup
REVOKE EXECUTE ON FUNCTION public.find_active_template_by_niche(text) FROM public;
REVOKE EXECUTE ON FUNCTION public.find_active_template_by_niche(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.find_active_template_by_niche(text) TO authenticated;

-- 5. Switch increment_template_use to SECURITY INVOKER if it doesn't need higher privileges
-- or at least restrict it. Let's restrict it for now.
REVOKE EXECUTE ON FUNCTION public.increment_template_use(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.increment_template_use(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_template_use(uuid) TO authenticated;
