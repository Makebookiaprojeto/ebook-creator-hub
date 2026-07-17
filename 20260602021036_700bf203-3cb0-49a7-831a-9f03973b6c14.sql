-- First, ensure the user has the admin role in the database
INSERT INTO public.user_roles (user_id, role)
VALUES ('245a57a5-82d7-428f-af2b-edfcc425bd12', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Second, ensure the user has an active subscription so they aren't redirected to /planos
INSERT INTO public.subscriptions (user_id, plan_type, status, buyer_email)
VALUES ('245a57a5-82d7-428f-af2b-edfcc425bd12', 'lifetime', 'active', 'rodrigodalves331@gmail.com')
ON CONFLICT DO NOTHING;