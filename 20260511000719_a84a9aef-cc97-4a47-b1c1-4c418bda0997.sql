-- 1. Add missing columns to purchases
ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';

-- 2. Migrate data from orders to purchases (only those with email, avoiding duplicates)
-- Note: using a subquery to avoid unique constraint violations on ID if any exist
INSERT INTO public.purchases (
  id, 
  ebook_id, 
  ebook_owner_id, 
  customer_email, 
  amount_paid_cents, 
  currency, 
  status, 
  platform, 
  platform_transaction_id, 
  created_at, 
  updated_at
)
SELECT 
  id, 
  ebook_id, 
  ebook_owner_id, 
  buyer_email, 
  amount_cents, 
  currency, 
  status, 
  platform, 
  platform_transaction_id, 
  created_at, 
  updated_at
FROM public.orders
WHERE buyer_email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 3. Drop redundant tables and views
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.ebook_sales CASCADE;
DROP VIEW IF EXISTS public.public_ebook_checkout CASCADE;
DROP TABLE IF EXISTS public.ebook_payment_config CASCADE;

-- 4. Fix RLS for purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist to avoid errors
DROP POLICY IF EXISTS "Ebook owners can view their sales" ON public.purchases;
DROP POLICY IF EXISTS "Customers can view their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Anyone can insert purchases" ON public.purchases;

-- Policy: Owners can see all sales for their ebooks
CREATE POLICY "Ebook owners can view their sales" 
ON public.purchases 
FOR SELECT 
TO authenticated 
USING (auth.uid() = ebook_owner_id);

-- Policy: Customers can see their own purchases (linked by user_id or email)
CREATE POLICY "Customers can view their own purchases" 
ON public.purchases 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id 
  OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
