-- Re-conceder execução para funções que são usadas em RLS e na API pública
-- O comando anterior REVOKE foi agressivo demais e quebrou o RLS.

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Especificamente para funções SECURITY DEFINER que precisam de acesso controlado,
-- o Supabase já gerencia as permissões se forem criadas corretamente,
-- mas aqui garantimos que o app possa funcionar.

-- Se houver funções administrativas sensíveis, elas devem ser movidas para outro schema
-- ou ter o acesso revogado especificamente, em vez de um bloqueio global que quebra o sistema.
