-- Adiciona o link do PDF no ebook
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Cria uma tabela para registrar as vendas e facilitar a entrega
CREATE TABLE IF NOT EXISTS public.ebook_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ebook_id UUID REFERENCES public.ebooks(id),
    customer_email TEXT NOT NULL,
    amount_paid_cents INTEGER,
    status TEXT DEFAULT 'pending', -- pending, completed
    stripe_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilita RLS na tabela de vendas
ALTER TABLE public.ebook_sales ENABLE ROW LEVEL SECURITY;

-- Permite que o dono do ebook veja as vendas
CREATE POLICY "Owners can view sales of their ebooks" 
ON public.ebook_sales 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.ebooks 
        WHERE ebooks.id = ebook_sales.ebook_id 
        AND ebooks.user_id = auth.uid()
    )
);