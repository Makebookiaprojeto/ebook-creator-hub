
-- 1. Add variant_index for ordering 1..4 per niche
ALTER TABLE public.ebook_templates
  ADD COLUMN IF NOT EXISTS variant_index integer NOT NULL DEFAULT 1;

-- Backfill: all existing templates are variant 1
UPDATE public.ebook_templates SET variant_index = 1 WHERE variant_index IS NULL OR variant_index = 0;

-- Unique (niche, variant_index) on lower(niche)
CREATE UNIQUE INDEX IF NOT EXISTS ebook_templates_niche_variant_uidx
  ON public.ebook_templates (lower(niche), variant_index)
  WHERE is_active = true;

-- 2. Cursor table to persist rotation per niche
CREATE TABLE IF NOT EXISTS public.niche_template_cursor (
  niche text PRIMARY KEY,
  last_variant integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.niche_template_cursor TO service_role;
ALTER TABLE public.niche_template_cursor ENABLE ROW LEVEL SECURITY;

-- No authenticated/anon policies: only edge functions (service_role) touch it.
CREATE POLICY "service role only" ON public.niche_template_cursor
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. RPC: atomically advance the cursor for a niche and return the next template.
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

  INSERT INTO public.niche_template_cursor (niche, last_variant, updated_at)
  VALUES (v_key, 1, now())
  ON CONFLICT (niche) DO UPDATE
    SET last_variant = (public.niche_template_cursor.last_variant % GREATEST(v_total, 1)) + 1,
        updated_at = now()
  RETURNING niche_template_cursor.last_variant INTO v_next;

  RETURN QUERY
  SELECT t.id, t.niche, t.audience, t.title, t.subtitle, t.cover_prompt, t.cover_url, t.chapters, t.variant_index
  FROM public.ebook_templates t
  WHERE t.is_active = true AND lower(t.niche) = v_key
  ORDER BY (CASE WHEN t.variant_index = v_next THEN 0 ELSE 1 END), t.variant_index ASC
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.pick_next_template_for_niche(text) TO authenticated, service_role;
