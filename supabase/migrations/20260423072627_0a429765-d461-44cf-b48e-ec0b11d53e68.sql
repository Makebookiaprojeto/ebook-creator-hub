
-- Enum para status do ebook
CREATE TYPE public.ebook_status AS ENUM ('draft', 'published', 'archived');

-- Tabela de ebooks
CREATE TABLE public.ebooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cover_url TEXT,
  status public.ebook_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de capítulos
CREATE TABLE public.chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ebook_id UUID NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_ebooks_user_id ON public.ebooks(user_id);
CREATE INDEX idx_chapters_ebook_id ON public.chapters(ebook_id);
CREATE INDEX idx_chapters_user_id ON public.chapters(user_id);

-- Habilitar RLS
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ebooks
CREATE POLICY "Users can view their own ebooks"
  ON public.ebooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ebooks"
  ON public.ebooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ebooks"
  ON public.ebooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ebooks"
  ON public.ebooks FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para capítulos
CREATE POLICY "Users can view their own chapters"
  ON public.chapters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chapters"
  ON public.chapters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chapters"
  ON public.chapters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chapters"
  ON public.chapters FOR DELETE
  USING (auth.uid() = user_id);

-- Função genérica para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers
CREATE TRIGGER update_ebooks_updated_at
  BEFORE UPDATE ON public.ebooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
