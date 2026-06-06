-- Garante que a tabela está na publicação do Realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;
END $$;

-- Garante identidade de réplica completa para payloads detalhados
ALTER TABLE public.notifications REPLICA IDENTITY FULL;