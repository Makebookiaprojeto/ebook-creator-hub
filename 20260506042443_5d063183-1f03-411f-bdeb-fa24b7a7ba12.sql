-- Ajustar valores padrão para a tabela de perfis
ALTER TABLE public.profiles 
ALTER COLUMN monthly_ebook_limit SET DEFAULT 20,
ALTER COLUMN ebooks_generated_this_month SET DEFAULT 0;

-- Atualizar perfis existentes que podem estar nulos
UPDATE public.profiles 
SET monthly_ebook_limit = 20 
WHERE monthly_ebook_limit IS NULL;

UPDATE public.profiles 
SET ebooks_generated_this_month = 0 
WHERE ebooks_generated_this_month IS NULL;

-- Criar função para incrementar o contador de eBooks gerados
CREATE OR REPLACE FUNCTION public.increment_ebook_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET ebooks_generated_this_month = COALESCE(ebooks_generated_this_month, 0) + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para disparar quando um novo eBook for criado
DROP TRIGGER IF EXISTS on_ebook_created ON public.ebooks;
CREATE TRIGGER on_ebook_created
AFTER INSERT ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION public.increment_ebook_count();

-- Comentário: A lógica de reset mensal geralmente é feita via cron job no banco de dados
-- mas por agora garantimos que o incremento por criação está funcionando.
