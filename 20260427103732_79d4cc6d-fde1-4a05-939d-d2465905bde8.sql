-- Plataforma de pagamento por ebook
ALTER TABLE public.ebooks
  ADD COLUMN IF NOT EXISTS payment_platform text NOT NULL DEFAULT 'cakto',
  ADD COLUMN IF NOT EXISTS payment_webhook_secret text;

-- Origem das vendas
ALTER TABLE public.ebook_sales
  ADD COLUMN IF NOT EXISTS platform text NOT NULL DEFAULT 'cakto',
  ADD COLUMN IF NOT EXISTS platform_transaction_id text;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS platform text NOT NULL DEFAULT 'cakto',
  ADD COLUMN IF NOT EXISTS platform_transaction_id text;

CREATE INDEX IF NOT EXISTS idx_ebooks_payment_platform ON public.ebooks(payment_platform);
CREATE INDEX IF NOT EXISTS idx_ebook_sales_platform ON public.ebook_sales(platform);
CREATE INDEX IF NOT EXISTS idx_orders_platform ON public.orders(platform);