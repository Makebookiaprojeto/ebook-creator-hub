-- First, ensure there are no duplicates that would prevent constraint creation
-- If duplicates exist, we keep the most recent one
DELETE FROM public.purchases p1
USING public.purchases p2
WHERE p1.id > p2.id 
  AND p1.platform_transaction_id = p2.platform_transaction_id 
  AND p1.platform_transaction_id IS NOT NULL;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'purchases_platform_transaction_id_key'
    ) THEN
        ALTER TABLE public.purchases 
        ADD CONSTRAINT purchases_platform_transaction_id_key UNIQUE (platform_transaction_id);
    END IF;
END $$;

-- Grant permissions (standard procedure)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
