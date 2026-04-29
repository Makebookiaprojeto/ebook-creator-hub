-- Ensure chapters table has RLS enabled
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them clearly
DROP POLICY IF EXISTS "Owners can view their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Public can preview first chapter of public ebooks" ON public.chapters;
DROP POLICY IF EXISTS "Buyers can view chapters of purchased ebooks" ON public.chapters;

-- Policy for owners: Can see ALL chapters of ebooks they OWN
-- Using a direct check on the ebooks table which is in the public schema
CREATE POLICY "Owners can view their own chapters" 
ON public.chapters 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.ebooks 
    WHERE ebooks.id = chapters.ebook_id 
    AND ebooks.user_id = auth.uid()
  )
);

-- Policy for public: Can only see the first chapter (index 0) of public ebooks
CREATE POLICY "Public can preview first chapter of public ebooks" 
ON public.chapters 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.ebooks 
    WHERE ebooks.id = chapters.ebook_id 
    AND ebooks.is_public = true
  ) 
  AND order_index = 0
);

-- Policy for buyers: Can see all chapters of purchased ebooks
-- Using auth.jwt() to get the user's email directly from the token instead of querying auth.users
CREATE POLICY "Buyers can view chapters of purchased ebooks" 
ON public.chapters 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.ebook_id = chapters.ebook_id 
    AND orders.status = 'paid' 
    AND orders.buyer_email = (auth.jwt() ->> 'email')
  )
);
