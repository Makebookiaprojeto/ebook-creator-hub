-- Remover policy que ainda permitia anon ler a tabela base inteira
DROP POLICY IF EXISTS "Public ebooks readable via view" ON public.ebooks;

-- A view public_ebooks usa security_invoker e precisa que o role consultante
-- tenha permissão de SELECT na tabela base. Como queremos anon usando APENAS
-- a view (com colunas seguras), mudamos a view para security_definer = false
-- via uma função SECURITY DEFINER auxiliar. Alternativa mais simples: manter
-- a policy de SELECT em ebooks públicos APENAS para a view, restringindo
-- via grant de coluna.

-- Estratégia escolhida: revogar SELECT da tabela base para anon e dar SELECT
-- apenas em colunas seguras
REVOKE SELECT ON public.ebooks FROM anon;

-- Conceder SELECT apenas em colunas seguras para anon (column-level grant)
GRANT SELECT (
  id, user_id, title, subtitle, description, category,
  niche, audience, author_name, cover_url, slug, is_public,
  price_cents, sales_pitch, status, created_at, updated_at
) ON public.ebooks TO anon;

-- Recriar policy permitindo anon ler ebooks públicos (filtragem de colunas
-- já é controlada pelo GRANT acima)
CREATE POLICY "Anon can read safe columns of public ebooks"
ON public.ebooks
FOR SELECT
TO anon
USING (is_public = true);

-- Authenticated users que NÃO são donos: também podem ver públicos (mesmas
-- restrições de coluna não se aplicam por padrão; mas authenticated tem GRANT
-- completo). Para limitar, revogamos e regrantamos por coluna também para anon
-- de público em geral. Authenticated dono já tem policy "Users can view their own ebooks".
CREATE POLICY "Authenticated can read public ebooks"
ON public.ebooks
FOR SELECT
TO authenticated
USING (is_public = true);