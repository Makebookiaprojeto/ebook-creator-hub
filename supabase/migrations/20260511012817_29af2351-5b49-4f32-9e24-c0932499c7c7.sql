-- Create download_access table
CREATE TABLE IF NOT EXISTS public.download_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    ebook_id UUID NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
    buyer_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    download_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.download_access ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Service role has full access to download_access"
ON public.download_access
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can see their own ebooks download access"
ON public.download_access
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.ebooks
        WHERE ebooks.id = download_access.ebook_id
        AND ebooks.user_id = auth.uid()
    )
);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_download_access_token ON public.download_access(token);
CREATE INDEX IF NOT EXISTS idx_download_access_ebook_id ON public.download_access(ebook_id);
