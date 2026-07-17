-- Adiciona colunas para identificação externa na tabela de ebooks
ALTER TABLE public.ebooks 
ADD COLUMN IF NOT EXISTS external_product_id TEXT,
ADD COLUMN IF NOT EXISTS payment_platform TEXT;

-- Cria a tabela de compras (purchases)
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    ebook_id UUID REFERENCES public.ebooks(id) NOT NULL,
    customer_email TEXT NOT NULL,
    amount_paid_cents INTEGER,
    status TEXT NOT NULL DEFAULT 'paid',
    platform TEXT,
    platform_transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilita RLS na tabela de compras
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela de compras
CREATE POLICY "Usuários podem ver suas próprias compras por user_id" 
ON public.purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver suas compras pelo e-mail" 
ON public.purchases 
FOR SELECT 
USING (auth.jwt() ->> 'email' = customer_email);

-- Trigger para atualizar timestamps
CREATE TRIGGER update_purchases_updated_at
BEFORE UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para busca rápida por product_id e plataforma
CREATE INDEX IF NOT EXISTS idx_ebooks_external_id ON public.ebooks(external_product_id, payment_platform);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON public.purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
