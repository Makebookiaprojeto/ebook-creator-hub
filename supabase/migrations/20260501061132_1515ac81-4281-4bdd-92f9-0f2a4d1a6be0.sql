-- Remover policy genérica que dava acesso a authenticated em ebooks públicos
DROP POLICY IF EXISTS "Authenticated can read public ebooks" ON public.ebooks;

-- Revogar acesso direto a colunas sensíveis de authenticated em geral
REVOKE SELECT ON public.ebooks FROM authenticated;

-- Conceder acesso completo ao authenticated (mas RLS vai filtrar por dono)
-- Para o dono ler todos os campos do próprio ebook
GRANT SELECT ON public.ebooks TO authenticated;

-- A única policy que permite authenticated ler ebooks agora é
-- "Users can view their own ebooks" (auth.uid() = user_id)
-- Para ler ebooks públicos de OUTROS, authenticated deve usar a view public_ebooks

-- Garantir que a view public_ebooks funcione para authenticated também
-- (já tinha GRANT, mas confirmando)
GRANT SELECT ON public.public_ebooks TO anon, authenticated;