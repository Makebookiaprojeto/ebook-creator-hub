-- 1. Tenta remover e readicionar a tabela à publicação (sem IF EXISTS que não é suportado em ALTER PUBLICATION DROP em certas versões)
DO $$
BEGIN
    -- Remove se existir (abordagem via DO block para evitar erro de sintaxe)
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;
    END IF;
    
    -- Readiciona
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
END $$;

-- 2. Garante identidade de réplica completa
ALTER TABLE public.notifications REPLICA IDENTITY FULL;