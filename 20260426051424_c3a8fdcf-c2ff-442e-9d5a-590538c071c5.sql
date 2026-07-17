CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = email_to_check
  );
END;
$$;

-- Garantir que usuários não autenticados possam chamar a função (necessário para a tela de cadastro)
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon, authenticated;