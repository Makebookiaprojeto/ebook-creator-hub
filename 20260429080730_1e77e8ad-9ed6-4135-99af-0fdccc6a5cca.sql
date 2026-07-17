-- Drop existing constraint
ALTER TABLE public.ebook_sales
DROP CONSTRAINT IF EXISTS ebook_sales_ebook_id_fkey;

-- Re-add with CASCADE
ALTER TABLE public.ebook_sales
ADD CONSTRAINT ebook_sales_ebook_id_fkey
FOREIGN KEY (ebook_id)
REFERENCES public.ebooks(id)
ON DELETE CASCADE;
