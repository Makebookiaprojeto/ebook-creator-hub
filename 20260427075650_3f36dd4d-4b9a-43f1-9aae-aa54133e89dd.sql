
-- Allow buyers to view their own orders
CREATE POLICY "Buyers can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (lower(buyer_email) = lower((auth.jwt() ->> 'email')));

-- Allow ebook owners to update their own files in ebook-files bucket
CREATE POLICY "Owners can update their own ebook files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ebook-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'ebook-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow ebook owners to delete their own files in ebook-files bucket
CREATE POLICY "Owners can delete their own ebook files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'ebook-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
