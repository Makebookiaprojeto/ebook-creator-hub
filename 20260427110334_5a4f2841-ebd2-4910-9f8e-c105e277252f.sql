-- Remove a política pública ampla que expunha pdf_url
DROP POLICY IF EXISTS "Public can view published ebooks" ON public.ebooks;

-- Cria nova política pública que esconde pdf_url
-- Postgres RLS é por linha, não por coluna, então usamos uma view para colunas públicas
CREATE OR REPLACE VIEW public.public_ebooks
WITH (security_invoker = true)
AS
SELECT
  id, user_id, title, subtitle, description, category, niche, audience,
  cover_url, status, slug, price_cents, author_name, sales_pitch,
  cakto_checkout_url, is_public, created_at, updated_at
FROM public.ebooks
WHERE is_public = true;

GRANT SELECT ON public.public_ebooks TO anon, authenticated;

-- Recria a policy pública na tabela base, mas agora oculta pdf_url via uma policy
-- que só inclui ebooks públicos quando o leitor não vê pdf_url diretamente.
-- Mantemos acesso público à tabela (necessário para compatibilidade com queries existentes),
-- mas removemos pdf_url do retorno público filtrando no client.
-- Solução robusta: nullify pdf_url para não-donos via security definer function.

CREATE OR REPLACE FUNCTION public.get_public_ebook_pdf_url(_ebook_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pdf_url FROM public.ebooks
  WHERE id = _ebook_id
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.orders o
        JOIN auth.users u ON u.id = auth.uid()
        WHERE o.ebook_id = _ebook_id
          AND o.status = 'paid'
          AND u.email_confirmed_at IS NOT NULL
          AND lower(o.buyer_email) = lower(u.email::text)
      )
    )
$$;

REVOKE EXECUTE ON FUNCTION public.get_public_ebook_pdf_url(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_public_ebook_pdf_url(uuid) TO authenticated;

-- Recria a policy pública SEM pdf_url visível: usamos column-level security via REVOKE
CREATE POLICY "Public can view published ebooks"
ON public.ebooks
FOR SELECT
TO anon, authenticated
USING (is_public = true);

-- Revoga SELECT da coluna pdf_url para anon e authenticated (apenas dono via "Users can view their own ebooks")
REVOKE SELECT (pdf_url) ON public.ebooks FROM anon, authenticated;
GRANT SELECT (
  id, user_id, title, subtitle, description, category, niche, audience,
  cover_url, status, slug, price_cents, author_name, sales_pitch,
  cakto_checkout_url, is_public, created_at, updated_at
) ON public.ebooks TO anon, authenticated;