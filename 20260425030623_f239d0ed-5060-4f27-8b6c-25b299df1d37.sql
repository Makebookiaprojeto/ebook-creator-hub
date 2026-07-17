CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ebook_id UUID NOT NULL,
  ebook_owner_id UUID NOT NULL,
  buyer_email TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'brl',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their ebook orders"
ON public.orders FOR SELECT
USING (auth.uid() = ebook_owner_id);

CREATE POLICY "Anyone can insert pending orders"
ON public.orders FOR INSERT
WITH CHECK (true);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_orders_ebook_id ON public.orders(ebook_id);
CREATE INDEX idx_orders_session ON public.orders(stripe_session_id);