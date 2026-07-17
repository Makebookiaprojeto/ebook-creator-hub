# Guia SEM TERMINAL — tudo por clique, funciona no Windows 7

Você não vai instalar nada no seu notebook. Tudo roda nos servidores do
GitHub e do Supabase. Você só vai: (1) criar contas, (2) clicar em botões,
(3) colar algumas chaves em caixinhas de texto.

## Parte A — Colocar o código atualizado no seu GitHub

1. Entre no seu repositório em github.com (pelo navegador).
2. Baixe o arquivo `ebook-creator-hub-migrado.zip` que te enviei e extraia
   no seu computador (só extrair o zip, sem instalar nada).
3. No GitHub, use o botão **"Add file" > "Upload files"** na página do
   repositório e arraste todo o conteúdo da pasta extraída (incluindo a
   pasta oculta `.github`), substituindo os arquivos antigos. Confirme o
   commit.

## Parte B — Criar o Supabase novo (só o site, sem instalar nada)

1. Crie conta em supabase.com → **New Project**.
2. Anote 3 coisas do painel (**Project Settings > API**):
   - Project URL
   - Project Reference ID (aparece na URL do painel)
   - `anon` `public` key
3. Anote também a **service_role key** (mesma tela, é secreta — nunca
   compartilhe/exponha ela no frontend).

## Parte C — Ligar o Supabase ao seu GitHub (recria o banco sozinho)

1. No painel do Supabase: **Project Settings > Integrations > GitHub**.
2. Conecte sua conta do GitHub e selecione o repositório do projeto.
3. Ative a opção de aplicar migrations automaticamente na branch de produção
   (**"Deploy to production"**).
4. Isso já recria as 129 migrations — tabelas, permissões, buckets de
   imagem — sozinho, sem você digitar nada.

## Parte D — Configurar os "segredos" das funções (Edge Functions)

No painel do Supabase: **Edge Functions > Manage secrets** (tudo pela
tela, sem terminal). Adicione:

| Nome | Onde conseguir |
|---|---|
| `GEMINI_API_KEY` | grátis em https://aistudio.google.com/apikey |
| `PEXELS_API_KEY` | grátis em https://www.pexels.com/api/ |
| `RESEND_API_KEY` | conta em https://resend.com |
| `STRIPE_SECRET_KEY` | painel da sua conta Stripe |
| `CAKTO_WEBHOOK_SECRET` | painel da Cakto |
| `APPLYFY_WEBHOOK_TOKEN` | painel da Applyfy |
| `IRONPAY_WEBHOOK_TOKEN` | painel da Ironpay |

(`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` o próprio Supabase já
disponibiliza automaticamente pras funções — não precisa cadastrar.)

## Parte E — Deixar o GitHub publicar as Edge Functions e o frontend sozinho

No GitHub: **seu repositório > Settings > Secrets and variables > Actions >
New repository secret**. Cadastre, um de cada vez:

Para as Edge Functions:
- `SUPABASE_ACCESS_TOKEN` → gere em supabase.com/dashboard/account/tokens
- `SUPABASE_PROJECT_REF` → o Project Reference ID que você anotou na Parte B

Para o frontend (Hostinger):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
  → os 3 valores da Parte B (use a `anon public`, NUNCA a service_role aqui)
- `HOSTINGER_FTP_HOST`, `HOSTINGER_FTP_USER`, `HOSTINGER_FTP_PASSWORD`
  → painel da Hostinger (hPanel) > **Arquivos > Contas FTP**
- `HOSTINGER_FTP_TARGET_DIR` → normalmente `/public_html/` (a pasta onde
  seu site fica publicado na Hostinger)

Depois de cadastrar esses secrets, vá na aba **Actions** do repositório: os
3 robôs (`deploy-functions`, `seed-templates`, `deploy-frontend`) vão
aparecer na lista. Clique em cada um e depois em **"Run workflow"** pra
disparar manualmente a primeira vez (nas próximas vezes, `deploy-functions`
e `deploy-frontend` rodam sozinhos a cada mudança que você subir no GitHub).

**Ordem recomendada da primeira vez:**
1. Espere a Parte C terminar (banco criado)
2. Rode `deploy-functions` (Actions > Run workflow)
3. Rode `seed-templates` (Actions > Run workflow) — demora alguns minutos,
   busca as imagens no Pexels e recria os templates
4. Rode `deploy-frontend` (Actions > Run workflow)

## Parte F — Últimos ajustes pela tela (sem terminal)

- No Supabase: **Authentication > URL Configuration** → coloque a URL do
  seu site (a mesma da Hostinger) em Site URL / Redirect URLs.
- Nos painéis do Stripe/Cakto/Applyfy/Ironpay: atualize a URL de webhook
  pra apontar pro projeto novo:
  `https://SEU-PROJECT-REF.supabase.co/functions/v1/webhook-xxx`

## Se travar em algum passo

Pode voltar aqui e me falar exatamente em qual tela/botão você travou —
eu te explico o próximo clique. O que eu não consigo fazer é clicar por
você nos sites do Supabase/GitHub/Hostinger, porque preciso das suas
credenciais e não tenho acesso à internet daqui.

## Sobre o Windows 7
Só um alerta à parte, sem urgência pra esse projeto: o Windows 7 não
recebe mais atualizações de segurança da Microsoft desde 2020. Isso não
te impede de seguir este guia (só precisa de um navegador atualizado),
mas vale considerar atualizar o sistema em algum momento por segurança
geral do seu computador.
