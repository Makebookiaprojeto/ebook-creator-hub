
-- ============================================================
-- FIX 1: Webhook secrets publicamente legíveis
-- ============================================================
DROP POLICY IF EXISTS "Public can view payment config of public ebooks" ON public.ebook_payment_config;

-- Cria view pública SEM o webhook_secret
CREATE OR REPLACE VIEW public.ebook_payment_config_public AS
SELECT 
  id,
  ebook_id,
  owner_id,
  payment_platform,
  checkout_url,
  product_id,
  created_at,
  updated_at
FROM public.ebook_payment_config
WHERE EXISTS (
  SELECT 1 FROM public.ebooks e 
  WHERE e.id = ebook_payment_config.ebook_id AND e.is_public = true
);

GRANT SELECT ON public.ebook_payment_config_public TO anon, authenticated;

-- ============================================================
-- FIX 2: Inserção anônima de pedidos com status arbitrário
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
-- Mantém apenas "Authenticated users create orders with own email" que já valida ownership

-- ============================================================
-- FIX 3: Remove ebook_sales do Realtime (vazamento de dados)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ebook_sales'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.ebook_sales;
  END IF;
END $$;
