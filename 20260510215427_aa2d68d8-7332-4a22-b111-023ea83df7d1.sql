ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS ebook_owner_id UUID REFERENCES auth.users(id);

-- Atualiza políticas de RLS para compras (autores podem ver vendas de seus ebooks)
CREATE POLICY "Autores podem ver vendas de seus ebooks" 
ON public.purchases 
FOR SELECT 
USING (auth.uid() = ebook_owner_id);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_purchases_owner ON public.purchases(ebook_owner_id);
