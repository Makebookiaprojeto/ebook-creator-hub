-- Permitir que qualquer pessoa (incluindo anônimos) visualize capítulos de ebooks marcados como públicos.
-- Isso corrige a falha onde visitantes não conseguiam ver o sumário ou prévias nas páginas de vendas.

CREATE POLICY "Public can view chapters of public ebooks"
ON public.chapters
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.ebooks
    WHERE ebooks.id = chapters.ebook_id
      AND ebooks.is_public = true
  )
);