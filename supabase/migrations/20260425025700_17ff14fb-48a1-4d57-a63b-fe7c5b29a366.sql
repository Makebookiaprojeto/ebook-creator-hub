-- Make ebooks public by default and publish all existing ones
ALTER TABLE public.ebooks ALTER COLUMN is_public SET DEFAULT true;
UPDATE public.ebooks SET is_public = true WHERE is_public = false;