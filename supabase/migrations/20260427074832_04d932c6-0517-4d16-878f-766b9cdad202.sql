-- 1) Bloquear enumeração de emails: revogar execute público da função
REVOKE EXECUTE ON FUNCTION public.check_email_exists(text) FROM anon, authenticated, public;

-- 2) Proteger conteúdo dos capítulos (paywall)
DROP POLICY IF EXISTS "Public can view chapters of public ebooks" ON public.chapters;

-- Apenas o primeiro capítulo (order_index = 0) de ebooks públicos é visível como preview
CREATE POLICY "Public can preview first chapter of public ebooks"
ON public.chapters
FOR SELECT
TO anon, authenticated
USING (
  order_index = 0
  AND EXISTS (
    SELECT 1 FROM public.ebooks e
    WHERE e.id = chapters.ebook_id AND e.is_public = true
  )
);

-- Compradores com pedido pago veem todos os capítulos do ebook adquirido
CREATE POLICY "Buyers can view chapters of purchased ebooks"
ON public.chapters
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN auth.users u ON u.id = auth.uid()
    WHERE o.ebook_id = chapters.ebook_id
      AND o.status = 'paid'
      AND lower(o.buyer_email) = lower(u.email)
  )
);

-- 3) Permitir que compradores baixem o PDF no bucket privado ebook-files
-- Convenção: arquivos armazenados em <owner_user_id>/<ebook_id>/...
CREATE POLICY "Buyers can download purchased ebook files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ebook-files'
  AND EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN auth.users u ON u.id = auth.uid()
    WHERE o.status = 'paid'
      AND lower(o.buyer_email) = lower(u.email)
      AND (storage.foldername(name))[1] = o.ebook_owner_id::text
      AND (storage.foldername(name))[2] = o.ebook_id::text
  )
);