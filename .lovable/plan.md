# Plano: Novos templates premium para os 20 nichos

## Resumo
Manter os 20 registros em `ebook_templates` (mesmos IDs, mesmos nichos) e fazer apenas UPDATE do conteúdo: novo título, novo `cover_url`, novo `cover_prompt` e `chapters` reescrito (5 capítulos, 80–120 palavras cada, sem sumário/intro/conclusão). Gerar 120 imagens premium via Lovable AI (`openai/gpt-image-2`), enviar para o bucket `ebook-images` e referenciar pela URL pública. Ajustar o gerador de PDF para o novo layout (fundo branco, preto, detalhe turquesa, imagem grande à esquerda + título e texto curto à direita).

## Etapas

### 1. Curadoria de conteúdo (script único)
- Para cada um dos 20 nichos, definir manualmente no script:
  - Título exclusivo do ebook.
  - 5 títulos de capítulo + 1 descrição curta (80–120 palavras) cada.
  - Prompt visual para capa e prompt visual para cada capítulo (fotografia editorial premium, fundo branco, paleta neutra, detalhe turquesa #00CED1).
- Sem reaproveitamento entre nichos.

### 2. Geração e upload das imagens (script Node em `scripts/regen-templates.ts`)
- 120 imagens (20 capas + 100 capítulos), 1024×1024, `quality: "high"`, modelo `openai/gpt-image-2`, não-stream (resposta JSON única).
- Decodificar `b64_json`, fazer upload em `ebook-images/templates/<niche-slug>/cover.png` e `chapter-1..5.png` via service role.
- Coletar a `publicUrl` de cada upload.

### 3. UPDATE dos 20 templates (uma migração `supabase--insert`)
- Para cada nicho, `UPDATE ebook_templates SET title, subtitle, cover_url, cover_prompt, chapters=jsonb` mantendo o `id` original.
- `chapters` = array de 5 objetos `{title, subtitle:"", content, image_url}`.

### 4. Refator do PDF (`src/lib/ebookPdf.ts`)
- Fundo branco puro, texto preto, accent turquesa `#00CED1`.
- Capa: imagem full-bleed + título grande embaixo, sem autor/subtítulo extra.
- Remover página de sumário/introdução/conclusão.
- Cada capítulo: página única landscape-feel — imagem grande à esquerda (~45% largura), título preto bold + barra turquesa + parágrafo curto à direita.
- Tipografia: Helvetica bold para títulos, regular para corpo, espaçamento amplo.

### 5. Ajuste leve no preview (`src/components/EbookPreview.tsx`)
- Renderizar capítulos no mesmo padrão visual (imagem esquerda, texto direita) para o preview do app refletir o PDF.

### 6. Verificação
- `psql` confere que os 20 templates têm 5 capítulos com `image_url` e `cover_url` apontando para o bucket.
- `bun run build` (executado automaticamente).
- Não tocar em: auth, vendas, dashboard, edge functions de geração, RLS, ou estrutura de nichos.

## Detalhes técnicos
- Modelo de imagem: `openai/gpt-image-2`, `size: "1024x1024"`, `quality: "high"`, `n: 1`, sem stream — resposta única `data[0].b64_json`.
- Upload usa `SUPABASE_SERVICE_ROLE_KEY` dentro do script local (Node), apenas para o seed; nenhuma credencial vai para o cliente.
- Conteúdo do capítulo continua suportando o markdown atual (`##`, `-`), mas vou manter parágrafos curtos sem bullets para o visual limpo pedido.
- Custo aproximado: 120 imagens premium — confirmado pelo usuário.

## Fora de escopo
Auth, vendas, dashboard, biblioteca, perfil, suporte, páginas externas, edge functions, RLS e qualquer lógica de geração do usuário final permanecem intactas.
