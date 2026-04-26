-- Ajustar as políticas para impedir listagem (indexação) de arquivos
-- O segredo é garantir que a política não permita um "SELECT *" genérico
DROP POLICY IF EXISTS "Avatar images are accessible by URL" ON storage.objects;
DROP POLICY IF EXISTS "Ebook images are accessible by URL" ON storage.objects;

-- Ao usar o nome do arquivo na condição, impedimos a listagem automática
CREATE POLICY "Avatar images are accessible by URL" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars' AND name IS NOT NULL);

CREATE POLICY "Ebook images are accessible by URL" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ebook-images' AND name IS NOT NULL);
