-- Adicionar colunas de limite de ebooks à tabela de perfis
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS monthly_ebook_limit INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS ebooks_generated_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_ebook_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Garantir que os valores não sejam negativos
ALTER TABLE public.profiles 
ADD CONSTRAINT check_ebook_limit_positive CHECK (monthly_ebook_limit >= 0),
ADD CONSTRAINT check_ebook_usage_positive CHECK (ebooks_generated_this_month >= 0);
