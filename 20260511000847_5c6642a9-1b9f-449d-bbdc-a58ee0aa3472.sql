-- Recreate the public_ebooks view to include checkout fields
CREATE OR REPLACE VIEW public.public_ebooks AS
 SELECT id,
    user_id,
    title,
    subtitle,
    description,
    category,
    niche,
    audience,
    author_name,
    cover_url,
    slug,
    is_public,
    price_cents,
    sales_pitch,
    status,
    created_at,
    updated_at,
    cakto_checkout_url,
    payment_platform
   FROM ebooks
  WHERE is_public = true;
