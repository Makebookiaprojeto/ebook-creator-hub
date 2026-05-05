-- Make user_id optional in ebooks table
ALTER TABLE public.ebooks ALTER COLUMN user_id DROP NOT NULL;
