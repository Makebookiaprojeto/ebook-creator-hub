CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE public.ebooks
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_cents integer,
  ADD COLUMN IF NOT EXISTS author_name text,
  ADD COLUMN IF NOT EXISTS sales_pitch text;

CREATE INDEX IF NOT EXISTS ebooks_slug_idx ON public.ebooks (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS ebooks_is_public_idx ON public.ebooks (is_public) WHERE is_public = true;

DROP POLICY IF EXISTS "Public can view published ebooks" ON public.ebooks;
CREATE POLICY "Public can view published ebooks"
ON public.ebooks
FOR SELECT
TO anon, authenticated
USING (is_public = true);

DROP POLICY IF EXISTS "Public can view chapters of public ebooks" ON public.chapters;
CREATE POLICY "Public can view chapters of public ebooks"
ON public.chapters
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ebooks e
    WHERE e.id = chapters.ebook_id AND e.is_public = true
  )
);

CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public, extensions
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(public.unaccent(coalesce(input, ''))),
        '[^a-z0-9]+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.ebooks_set_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  n int := 0;
BEGIN
  IF NEW.slug IS NULL OR length(NEW.slug) = 0 THEN
    base := nullif(public.slugify(NEW.title), '');
    IF base IS NULL THEN
      base := 'ebook';
    END IF;
    candidate := base;
    WHILE EXISTS (SELECT 1 FROM public.ebooks WHERE slug = candidate AND id <> NEW.id) LOOP
      n := n + 1;
      candidate := base || '-' || n::text;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ebooks_set_slug_trg ON public.ebooks;
CREATE TRIGGER ebooks_set_slug_trg
BEFORE INSERT OR UPDATE OF title, slug ON public.ebooks
FOR EACH ROW EXECUTE FUNCTION public.ebooks_set_slug();

UPDATE public.ebooks SET title = title WHERE slug IS NULL;