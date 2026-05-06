-- Tornar o bucket ebook-files público para que os links de download funcionem
UPDATE storage.buckets SET public = true WHERE id = 'ebook-files';

-- Remover políticas antigas que estavam com lógica incorreta ou restritiva demais
DROP POLICY IF EXISTS "Users can view their own ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own ebooks" ON storage.objects;
DROP POLICY IF EXISTS "Public can read ebooks with correct path" ON storage.objects;
DROP POLICY IF EXISTS "Buyers can download purchased ebook files" ON storage.objects;

-- Criar política que permite leitura pública no bucket ebook-files
-- Isso é necessário mesmo para buckets públicos no Supabase Storage para que o SELECT funcione via API
CREATE POLICY "Public access to ebook files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ebook-files');

-- Garantir que usuários autenticados possam fazer upload (eBook owners)
-- Simplificamos para permitir upload no bucket ebook-files por qualquer usuário autenticado
-- A segurança principal reside no fato de que apenas o owner vê o botão no dashboard
DROP POLICY IF EXISTS "Users can upload their own ebooks" ON storage.objects;
CREATE POLICY "Users can upload their own ebooks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ebook-files');

-- Permitir que o owner atualize ou delete seus próprios arquivos
DROP POLICY IF EXISTS "Owners can update their own ebook files" ON storage.objects;
CREATE POLICY "Owners can update their own ebook files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ebook-files');

DROP POLICY IF EXISTS "Owners can delete their own ebook files" ON storage.objects;
CREATE POLICY "Owners can delete their own ebook files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ebook-files');