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
      AND e.pdf_url IS NOT NULL
      AND split_part(e.pdf_url, 'ebook-files/', 2) = objects.name
  )
);