-- Create ebook_views table
CREATE TABLE IF NOT EXISTS public.ebook_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ebook_id UUID NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
    viewer_ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ebook_views ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can insert views" ON public.ebook_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Authors can view their ebook views" ON public.ebook_views FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.ebooks 
        WHERE ebooks.id = ebook_views.ebook_id 
        AND ebooks.user_id = auth.uid()
    )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_ebook_views_ebook_id ON public.ebook_views(ebook_id);
