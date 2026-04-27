-- 1) Corrige INSERT em orders: exige que buyer_email == email do usuário autenticado
DROP POLICY IF EXISTS "Anyone can create orders for published ebooks" ON public.orders;

CREATE POLICY "Authenticated users create orders with own email"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  status = 'pending'
  AND lower(buyer_email) = lower((auth.jwt() ->> 'email'))
  AND EXISTS (
    SELECT 1 FROM public.ebooks
    WHERE ebooks.id = orders.ebook_id AND ebooks.is_public = true
  )
);

-- 2) Corrige a storage policy de download: usa match exato em vez de LIKE com %
DROP POLICY IF EXISTS "Buyers can download purchased ebook files" ON storage.objects;

CREATE POLICY "Buyers can download purchased ebook files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ebook-files'
  AND EXISTS (
    SELECT 1
    FROM public.ebook_sales s
    JOIN auth.users u ON u.id = auth.uid()
    JOIN public.ebooks e ON e.id = s.ebook_id
    WHERE s.status = 'paid'
      AND u.email_confirmed_at IS NOT NULL
      AND lower(s.customer_email) = lower(u.email::text)
      -- Match exato: o pdf_url deve terminar com o nome do objeto
      AND (
        e.pdf_url = objects.name
        OR e.pdf_url LIKE ('%/' || objects.name)
        OR split_part(e.pdf_url, 'ebook-files/', 2) = objects.name
      )
  )
);