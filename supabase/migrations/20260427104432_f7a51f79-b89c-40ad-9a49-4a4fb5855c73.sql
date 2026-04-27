-- 1) Nova tabela protegida com configs de pagamento
CREATE TABLE IF NOT EXISTS public.ebook_payment_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id uuid NOT NULL UNIQUE REFERENCES public.ebooks(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  payment_platform text NOT NULL DEFAULT 'cakto',
  checkout_url text,
  product_id text,
  webhook_secret text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ebook_payment_config_owner ON public.ebook_payment_config(owner_id);
CREATE INDEX IF NOT EXISTS idx_ebook_payment_config_product ON public.ebook_payment_config(payment_platform, product_id);

ALTER TABLE public.ebook_payment_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read their payment config"
  ON public.ebook_payment_config FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners insert their payment config"
  ON public.ebook_payment_config FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners update their payment config"
  ON public.ebook_payment_config FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners delete their payment config"
  ON public.ebook_payment_config FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE TRIGGER trg_ebook_payment_config_updated
  BEFORE UPDATE ON public.ebook_payment_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Migra dados existentes
INSERT INTO public.ebook_payment_config
  (ebook_id, owner_id, payment_platform, checkout_url, product_id, webhook_secret)
SELECT id, user_id,
       COALESCE(payment_platform, 'cakto'),
       cakto_checkout_url,
       cakto_product_id,
       payment_webhook_secret
FROM public.ebooks
WHERE cakto_checkout_url IS NOT NULL
   OR cakto_product_id IS NOT NULL
   OR payment_webhook_secret IS NOT NULL
ON CONFLICT (ebook_id) DO NOTHING;

-- 3) Remove dados sensíveis da tabela pública
ALTER TABLE public.ebooks DROP COLUMN IF EXISTS payment_webhook_secret;
ALTER TABLE public.ebooks DROP COLUMN IF EXISTS cakto_product_id;
ALTER TABLE public.ebooks DROP COLUMN IF EXISTS payment_platform;
-- mantemos cakto_checkout_url na ebooks (link público de checkout)

-- 4) View pública só com o link de checkout (sem product_id nem secret)
-- Já está coberto por ebooks.cakto_checkout_url (publicamente legível, mas não é segredo).

-- 5) Reforço de segurança no storage: exigir email confirmado pra baixar PDFs comprados
DROP POLICY IF EXISTS "Buyers can download purchased ebook files" ON storage.objects;

CREATE POLICY "Buyers can download purchased ebook files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ebook-files'
    AND EXISTS (
      SELECT 1 FROM public.ebook_sales s
      JOIN auth.users u ON u.id = auth.uid()
      JOIN public.ebooks e ON e.id = s.ebook_id
      WHERE s.status = 'paid'
        AND u.email_confirmed_at IS NOT NULL
        AND lower(s.customer_email) = lower(u.email::text)
        AND e.pdf_url LIKE '%' || storage.objects.name || '%'
    )
  );