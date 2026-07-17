ALTER TABLE public.ebooks 
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 29.90,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create an index for slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_ebooks_slug ON public.ebooks(slug);

-- Update RLS policies to ensure users can read/write their own price/is_public/slug
-- Usually already covered by (auth.uid() = user_id) but good to double check.
