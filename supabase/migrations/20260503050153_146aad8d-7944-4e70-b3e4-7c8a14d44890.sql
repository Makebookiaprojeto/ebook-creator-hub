-- Dropar a política antiga que pode estar com problemas de cache ou permissão
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;

-- Criar uma nova política mais abrangente e robusta
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions 
FOR SELECT 
TO authenticated 
USING (
  (auth.uid() = user_id) 
  OR 
  (lower(buyer_email) = lower(auth.jwt() ->> 'email'))
);

-- Garantir que RLS está habilitado
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;