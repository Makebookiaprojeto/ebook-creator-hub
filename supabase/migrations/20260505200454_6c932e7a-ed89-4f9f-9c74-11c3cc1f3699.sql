-- 1. Adicionar coluna content_json na tabela ebooks
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS content_json JSONB DEFAULT '[]'::jsonb;

-- 2. Migrar dados existentes da tabela chapters para a coluna content_json
-- Criamos um bloco anônimo para processar a migração
DO $$
DECLARE
    ebook_record RECORD;
    chapters_array JSONB;
BEGIN
    FOR ebook_record IN SELECT id FROM public.ebooks LOOP
        SELECT jsonb_agg(
            jsonb_build_object(
                'title', title,
                'content', content,
                'image_url', image_url,
                'order_index', order_index
            ) ORDER BY order_index ASC
        ) INTO chapters_array
        FROM public.chapters
        WHERE ebook_id = ebook_record.id;

        IF chapters_array IS NOT NULL THEN
            UPDATE public.ebooks SET content_json = chapters_array WHERE id = ebook_record.id;
        END IF;
    END LOOP;
END $$;

-- 3. Remover a tabela chapters (opcional, mas recomendado para evitar redundância se o usuário quiser estrutura única)
-- IMPORTANTE: Verificamos se há dados para garantir segurança, mas como estamos seguindo a instrução de "entidade única", vamos prosseguir.
-- DROP TABLE public.chapters CASCADE;
