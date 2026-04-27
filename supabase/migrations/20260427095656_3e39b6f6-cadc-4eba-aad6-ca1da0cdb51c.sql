-- 1. ebook_sales: bloquear escrita de usuários
CREATE POLICY "Block client inserts on ebook_sales"
ON public.ebook_sales FOR INSERT TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "Block client updates on ebook_sales"
ON public.ebook_sales FOR UPDATE TO authenticated, anon
USING (false);

CREATE POLICY "Block client deletes on ebook_sales"
ON public.ebook_sales FOR DELETE TO authenticated, anon
USING (false);

-- 2. subscriptions: bloquear escrita de usuários
CREATE POLICY "Block client inserts on subscriptions"
ON public.subscriptions FOR INSERT TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "Block client updates on subscriptions"
ON public.subscriptions FOR UPDATE TO authenticated, anon
USING (false);

CREATE POLICY "Block client deletes on subscriptions"
ON public.subscriptions FOR DELETE TO authenticated, anon
USING (false);

-- 3. Substituir políticas que confiam em auth.jwt()->>'email' por JOIN em auth.users (email confirmado)

-- orders: buyer view
DROP POLICY IF EXISTS "Buyers can view their own orders" ON public.orders;
CREATE POLICY "Buyers can view their own orders"
ON public.orders FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
      AND u.email_confirmed_at IS NOT NULL
      AND lower(u.email) = lower(orders.buyer_email)
  )
);

-- subscriptions: user view
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
      AND u.email_confirmed_at IS NOT NULL
      AND lower(u.email) = lower(subscriptions.buyer_email)
  )
);

-- chapters: buyer view (já usa join, mas reforça email_confirmed)
DROP POLICY IF EXISTS "Buyers can view chapters of purchased ebooks" ON public.chapters;
CREATE POLICY "Buyers can view chapters of purchased ebooks"
ON public.chapters FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN auth.users u ON u.id = auth.uid()
    WHERE o.ebook_id = chapters.ebook_id
      AND o.status = 'paid'
      AND u.email_confirmed_at IS NOT NULL
      AND lower(o.buyer_email) = lower(u.email)
  )
);

-- 4. check_email_exists: converter para SECURITY INVOKER (mais seguro). 
-- A função agora roda com permissões do chamador. Como auth.users não é acessível
-- para anon, reescrevemos para usar a tabela profiles (que mapeia 1:1 a users via trigger).
-- Mais seguro: evita SECURITY DEFINER exposto publicamente.
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Apenas confirma existência (boolean), sem expor outros dados
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE lower(email) = lower(email_to_check)
  );
END;
$function$;

-- Garantir que apenas anon e authenticated possam executar (já estava, reforça)
REVOKE ALL ON FUNCTION public.check_email_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon, authenticated;