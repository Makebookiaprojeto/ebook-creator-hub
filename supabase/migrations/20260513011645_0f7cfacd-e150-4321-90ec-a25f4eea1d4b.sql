CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = _user_id AND role = _role::public.app_role
    );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, anon, service_role;