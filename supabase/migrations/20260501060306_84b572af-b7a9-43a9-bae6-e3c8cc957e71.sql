-- Recriar a view com security_invoker = true (padrão seguro)
DROP VIEW IF EXISTS public.public_ebook_checkout;

CREATE VIEW public.public_ebook_checkout
WITH (security_invoker = true) AS
SELECT
  epc.ebook_id,
  epc.checkout_url
FROM public.ebook_payment_config epc
JOIN public.ebooks e ON e.id = epc.ebook_id
WHERE e.is_public = true;

GRANT SELECT ON public.public_ebook_checkout TO anon, authenticated;