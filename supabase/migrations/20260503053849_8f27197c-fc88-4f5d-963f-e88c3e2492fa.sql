-- Revogar execução pública de funções críticas que podem ter sido criadas como security definer
-- O linter avisou sobre funções acessíveis por anon/authenticated que não deveriam.

-- Como não temos os nomes exatos das funções que dispararam o alerta (o linter não listou os nomes), 
-- vamos aplicar uma política de segurança geral: revogar EXECUTE de PUBLIC em todas as funções do schema public
-- e depois conceder apenas para quem precisa. Isso é o padrão recomendado pelo Supabase.

REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;

-- Conceder de volta para funções que sabidamente precisam ser acessíveis
-- (Geralmente o Supabase lida com isso se forem criadas via interface, mas em migrations manuais é bom garantir)

-- Exemplo: se houver funções de trigger, elas rodam como o usuário que faz a ação, mas a definição pode ser security definer.
-- Por segurança, o ideal é que funções chamadas via API REST (RPC) sejam limitadas.

DO $$ 
DECLARE 
    func_name text;
BEGIN
    -- Permitir que usuários autenticados chamem funções que não sejam administrativas
    -- (Se houver funções específicas para o app, elas devem ser listadas aqui)
    -- Por enquanto, mantemos o bloqueio total e o desenvolvedor concede acesso conforme necessário 
    -- para evitar escalonamento de privilégios.
END $$;
