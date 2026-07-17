-- Tabela de templates de ebooks por nicho (gerenciada por admins)
CREATE TABLE public.ebook_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  niche TEXT NOT NULL,
  audience TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  cover_prompt TEXT,
  chapters JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- chapters = [{ title, subtitle, content }]
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ebook_templates_niche ON public.ebook_templates (lower(niche));
CREATE INDEX idx_ebook_templates_active ON public.ebook_templates (is_active);

ALTER TABLE public.ebook_templates ENABLE ROW LEVEL SECURITY;

-- Apenas admins gerenciam templates
CREATE POLICY "Admins manage templates - select"
ON public.ebook_templates FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins manage templates - insert"
ON public.ebook_templates FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage templates - update"
ON public.ebook_templates FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage templates - delete"
ON public.ebook_templates FOR DELETE TO authenticated
USING (public.is_admin());

-- Trigger updated_at
CREATE TRIGGER trg_ebook_templates_updated_at
BEFORE UPDATE ON public.ebook_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função SECURITY DEFINER para o backend (edge function) buscar template
-- por nicho sem precisar bypassar RLS no client. Apenas leitura, retorna
-- apenas templates ativos. Acessível só via service_role.
CREATE OR REPLACE FUNCTION public.find_active_template_by_niche(_niche TEXT)
RETURNS TABLE (
  id UUID,
  niche TEXT,
  audience TEXT,
  title TEXT,
  subtitle TEXT,
  cover_prompt TEXT,
  chapters JSONB
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, niche, audience, title, subtitle, cover_prompt, chapters
  FROM public.ebook_templates
  WHERE is_active = true
    AND lower(niche) = lower(_niche)
  ORDER BY use_count ASC, created_at DESC
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.find_active_template_by_niche(TEXT) FROM PUBLIC, anon, authenticated;

-- Função para incrementar contador de uso
CREATE OR REPLACE FUNCTION public.increment_template_use(_template_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.ebook_templates
  SET use_count = use_count + 1
  WHERE id = _template_id;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_template_use(UUID) FROM PUBLIC, anon, authenticated;