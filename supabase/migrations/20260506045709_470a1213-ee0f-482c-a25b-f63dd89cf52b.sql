-- Função para resetar o limite mensal quando o mês mudar
CREATE OR REPLACE FUNCTION public.reset_monthly_limit_on_new_month()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o mês/ano do last_ebook_reset_at for diferente de agora, reseta o contador
    IF NEW.last_ebook_reset_at IS NULL OR 
       EXTRACT(MONTH FROM NEW.last_ebook_reset_at) != EXTRACT(MONTH FROM now()) OR
       EXTRACT(YEAR FROM NEW.last_ebook_reset_at) != EXTRACT(YEAR FROM now()) THEN
        NEW.ebooks_generated_this_month := 0;
        NEW.last_ebook_reset_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Aplicar o trigger de reset na tabela profiles
DROP TRIGGER IF EXISTS trigger_reset_monthly_limit ON public.profiles;
CREATE TRIGGER trigger_reset_monthly_limit
BEFORE UPDATE OR INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.reset_monthly_limit_on_new_month();

-- Função para verificar o limite antes de inserir um ebook
CREATE OR REPLACE FUNCTION public.check_monthly_ebook_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_current_count INTEGER;
    v_limit INTEGER;
BEGIN
    -- Busca os dados do perfil
    SELECT ebooks_generated_this_month, monthly_ebook_limit 
    INTO v_current_count, v_limit
    FROM public.profiles 
    WHERE user_id = NEW.user_id;

    -- Se atingiu o limite, bloqueia a inserção
    IF v_current_count >= v_limit THEN
        RAISE EXCEPTION 'Limite mensal de % ebooks atingido.', v_limit
        USING ERRCODE = 'P0001'; -- Custom error code for app to catch
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para validar limite na tabela ebooks
DROP TRIGGER IF EXISTS trigger_check_ebook_limit ON public.ebooks;
CREATE TRIGGER trigger_check_ebook_limit
BEFORE INSERT ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION public.check_monthly_ebook_limit();

-- Atualizar a função de incremento para garantir que ela use o perfil correto
CREATE OR REPLACE FUNCTION public.increment_ebook_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET ebooks_generated_this_month = COALESCE(ebooks_generated_this_month, 0) + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Garantir que o trigger de incremento exista
DROP TRIGGER IF EXISTS on_ebook_created ON public.ebooks;
CREATE TRIGGER on_ebook_created
AFTER INSERT ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION public.increment_ebook_count();
