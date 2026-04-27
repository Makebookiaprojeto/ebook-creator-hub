-- 1) Campos novos no eBook
ALTER TABLE public.ebooks
  ADD COLUMN IF NOT EXISTS cakto_checkout_url text;

-- (cakto_product_id já existe)
CREATE INDEX IF NOT EXISTS idx_ebooks_cakto_product_id
  ON public.ebooks (cakto_product_id)
  WHERE cakto_product_id IS NOT NULL;

-- 2) Campos novos em ebook_sales
ALTER TABLE public.ebook_sales
  ADD COLUMN IF NOT EXISTS ebook_owner_id uuid,
  ADD COLUMN IF NOT EXISTS cakto_transaction_id text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Backfill ebook_owner_id a partir do ebooks.user_id
UPDATE public.ebook_sales s
SET ebook_owner_id = e.user_id
FROM public.ebooks e
WHERE s.ebook_id = e.id AND s.ebook_owner_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_ebook_sales_buyer_email_lower
  ON public.ebook_sales (lower(customer_email));
CREATE INDEX IF NOT EXISTS idx_ebook_sales_owner ON public.ebook_sales (ebook_owner_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_ebook_sales_cakto_tx
  ON public.ebook_sales (cakto_transaction_id)
  WHERE cakto_transaction_id IS NOT NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_ebook_sales_updated_at ON public.ebook_sales;
CREATE TRIGGER trg_ebook_sales_updated_at
BEFORE UPDATE ON public.ebook_sales
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) RLS: comprador logado pode ver suas próprias compras
DROP POLICY IF EXISTS "Buyers can view their own ebook sales" ON public.ebook_sales;
CREATE POLICY "Buyers can view their own ebook sales"
ON public.ebook_sales
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
      AND u.email_confirmed_at IS NOT NULL
      AND lower(u.email::text) = lower(ebook_sales.customer_email)
  )
);
