ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS unique_purchase_ebook_customer;
ALTER TABLE public.purchases ADD CONSTRAINT unique_purchase_ebook_buyer UNIQUE (ebook_id, buyer_email);

-- Also update indexes if they were using old names
DROP INDEX IF EXISTS idx_purchases_email;
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_email ON public.purchases(buyer_email);

DROP INDEX IF EXISTS idx_purchases_owner;
CREATE INDEX IF NOT EXISTS idx_purchases_seller_user ON public.purchases(seller_user_id);
