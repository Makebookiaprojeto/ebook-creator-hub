-- Rename columns to match requested names
ALTER TABLE public.purchases RENAME COLUMN customer_email TO buyer_email;
ALTER TABLE public.purchases RENAME COLUMN ebook_owner_id TO seller_user_id;

-- Update RLS policies
-- Drop old policies if they exist (based on names I saw in previous migration/schema checks)
-- I need to check current policy names or just use DO block to be safe.
DO $$
BEGIN
    -- Sellers can view their own sales
    DROP POLICY IF EXISTS "Sellers can view their own sales" ON public.purchases;
    DROP POLICY IF EXISTS "Users can view their own sales" ON public.purchases;
    DROP POLICY IF EXISTS "Vendedores podem ver suas vendas" ON public.purchases;
    
    -- Buyers can view their own purchases (if they are logged in and match the email)
    DROP POLICY IF EXISTS "Buyers can view their own purchases" ON public.purchases;
    DROP POLICY IF EXISTS "Compradores podem ver suas compras" ON public.purchases;
END
$$;

-- Create new policies with updated column names
CREATE POLICY "Sellers can view their own sales" 
ON public.purchases 
FOR SELECT 
USING (auth.uid() = seller_user_id);

CREATE POLICY "Buyers can view their own purchases" 
ON public.purchases 
FOR SELECT 
USING (auth.uid() = user_id OR buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Re-enable RLS just in case
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
