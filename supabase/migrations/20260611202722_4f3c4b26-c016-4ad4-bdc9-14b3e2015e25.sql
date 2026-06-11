-- Ajustando funções SECURITY DEFINER para incluir search_path e reforçar segurança
ALTER FUNCTION public.get_user_id_by_email(text) SET search_path = public, auth;
ALTER FUNCTION public.has_role(uuid, text) SET search_path = public;
ALTER FUNCTION public.set_lifetime_by_email(text) SET search_path = public, auth;
ALTER FUNCTION public.handle_lifetime_on_profile_creation() SET search_path = public, auth;
ALTER FUNCTION public.ensure_profile_exists(uuid, text) SET search_path = public;
ALTER FUNCTION public.handle_new_sale_notification() SET search_path = public;

-- Ajustando funções de trigger para garantir search_path
ALTER FUNCTION public.increment_ebook_count() SET search_path = public;
ALTER FUNCTION public.ebooks_set_slug() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- Nota: SECURITY DEFINER em funções como 'get_user_id_by_email' é necessário para acessar a tabela 'auth.users',
-- mas agora elas estão protegidas com um search_path explícito.

-- Verificando e reforçando RLS em tabelas que podem ter políticas muito permissivas
-- (Apenas ajustes de segurança, sem mudar a lógica de negócio)
DO $$ 
BEGIN
    -- Exemplo de reforço: garantir que tabelas críticas tenham RLS habilitado
    ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.ebooks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
END $$;
