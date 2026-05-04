-- Drop existing select policies for chapters to avoid conflicts
DROP POLICY IF EXISTS "Authors can view their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Public can view chapters of public ebooks" ON public.chapters;
DROP POLICY IF EXISTS "Buyers can view chapters of purchased ebooks" ON public.chapters;

-- 1. Authors: Can see their own chapters (via user_id column OR via ebook ownership)
CREATE POLICY "Authors can view their own chapters"
ON public.chapters
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.ebooks e
    WHERE e.id = chapters.ebook_id 
    AND e.user_id = auth.uid()
  )
);

-- 2. Public: Can see chapters of public ebooks
CREATE POLICY "Public can view chapters of public ebooks"
ON public.chapters
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ebooks e
    WHERE e.id = chapters.ebook_id 
    AND e.is_public = true
  )
);

-- 3. Buyers: Can see chapters of ebooks they paid for
CREATE POLICY "Buyers can view chapters of purchased ebooks"
ON public.chapters
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.ebook_id = chapters.ebook_id
    AND o.status = 'paid'
    AND lower(coalesce(o.buyer_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

-- Ensure RLS is enabled
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
