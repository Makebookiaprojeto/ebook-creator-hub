
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email_param text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
    RETURN (
      SELECT id FROM auth.users
      WHERE lower(email) = lower(email_param)
      LIMIT 1
    );
END;
$function$;
