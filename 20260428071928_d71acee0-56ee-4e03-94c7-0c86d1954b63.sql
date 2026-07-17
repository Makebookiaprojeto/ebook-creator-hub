
-- ============================================================
-- FIX 4: Mover webhook_secret para tabela isolada
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ebook_webhook_secrets (
  ebook_id uuid PRIMARY KEY,
  owner_id uuid NOT NULL,
  webhook_secret text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ebook_webhook_secrets ENABLE ROW LEVEL SECURITY;

-- Apenas o dono lê
CREATE POLICY "Owners read their webhook secret"
ON public.ebook_webhook_secrets FOR SELECT TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Owners insert their webhook secret"
ON public.ebook_webhook_secrets FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners update their webhook secret"
ON public.ebook_webhook_secrets FOR UPDATE TO authenticated
USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners delete their webhook secret"
ON public.ebook_webhook_secrets FOR DELETE TO authenticated
USING (auth.uid() = owner_id);

-- Migra dados existentes
INSERT INTO public.ebook_webhook_secrets (ebook_id, owner_id, webhook_secret)
SELECT ebook_id, owner_id, webhook_secret 
FROM public.ebook_payment_config 
WHERE webhook_secret IS NOT NULL
ON CONFLICT (ebook_id) DO NOTHING;

-- Remove coluna sensível da tabela original
ALTER TABLE public.ebook_payment_config DROP COLUMN webhook_secret;

-- Remove view pública (não precisa mais agora)
DROP VIEW IF EXISTS public.ebook_payment_config_public;

-- ============================================================
-- FIX 5: Bloqueia auto-modificação de quota (monthly_ebook_limit)
-- ============================================================
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND monthly_ebook_limit = (SELECT monthly_ebook_limit FROM public.profiles WHERE user_id = auth.uid())
  AND ebooks_generated_this_month = (SELECT ebooks_generated_this_month FROM public.profiles WHERE user_id = auth.uid())
  AND last_ebook_reset_at IS NOT DISTINCT FROM (SELECT last_ebook_reset_at FROM public.profiles WHERE user_id = auth.uid())
);

-- ============================================================
-- FIX 6: Remove política redundante de admin em ebook_templates
-- ============================================================
DROP POLICY IF EXISTS "Admins manage templates - select" ON public.ebook_templates;
-- A política "Users can view active templates" já cobre o uso real
-- e a política "Admins can manage templates" (FOR ALL) cobre admins
