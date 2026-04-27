ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS monthly_checkout_url text,
ADD COLUMN IF NOT EXISTS lifetime_checkout_url text;