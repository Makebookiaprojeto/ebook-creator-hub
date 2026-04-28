-- Update all existing ebooks to be public
UPDATE public.ebooks SET is_public = true;

-- Set default value for is_public to true for new ebooks
ALTER TABLE public.ebooks ALTER COLUMN is_public SET DEFAULT true;