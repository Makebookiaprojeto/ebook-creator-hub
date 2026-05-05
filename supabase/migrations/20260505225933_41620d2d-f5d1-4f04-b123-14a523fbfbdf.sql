-- Add is_template column to ebooks
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

-- Create an index for niche lookups on templates
CREATE INDEX IF NOT EXISTS idx_ebooks_niche_template ON public.ebooks(niche) WHERE is_template = true;

-- Update RLS policies to allow reading template ebooks
-- First check if the policy already exists or modify existing ones
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ebooks' AND policyname = 'Anyone can view template ebooks'
    ) THEN
        CREATE POLICY "Anyone can view template ebooks" 
        ON public.ebooks 
        FOR SELECT 
        USING (is_template = true);
    END IF;
END $$;
