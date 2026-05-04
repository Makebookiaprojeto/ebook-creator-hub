DROP POLICY IF EXISTS "Buyers can view chapters of purchased ebooks" ON public.chapters;

CREATE POLICY "Buyers can view chapters of purchased ebooks"
ON public.chapters
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.ebook_id = chapters.ebook_id
      AND o.status = 'paid'
      AND lower(coalesce(o.buyer_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);