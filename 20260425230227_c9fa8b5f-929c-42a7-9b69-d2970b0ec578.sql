ALTER TABLE public.chapters
DROP CONSTRAINT IF EXISTS chapters_ebook_id_fkey,
ADD CONSTRAINT chapters_ebook_id_fkey
  FOREIGN KEY (ebook_id)
  REFERENCES public.ebooks(id)
  ON DELETE CASCADE;