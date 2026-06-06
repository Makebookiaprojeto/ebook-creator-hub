-- Habilitar Realtime para purchases se ainda não estiver habilitado
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'purchases'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE purchases;
    END IF;
END $$;

-- Corrigir políticas RLS da tabela purchases para evitar 'permission denied for table users'
-- Removemos as políticas antigas que usavam subqueries na tabela auth.users
DROP POLICY IF EXISTS "Buyers can view their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Customers can view their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;

-- Criar nova política unificada para compradores usando auth.jwt()
CREATE POLICY "Users can view their own purchases" ON public.purchases
FOR SELECT
USING (
    auth.uid() = user_id 
    OR 
    buyer_email = (auth.jwt() ->> 'email')::text
);

-- Garantir que as políticas de vendedor existam e estejam corretas
DROP POLICY IF EXISTS "Sellers can view their own sales" ON public.purchases;
CREATE POLICY "Sellers can view their own sales" ON public.purchases
FOR SELECT
USING (auth.uid() = seller_user_id);

-- Garantir que a tabela notifications tenha Realtime (já está, mas reforçamos)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;
END $$;
