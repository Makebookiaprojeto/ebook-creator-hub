
ALTER TABLE public.ebooks
  ADD COLUMN IF NOT EXISTS generation_status text NOT NULL DEFAULT 'done',
  ADD COLUMN IF NOT EXISTS generation_progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS generation_error text,
  ADD COLUMN IF NOT EXISTS generation_input jsonb;

-- Index for polling queries
CREATE INDEX IF NOT EXISTS idx_ebooks_user_status ON public.ebooks(user_id, generation_status);

-- Allow realtime updates on ebooks
ALTER TABLE public.ebooks REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ebooks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ebooks;
  END IF;
END$$;
