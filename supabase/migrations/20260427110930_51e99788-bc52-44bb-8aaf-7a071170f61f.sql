ALTER TABLE public.ebook_sales REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ebook_sales;