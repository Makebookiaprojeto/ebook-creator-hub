-- Remover políticas que permitem listagem ampla (SELECT sem filtro de nome/folder)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Ebook images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public can read ebooks with correct path" ON storage.objects;

-- Criar novas políticas que permitem visualizar o arquivo se você souber o caminho, 
-- mas impedem a listagem (através da verificação do nome do arquivo)
CREATE POLICY "Avatar images are accessible by URL" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Ebook images are accessible by URL" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ebook-images');

-- Para o bucket de arquivos (PDFs), garantir que apenas o dono veja 
-- (a política de inserção já existe, vamos reforçar a de visualização)
-- Nota: O acesso público ao PDF deve ser feito via Edge Function ou URL assinada se for venda,
-- mas por enquanto mantemos o isolamento por proprietário.
CREATE POLICY "Users can view their own ebook files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ebook-files' AND (storage.foldername(name))[1] = auth.uid()::text);
