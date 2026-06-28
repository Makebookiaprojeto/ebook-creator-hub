
CREATE OR REPLACE FUNCTION public.pick_next_template_for_niche(_niche text)
RETURNS TABLE (
  id uuid,
  niche text,
  audience text,
  title text,
  subtitle text,
  cover_prompt text,
  cover_url text,
  chapters jsonb,
  variant_index integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text := lower(_niche);
  v_total integer;
  v_next integer;
BEGIN
  SELECT count(*) INTO v_total
  FROM public.ebook_templates t
  WHERE t.is_active = true AND lower(t.niche) = v_key;

  IF v_total = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.niche_template_cursor AS c (niche, last_variant, updated_at)
  VALUES (v_key, 1, now())
  ON CONFLICT (niche) DO UPDATE
    SET last_variant = (c.last_variant % GREATEST(v_total, 1)) + 1,
        updated_at = now()
  RETURNING c.last_variant INTO v_next;

  RETURN QUERY
  SELECT t.id, t.niche, t.audience, t.title, t.subtitle, t.cover_prompt, t.cover_url, t.chapters, t.variant_index
  FROM public.ebook_templates t
  WHERE t.is_active = true AND lower(t.niche) = v_key
  ORDER BY (CASE WHEN t.variant_index = v_next THEN 0 ELSE 1 END), t.variant_index ASC
  LIMIT 1;
END;
$$;
