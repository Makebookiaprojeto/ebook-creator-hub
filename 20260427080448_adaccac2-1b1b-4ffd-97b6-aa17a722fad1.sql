
-- Subscriptions table for Monthly/Lifetime plans
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  buyer_email TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'lifetime')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'canceled')),
  cakto_transaction_id TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR lower(buyer_email) = lower((auth.jwt() ->> 'email'))
  );

CREATE INDEX idx_subscriptions_email ON public.subscriptions (lower(buyer_email));
CREATE INDEX idx_subscriptions_user ON public.subscriptions (user_id);

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add Cakto product ID to ebooks for webhook routing
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS cakto_product_id TEXT UNIQUE;

-- Add cakto_transaction_id to orders for idempotency
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cakto_transaction_id TEXT UNIQUE;
