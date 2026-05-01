-- Aplicar column-level grants também para authenticated (não-dono)
REVOKE SELECT ON public.ebooks FROM authenticated;

GRANT SELECT (
  id, user_id, title, subtitle, description, category,
  niche, audience, author_name, cover_url, slug, is_public,
  price_cents, sales_pitch, status, created_at, updated_at,
  -- dono precisa também destas colunas; o RLS por dono garante segurança
  pdf_url, cakto_checkout_url, generation_status, generation_progress,
  generation_error, generation_input
) ON public.ebooks TO authenticated;

-- Garantir column-level também para anon (caso tenha sido sobrescrito)
REVOKE SELECT ON public.ebooks FROM anon;
GRANT SELECT (
  id, user_id, title, subtitle, description, category,
  niche, audience, author_name, cover_url, slug, is_public,
  price_cents, sales_pitch, status, created_at, updated_at
) ON public.ebooks TO anon;

-- Corrigir policy de capítulos para compradores: usar auth.users.email confirmado
DROP POLICY IF EXISTS "Buyers can view chapters of purchased ebooks" ON public.chapters;

CREATE POLICY "Buyers can view chapters of purchased ebooks"
ON public.chapters
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN auth.users u ON u.id = auth.uid()
    WHERE o.ebook_id = chapters.ebook_id
      AND o.status = 'paid'
      AND u.email_confirmed_at IS NOT NULL
      AND lower(o.buyer_email) = lower(u.email::text)
  )
);