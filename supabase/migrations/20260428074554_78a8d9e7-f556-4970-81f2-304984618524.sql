-- Create user_payment_configs table
CREATE TABLE public.user_payment_configs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    payment_platform TEXT DEFAULT 'cakto',
    checkout_url TEXT,
    product_id TEXT,
    webhook_secret TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_payment_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payment configs"
ON public.user_payment_configs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment configs"
ON public.user_payment_configs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment configs"
ON public.user_payment_configs
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_payment_configs_updated_at
BEFORE UPDATE ON public.user_payment_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();