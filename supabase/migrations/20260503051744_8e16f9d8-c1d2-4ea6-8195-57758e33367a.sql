-- Função para incrementar o contador de ebooks gerados no perfil
CREATE OR REPLACE FUNCTION public.increment_ebook_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET ebooks_generated_this_month = COALESCE(ebooks_generated_this_month, 0) + 1,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para chamar a função após a inserção de um novo ebook
DROP TRIGGER IF EXISTS on_ebook_created ON public.ebooks;
CREATE TRIGGER on_ebook_created
AFTER INSERT ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION public.increment_ebook_usage();
