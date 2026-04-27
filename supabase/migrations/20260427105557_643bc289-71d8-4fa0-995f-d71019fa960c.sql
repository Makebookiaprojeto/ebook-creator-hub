-- Remove campos legados de checkout do perfil (Stripe Connect e checkout externo)
-- Cada ebook agora tem seu próprio link de pagamento configurado individualmente

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS external_checkout_url,
  DROP COLUMN IF EXISTS stripe_account_id,
  DROP COLUMN IF EXISTS stripe_charges_enabled,
  DROP COLUMN IF EXISTS stripe_details_submitted;