-- Ensure RLS is enabled
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be conflicting or restrictive
DROP POLICY IF EXISTS "Owners can view their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Users can view their own chapters" ON public.chapters;

-- Add a clear policy for chapter owners (authors)
CREATE POLICY "Authors can view their own chapters"
ON public.chapters
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure creators can insert
DROP POLICY IF EXISTS "Users can create their own chapters" ON public.chapters;
CREATE POLICY "Users can create their own chapters"
ON public.chapters
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
