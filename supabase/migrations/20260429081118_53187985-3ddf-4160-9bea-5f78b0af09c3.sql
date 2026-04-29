-- Drop existing policies that might be incorrectly using 'public' role or auth.uid()
DROP POLICY IF EXISTS "Users can create their own ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Users can delete their own ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Users can update their own ebooks" ON public.ebooks;
DROP POLICY IF EXISTS "Users can view their own ebooks" ON public.ebooks;

-- Re-create policies with explicit authenticated role
CREATE POLICY "Users can create their own ebooks" 
ON public.ebooks 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ebooks" 
ON public.ebooks 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own ebooks" 
ON public.ebooks 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own ebooks" 
ON public.ebooks 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);
