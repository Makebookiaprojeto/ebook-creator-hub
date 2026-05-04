-- Garantir que o RLS está ativo
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas para evitar conflitos ou erros de permissão
DROP POLICY IF EXISTS "Authors can view their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Buyers can view chapters of purchased ebooks" ON public.chapters;
DROP POLICY IF EXISTS "Public can view chapters of public ebooks" ON public.chapters;
DROP POLICY IF EXISTS "Public can preview first chapter of public ebooks" ON public.chapters;

-- 1. O autor tem acesso total aos seus próprios capítulos
CREATE POLICY "Authors can view their own chapters"
ON public.chapters
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Compradores podem ver capítulos se o pagamento foi confirmado
CREATE POLICY "Buyers can view chapters of purchased ebooks"
ON public.chapters
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.ebook_id = chapters.ebook_id
      AND o.status = 'paid'
      AND lower(coalesce(o.buyer_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

-- 3. Se o eBook for público, qualquer um pode ler os capítulos
CREATE POLICY "Public can view chapters of public ebooks"
ON public.chapters
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.ebooks e
    WHERE e.id = chapters.ebook_id
      AND e.is_public = true
  )
);

-- 4. Garantir que o autor também possa inserir/atualizar/deletar
DROP POLICY IF EXISTS "Users can create their own chapters" ON public.chapters;
CREATE POLICY "Users can create their own chapters"
ON public.chapters
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can update their own chapters" ON public.chapters;
CREATE POLICY "Authors can update their own chapters"
ON public.chapters
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can delete their own chapters" ON public.chapters;
CREATE POLICY "Authors can delete their own chapters"
ON public.chapters
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
