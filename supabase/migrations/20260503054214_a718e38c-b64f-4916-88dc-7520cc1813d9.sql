-- 1) Remover policy anon de SELECT na tabela ebooks (expunha colunas sensíveis).
DROP POLICY IF EXISTS "Anon can read safe columns of public ebooks" ON public.ebooks;

-- 2) Restringir policy de owners em orders apenas a authenticated.
DROP POLICY IF EXISTS "Owners can view their ebook orders" ON public.orders;
CREATE POLICY "Owners can view their ebook orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = ebook_owner_id);