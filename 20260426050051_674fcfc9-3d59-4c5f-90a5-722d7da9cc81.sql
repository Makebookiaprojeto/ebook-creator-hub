-- Refinar política de inserção de ordens para evitar abuso
DROP POLICY "Anyone can insert pending orders" ON public.orders;
CREATE POLICY "Anyone can create pending orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (status = 'pending');

-- Restringir visualização de perfis para usuários autenticados
DROP POLICY "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);
