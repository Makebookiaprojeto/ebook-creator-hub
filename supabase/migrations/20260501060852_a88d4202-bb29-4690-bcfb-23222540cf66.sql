-- Limpeza
DROP VIEW IF EXISTS public.public_ebooks CASCADE;
DROP POLICY IF EXISTS "Public can view public ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Public can view published ebooks" ON public.ebooks;

-- Recriar view pública apenas com campos seguros
CREATE VIEW public.public_ebooks
WITH (security_invoker = true) AS
SELECT
  id,
  user_id,
  title,
  subtitle,
  description,
  category,
  niche,
  audience,
  author_name,
  cover_url,
  slug,
  is_public,
  price_cents,
  sales_pitch,
  status,
  created_at,
  updated_at
FROM public.ebooks
WHERE is_public = true;

-- Policy mínima na tabela base (necessária pois view usa security_invoker)
CREATE POLICY "Public ebooks readable via view"
ON public.ebooks
FOR SELECT
TO anon, authenticated
USING (is_public = true);

GRANT SELECT ON public.public_ebooks TO anon, authenticated;

-- Templates: só autenticados
DROP POLICY IF EXISTS "Users can view active templates" ON public.ebook_templates;

CREATE POLICY "Authenticated users can view active templates"
ON public.ebook_templates
FOR SELECT
TO authenticated
USING (is_active = true);