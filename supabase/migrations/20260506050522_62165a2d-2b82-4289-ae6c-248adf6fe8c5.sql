-- Remover a política de atualização problemática e excessivamente restritiva
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Criar uma nova política de atualização robusta
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
