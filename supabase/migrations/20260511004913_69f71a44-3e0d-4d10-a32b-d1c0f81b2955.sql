ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS platform_session_id TEXT,
ADD COLUMN IF NOT EXISTS platform_payment_intent TEXT;

CREATE INDEX IF NOT EXISTS idx_purchases_platform_session ON public.purchases(platform_session_id);
