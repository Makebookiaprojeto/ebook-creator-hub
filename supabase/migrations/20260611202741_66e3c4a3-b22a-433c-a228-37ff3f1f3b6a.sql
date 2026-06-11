-- Revogar acesso público de funções administrativas
REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.set_lifetime_by_email(text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.ensure_profile_exists(uuid, text) FROM public, anon;

-- Conceder permissão apenas para papéis autenticados ou service_role onde necessário
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(uuid, text) TO authenticated, service_role;
-- 'set_lifetime_by_email' deve ser restrita apenas ao service_role (administração)
GRANT EXECUTE ON FUNCTION public.set_lifetime_by_email(text) TO service_role;

-- Se houverem visões SECURITY DEFINER, o ideal é recriá-las como SECURITY INVOKER (padrão)
-- Note: Information schema não mostrou o código das visões antes, mas aplicamos a política geral.
-- Para as visões 'public_ebooks' e 'user_access_status', garantimos que elas respeitem o RLS das tabelas base.
ALTER VIEW IF EXISTS public.public_ebooks SET (security_invoker = on);
ALTER VIEW IF EXISTS public.user_access_status SET (security_invoker = on);
