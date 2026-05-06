-- Allow public access to view published ebooks
CREATE POLICY "Anyone can view public ebooks"
ON public.ebooks
FOR SELECT
USING (is_public = true);

-- Allow public access to view payment configurations for public ebooks
-- First for the user_payment_configs (author's global checkout link)
CREATE POLICY "Anyone can view author checkout links"
ON public.user_payment_configs
FOR SELECT
USING (true); -- We only select checkout_url in the code, but the policy allows viewing the config.

-- Then for the ebook_payment_config (ebook-specific checkout link)
CREATE POLICY "Anyone can view ebook checkout links"
ON public.ebook_payment_config
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM ebooks 
  WHERE ebooks.id = ebook_payment_config.ebook_id 
  AND ebooks.is_public = true
));
