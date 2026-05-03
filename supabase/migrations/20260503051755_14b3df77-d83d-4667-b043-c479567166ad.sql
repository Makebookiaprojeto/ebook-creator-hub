-- Revogar execução pública para segurança
REVOKE EXECUTE ON FUNCTION public.increment_ebook_usage() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_ebook_usage() FROM anon, authenticated;

-- Atualizar a função com search_path seguro
CREATE OR REPLACE FUNCTION public.increment_ebook_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET ebooks_generated_this_month = COALESCE(ebooks_generated_this_month, 0) + 1,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
