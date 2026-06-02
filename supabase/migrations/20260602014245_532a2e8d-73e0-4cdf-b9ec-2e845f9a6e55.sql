-- Remove the column monthly_ebook_limit as it's no longer needed
ALTER TABLE public.profiles DROP COLUMN IF EXISTS monthly_ebook_limit;

-- We'll keep ebooks_generated_this_month and last_ebook_reset_at for analytics purposes, 
-- but they will no longer be used for enforcement.
