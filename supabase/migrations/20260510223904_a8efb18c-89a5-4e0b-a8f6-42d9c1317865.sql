ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS cakto_product_id TEXT;

-- Adicionar um comentário explicativo
COMMENT ON COLUMN public.ebooks.cakto_product_id IS 'ID do produto no sistema de pagamento Cakto para liberação automática após a compra.';