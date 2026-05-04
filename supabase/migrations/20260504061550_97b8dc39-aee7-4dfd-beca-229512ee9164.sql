-- Garante que o autor sempre tenha acesso total aos seus capítulos
DROP POLICY IF EXISTS "Authors can view their own chapters" ON public.chapters;
CREATE POLICY "Authors can view their own chapters"
ON public.chapters
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Simplifica as permissões de atualização e exclusão para o autor
DROP POLICY IF EXISTS "Users can update their own chapters" ON public.chapters;
CREATE POLICY "Authors can update their own chapters"
ON public.chapters
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own chapters" ON public.chapters;
CREATE POLICY "Authors can delete their own chapters"
ON public.chapters
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
