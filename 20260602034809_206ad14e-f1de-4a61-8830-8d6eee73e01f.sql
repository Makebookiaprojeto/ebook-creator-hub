-- Drop the trigger from profiles
DROP TRIGGER IF EXISTS trigger_reset_monthly_limit ON public.profiles;

-- Drop the reset function
DROP FUNCTION IF EXISTS public.reset_monthly_limit_on_new_month();