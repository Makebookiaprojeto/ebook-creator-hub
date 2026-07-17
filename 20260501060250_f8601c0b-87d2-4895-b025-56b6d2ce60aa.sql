-- 1) FIX CRÍTICO: Remover ebooks do Realtime (vazava rascunhos privados)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'ebooks'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.ebooks';
  END IF;
END $$;

-- 2) FIX: ebook_payment_config - expor menos dados ao público
DROP POLICY IF EXISTS "Public can view payment config of public ebooks (no secret)" ON public.ebook_payment_config;

-- Criar uma view segura que expõe apenas o checkout_url para ebooks públicos
CREATE OR REPLACE VIEW public.public_ebook_checkout AS
SELECT
  epc.ebook_id,
  epc.checkout_url
FROM public.ebook_payment_config epc
JOIN public.ebooks e ON e.id = epc.ebook_id
WHERE e.is_public = true;

GRANT SELECT ON public.public_ebook_checkout TO anon, authenticated;

-- 3) FIX: Permitir que usuários deletem suas próprias configs de pagamento
CREATE POLICY "Users can delete their own payment configs"
ON public.user_payment_configs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4) FIX: Restringir EXECUTE das funções SECURITY DEFINER sensíveis
-- Remove acesso público/anon e mantém apenas authenticated + service_role onde faz sentido

-- Funções administrativas: apenas service_role
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_template_use(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.find_active_template_by_niche(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_public_ebook_pdf_url(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.check_email_exists(text) FROM PUBLIC, anon;

-- Manter acesso para usuários autenticados nas funções que eles precisam usar
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_ebook_pdf_url(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_active_template_by_niche(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_template_use(uuid) TO authenticated;

-- check_email_exists fica disponível para anon (necessário para fluxo de signup/recuperação)
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon, authenticated;