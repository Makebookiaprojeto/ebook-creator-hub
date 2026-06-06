-- 1. Garante que a tabela use REPLICA IDENTITY FULL
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- 2. Reinicia a publicação usando um bloco anônimo para evitar erros de sintaxe de DROP IF EXISTS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;
    END IF;
    
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
END $$;

-- 3. Garante privilégios de SELECT
GRANT SELECT ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- 4. Notifica o PostgREST
NOTIFY pgrst, 'reload schema';