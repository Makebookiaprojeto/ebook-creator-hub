-- Add ebook_file_url column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ebooks' AND column_name='ebook_file_url') THEN
        ALTER TABLE public.ebooks ADD COLUMN ebook_file_url TEXT;
    END IF;
END $$;

-- Synchronize data from pdf_url to ebook_file_url for existing records
UPDATE public.ebooks 
SET ebook_file_url = pdf_url 
WHERE ebook_file_url IS NULL AND pdf_url IS NOT NULL;
