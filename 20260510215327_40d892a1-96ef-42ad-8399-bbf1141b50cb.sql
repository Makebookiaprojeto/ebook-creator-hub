-- Função para buscar o ID do usuário pelo e-mail com segurança (rodando no backend)
CREATE OR REPLACE FUNCTION get_user_id_by_email(email_param TEXT)
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM auth.users WHERE email = email_param LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Garante que não haja duplicatas de compras para o mesmo ebook e cliente
ALTER TABLE public.purchases ADD CONSTRAINT unique_purchase_ebook_customer UNIQUE (ebook_id, customer_email);
