-- Drop the trigger first
DROP TRIGGER IF EXISTS trigger_check_ebook_limit ON public.ebooks;

-- Drop the function
DROP FUNCTION IF EXISTS public.check_monthly_ebook_limit();