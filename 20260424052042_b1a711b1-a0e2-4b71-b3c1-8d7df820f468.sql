-- Add new fields to ebooks
ALTER TABLE public.ebooks
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS niche text,
  ADD COLUMN IF NOT EXISTS audience text;

-- Add image_url to chapters
ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS image_url text;

-- Create public storage bucket for ebook images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-images', 'ebook-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated users manage their own folder (user_id/...)
CREATE POLICY "Ebook images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'ebook-images');

CREATE POLICY "Users can upload their own ebook images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ebook-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own ebook images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ebook-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own ebook images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ebook-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);