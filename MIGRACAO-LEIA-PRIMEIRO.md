# Guia de migração: sair do Supabase antigo (Lovable) para um Supabase 100% seu

## O que já foi feito neste pacote
- `supabase/functions/generate-ebook`, `personalize-template` e `generate-template-draft`:
  trocado o gateway de IA da Lovable pela **API oficial gratuita do Google Gemini**
  (mesmos modelos que já eram usados: `gemini-2.5-flash` e `gemini-2.5-flash-lite`).
  Agora usam a variável de ambiente `GEMINI_API_KEY` em vez de `LOVABLE_API_KEY`.
- Removida a integração `src/integrations/lovable` e a dependência
  `@lovable.dev/cloud-auth-js` do `package.json` (não eram usadas em lugar nenhum
  do app — o login é 100% e-mail/senha via Supabase Auth padrão).
- Criado `.env.example` com as 3 variáveis que o frontend precisa.

## Passo a passo

### 1. Criar sua chave grátis do Gemini
- Acesse https://aistudio.google.com/apikey (login com conta Google)
- Clique em "Create API key" — é grátis, tem cota diária generosa, sem cartão de crédito.
- Guarde essa chave, vai virar o secret `GEMINI_API_KEY`.

### 2. Criar o novo projeto Supabase
- Crie uma conta em https://supabase.com (sua, pessoal — sem depender de ninguém)
- "New Project" → escolha nome, senha do banco e região (ex: São Paulo/`sa-east-1`)
- Guarde a senha do banco em local seguro.

### 3. Instalar a CLI do Supabase e logar
```bash
npm install -g supabase
supabase login
```

### 4. Linkar este projeto ao novo Supabase
Dentro da pasta do projeto:
```bash
supabase link --project-ref SEU_NOVO_PROJECT_REF
```
(o `PROJECT_REF` aparece na URL do painel: `supabase.com/dashboard/project/AQUI`)

### 5. Recriar TODO o banco (schema, tabelas, RLS, functions, buckets)
```bash
supabase db push
```
Isso executa as 129 migrations em ordem e recria a estrutura inteira do banco,
incluindo os buckets de Storage (`ebook-images`, etc.) que já estavam definidos
via SQL nas migrations.

### 6. Repopular o catálogo de templates de ebook (o conteúdo em si)
O texto de todos os templates está salvo em `scripts/templates-content.ts`.
Rode nesta ordem (defina as env vars do NOVO projeto antes):
```bash
export SUPABASE_URL=https://seu-novo-project-id.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key   # Project Settings > API
export PEXELS_API_KEY=sua-chave-pexels                   # grátis em pexels.com/api

bun run scripts/fetch-pexels-images.ts        # busca e sobe as imagens
bun run scripts/apply-template-updates.ts     # cria os 20 templates base (variante 1)
bun run scripts/seed-template-variants.ts     # gera as variantes 2, 3 e 4 (sem IA)
```
(Se não tiver `bun` instalado: `npm i -g bun`)

### 7. Configurar os secrets das edge functions
```bash
supabase secrets set GEMINI_API_KEY=xxx
supabase secrets set PEXELS_API_KEY=xxx
supabase secrets set RESEND_API_KEY=xxx
supabase secrets set STRIPE_SECRET_KEY=xxx
supabase secrets set CAKTO_WEBHOOK_SECRET=xxx
supabase secrets set APPLYFY_WEBHOOK_TOKEN=xxx
supabase secrets set IRONPAY_WEBHOOK_TOKEN=xxx
```
> `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` NÃO precisam ser setados manualmente —
> o Supabase já injeta essas duas automaticamente dentro das edge functions.

**Importante**: essas chaves (Stripe, Resend, Cakto, Applyfy, Ironpay) são das
suas contas nesses serviços — não estavam no GitHub por segurança. Se você ainda
tem acesso a essas contas, pegue as chaves lá. Se alguma delas foi criada pela
empresa antiga e você não tem acesso, será preciso gerar uma nova / trocar de provedor.

### 8. Deploy das edge functions
```bash
supabase functions deploy generate-ebook
supabase functions deploy generate-template-draft
supabase functions deploy personalize-template
supabase functions deploy search-facebook-groups
supabase functions deploy send-ebook-email
supabase functions deploy send-support-email
supabase functions deploy verify-payment
supabase functions deploy webhook-applyfy
supabase functions deploy webhook-ironpay
supabase functions deploy webhook-payment
supabase functions deploy download-ebook
```

### 9. Atualizar o frontend com os dados do novo projeto
Copie `.env.example` para `.env` e preencha com os dados do novo projeto
(Project Settings > API):
```
VITE_SUPABASE_PROJECT_ID=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...   # a chave "anon public"
```

### 10. Rebuild e publicar na Hostinger
```bash
npm install
npm run build
```
Isso gera a pasta `dist/`. Suba o conteúdo dela para a Hostinger (via File
Manager ou FTP), do mesmo jeito que você fazia antes.

### 11. Configurar Auth no painel do novo Supabase
Isso não vem nas migrations (é config do projeto, não do banco):
- Authentication > URL Configuration: coloque a URL do seu site (Site URL e
  Redirect URLs) na Hostinger.
- Se usa confirmação de e-mail, personalize o template em Authentication > Email Templates.

### 12. Webhooks externos (Stripe/Cakto/Applyfy/Ironpay)
As URLs dos webhooks mudam (novo domínio do projeto Supabase). Atualize a URL
de destino de cada webhook no painel de cada um desses serviços de pagamento
para apontar para:
`https://seu-novo-project-id.supabase.co/functions/v1/webhook-xxx`

## O que NÃO é possível recuperar
- **Usuários já cadastrados e dados gerados durante o período em que o site
  esteve no ar** (ebooks que clientes geraram, histórico de compras) — isso
  vivia só no banco antigo e você confirmou não ter mais nenhum acesso a ele.
  O catálogo de templates (o produto em si) está 100% recuperável pelo passo 6; 
  o que se perde é o histórico de uso/vendas anteriores.
- Chaves de API de terceiros (Stripe etc.) que só a empresa antiga tinha.

## Dica
Toda essa sequência de comandos (passos 3 a 8) pode ser executada automaticamente
por você usando o **Claude Code** no seu computador — ele roda os comandos de
terminal reais com suas credenciais, o que eu não consigo fazer por aqui.
