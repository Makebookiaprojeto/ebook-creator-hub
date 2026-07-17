-- 1. Garantir que o público possa ver eBooks marcados como públicos (Página de Vendas)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view public ebooks') THEN
        CREATE POLICY "Public can view public ebooks" ON public.ebooks
        FOR SELECT USING (is_public = true);
    END IF;
END $$;

-- 2. Permitir que o público veja o link de checkout de eBooks públicos
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view payment config of public ebooks') THEN
        CREATE POLICY "Public can view payment config of public ebooks" ON public.ebook_payment_config
        FOR SELECT USING (EXISTS (
            SELECT 1 FROM public.ebooks e 
            WHERE e.id = ebook_id AND e.is_public = true
        ));
    END IF;
END $$;

-- 3. Corrigir permissão de inserção de pedidos (necessário para o checkout funcionar)
-- Nota: A inserção geralmente é feita por Service Role ou via Edge Function, 
-- mas se for via cliente, precisa de uma política.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create an order') THEN
        CREATE POLICY "Anyone can create an order" ON public.orders
        FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 4. Reforçar RLS na tabela de templates (apenas admins gerenciam)
DROP POLICY IF EXISTS "Admins can manage templates" ON public.ebook_templates;
CREATE POLICY "Admins can manage templates" ON public.ebook_templates
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 5. Permitir que usuários autenticados vejam templates ativos (para o fluxo híbrido)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view active templates') THEN
        CREATE POLICY "Users can view active templates" ON public.ebook_templates
        FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- 6. Limpeza de funções obsoletas (se houver) que possam causar o aviso de SECURITY DEFINER
-- Como não encontramos no path public, garantimos que as permissões de esquema estão corretas
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM public;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;
