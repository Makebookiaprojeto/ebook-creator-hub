
-- Recria a view com SECURITY INVOKER para respeitar RLS do usuário consultante
DROP VIEW IF EXISTS public.ebook_payment_config_public;

CREATE VIEW public.ebook_payment_config_public 
WITH (security_invoker = true) AS
SELECT 
  epc.id,
  epc.ebook_id,
  epc.owner_id,
  epc.payment_platform,
  epc.checkout_url,
  epc.product_id,
  epc.created_at,
  epc.updated_at
FROM public.ebook_payment_config epc
INNER JOIN public.ebooks e ON e.id = epc.ebook_id
WHERE e.is_public = true;

-- A view com security_invoker precisa que o ebook_payment_config tenha
-- política pública para os campos não sensíveis. Como removemos a antiga,
-- vamos recriar uma política RESTRITA aos campos seguros via column-level grants.
-- Solução simples: política pública SELECT, mas o webhook_secret só visível ao dono.
-- Como Postgres RLS não suporta column-level em policies, faremos via REVOKE:

GRANT SELECT ON public.ebook_payment_config_public TO anon, authenticated;

-- Recria política pública na tabela base, mas o acesso ao webhook_secret
-- será controlado por column-level privileges
CREATE POLICY "Public can view payment config of public ebooks (no secret)"
ON public.ebook_payment_config
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ebooks e
    WHERE e.id = ebook_payment_config.ebook_id AND e.is_public = true
  )
);

-- Revoga acesso ao webhook_secret para anon e authenticated
REVOKE SELECT (webhook_secret) ON public.ebook_payment_config FROM anon, authenticated;

-- Garante que anon/authenticated possam ler as outras colunas
GRANT SELECT (id, ebook_id, owner_id, payment_platform, checkout_url, product_id, created_at, updated_at) 
ON public.ebook_payment_config TO anon, authenticated;
