# Plano: 4 templates por nicho com rotação determinística

## Escopo
- Manter os 20 templates atuais intactos (Template 1 de cada nicho).
- Criar 60 novos templates (3 por nicho × 20 nichos) com título, subtítulo, capa e 5 capítulos (~450 palavras cada) — mesmo padrão "white paper" preto/branco/verde já em uso.
- Implementar rotação 1→2→3→4→1 por nicho, persistida no banco, sem alterar UI nem fluxo do usuário.

## Mudanças no banco (1 migração)
1. `ALTER TABLE ebook_templates ADD COLUMN variant_index int NOT NULL DEFAULT 1` — identifica 1..4 dentro do mesmo nicho.
2. `ALTER TABLE ebook_templates ADD CONSTRAINT ebook_templates_niche_variant_unique UNIQUE (lower(niche), variant_index)` (via índice único).
3. Nova tabela `public.niche_template_cursor`:
   - `niche text primary key`
   - `last_variant int not null default 0`
   - `updated_at timestamptz default now()`
   - GRANT + RLS: leitura/escrita só para `service_role` (atualizada pela edge function).
4. Nova RPC `public.pick_next_template_for_niche(_niche text)` (SECURITY DEFINER):
   - Faz `INSERT ... ON CONFLICT DO UPDATE SET last_variant = (last_variant % 4) + 1 RETURNING last_variant`.
   - Retorna o template ativo com `lower(niche) = lower(_niche) AND variant_index = last_variant` (fallback para o de menor `variant_index` se faltar variante).
5. Marcar todos os 20 templates atuais com `variant_index = 1`.

## Conteúdo dos 60 novos templates
- Arquivo `scripts/templates-content-v2.ts` (novo): para cada nicho × variantes 2, 3, 4:
  - Título e subtítulo distintos do Template 1.
  - 5 capítulos (~450 palavras cada) com abordagens diferentes (ex.: nicho "Finanças" → variante 2 foca em investimentos, 3 em controle de dívidas, 4 em renda passiva).
  - Prompts/queries Pexels específicos por capa e por capítulo (4K, contextuais).
- Script `scripts/seed-template-variants.ts`:
  - Baixa imagens via Pexels API (chave já existente), faz upload para o bucket `ebook-images/templates/<slug>/v<n>/...`.
  - `INSERT INTO ebook_templates` os 60 registros com `variant_index` 2/3/4 e `is_active=true`.
  - Idempotente: se já existir variante daquele nicho, faz UPDATE.

## Integração com a geração
- `supabase/functions/personalize-template/index.ts`: substituir a chamada atual a `find_active_template_by_niche` por `pick_next_template_for_niche` (mesmo shape de retorno; só muda a função RPC).
- Nada mais é alterado: prompts, geração de conteúdo do usuário, PDF, preview, sales page, dashboard, auth, planos — todos permanecem idênticos.

## Validação
- `psql`: confirmar 20 nichos × 4 variantes = 80 linhas com `is_active=true` e `cover_url` + 5 capítulos com `image_url`.
- Chamar `pick_next_template_for_niche('Finanças')` 5 vezes seguidas e verificar a sequência 2→3→4→1→2 (começa em 2 porque Template 1 acabou de ser fornecido na lógica de cursor inicial — o cursor parte de 0, primeiro retorno = 1).
- Build automático do projeto.

## Fora de escopo
UI, autenticação, pagamentos, dashboard, sales page, layout, estilos, Step 1–5 do app, edge functions além do `personalize-template`.

## Custo / tempo
- 60 templates × 6 imagens Pexels = ~360 downloads + uploads para o Storage. Pexels é gratuito; o gargalo é tempo de execução do script (~10–15 min).
- Geração do texto dos capítulos é estática (escrita por mim no `templates-content-v2.ts`), sem chamadas a IA — controle total de qualidade, custo zero.

Confirma para eu executar?