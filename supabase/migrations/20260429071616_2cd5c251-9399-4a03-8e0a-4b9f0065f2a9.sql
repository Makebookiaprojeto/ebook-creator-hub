-- Ensure chapters table has RLS enabled
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them clearly
DROP POLICY IF EXISTS "Users can view their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Public can preview first chapter of public ebooks" ON public.chapters;

-- Policy for owners: Can see ALL their chapters
CREATE POLICY "Users can view their own chapters" 
ON public.chapters 
FOR SELECT 
USING (auth.uid() = user_id);

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
