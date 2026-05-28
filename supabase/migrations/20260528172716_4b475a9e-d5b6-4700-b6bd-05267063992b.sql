DROP FUNCTION IF EXISTS public.find_active_template_by_niche(_niche text);

CREATE OR REPLACE FUNCTION public.find_active_template_by_niche(_niche text)
 RETURNS TABLE(id uuid, niche text, audience text, title text, subtitle text, cover_prompt text, cover_url text, chapters jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, niche, audience, title, subtitle, cover_prompt, cover_url, chapters
  FROM public.ebook_templates
  WHERE is_active = true
    AND lower(niche) = lower(_niche)
  ORDER BY use_count ASC, created_at DESC
  LIMIT 1;
$function$;

GRANT EXECUTE ON FUNCTION public.find_active_template_by_niche(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_active_template_by_niche(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.find_active_template_by_niche(text) TO anon;
