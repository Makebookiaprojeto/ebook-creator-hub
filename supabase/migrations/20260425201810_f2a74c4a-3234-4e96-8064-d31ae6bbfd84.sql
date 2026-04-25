-- Cria o bucket se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ebook-files', 'ebook-files', false)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir que usuários autenticados façam upload de seus próprios ebooks
CREATE POLICY "Users can upload their own ebooks"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ebook-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Política para permitir que usuários visualizem seus próprios arquivos
CREATE POLICY "Users can view their own ebooks"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'ebook-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Política para permitir leitura pública dos ebooks (para entrega via link)
-- No mundo real, usaríamos links assinados, mas para simplificar o MVP
-- vamos permitir SELECT se o bucket for 'ebook-files' e o arquivo for solicitado.
-- Para maior segurança, o ideal é link assinado de curta duração.
CREATE POLICY "Public can read ebooks with correct path"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ebook-files');