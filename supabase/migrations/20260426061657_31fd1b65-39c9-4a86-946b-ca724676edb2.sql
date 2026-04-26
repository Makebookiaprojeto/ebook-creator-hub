-- 1. Criar esquema de extensões se não existir e mover extensões (Segurança Recomendada)
CREATE SCHEMA IF NOT EXISTS extensions;
DO $$ 
DECLARE 
    ext record;
BEGIN
    FOR ext IN (SELECT extname FROM pg_extension WHERE extnamespace = 'public'::regnamespace) LOOP
        EXECUTE 'ALTER EXTENSION ' || quote_ident(ext.extname) || ' SET SCHEMA extensions';
    END LOOP;
END $$;

-- 2. Corrigir política de perfis (Vulnerabilidade de Exposição de Dados)
-- Anteriormente, qualquer usuário autenticado podia ver todos os perfis.
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Melhorar política de Pedidos (Vulnerabilidade de Integridade)
-- Garantir que pedidos pendentes só possam ser criados com informações básicas
DROP POLICY IF EXISTS "Anyone can create pending orders" ON public.orders;
CREATE POLICY "Anyone can create orders for published ebooks" 
ON public.orders FOR INSERT 
WITH CHECK (
  status = 'pending' 
  AND EXISTS (
    SELECT 1 FROM ebooks 
    WHERE id = ebook_id 
    AND is_public = true
  )
);

-- 4. Garantir que o usuário não consiga alterar o user_id de seu próprio registro de ebook (Segurança de Propriedade)
-- As políticas existentes de UPDATE já usam (auth.uid() = user_id), o que é correto.

-- 5. Revogar permissões públicas do esquema public para evitar acesso não intencional a funções internas
REVOKE ALL ON SCHEMA public FROM public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;
