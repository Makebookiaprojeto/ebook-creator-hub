Removerei completamente a funcionalidade de Login com Google e hCaptcha do projeto.

### Análise de Dependências (O que será removido)
*   **Componentes de UI:** Botão "Google" e componente `HCaptcha` em `src/pages/Auth.tsx`.
*   **Lógica de Frontend:** Imports de `HCaptcha`, estados `captchaToken`, referências `captchaRef`, chamadas para `verify-captcha` e `handleGoogleLogin` no arquivo `src/pages/Auth.tsx`.
*   **Integrações:** Método `signInWithOAuth` em `src/integrations/lovable/index.ts` (embora auto-gerado, vou remover a referência no Auth).
*   **Dependências de Pacotes:** ` @hcaptcha/react-hcaptcha` do `package.json`.
*   **Backend:** Edge Function `verify-captcha`.

### Passos da Implementação

1.  **Frontend (Auth.tsx):**
    *   Remover import de `@hcaptcha/react-hcaptcha`.
    *   Remover constante `HCAPTCHA_SITE_KEY`.
    *   Remover estados e refs: `captchaToken`, `captchaRef`, `resetCaptcha`.
    *   Remover validação de captcha no `handleSubmit` (removendo os blocos que chamam `verify-captcha`).
    *   Remover função `handleGoogleLogin`.
    *   Remover renderização do componente `HCaptcha`.
    *   Remover separador "Ou continue com" e o botão do Google.

2.  **Dependências:**
    *   Remover `@hcaptcha/react-hcaptcha` do `package.json`.

3.  **Backend:**
    *   Remover diretório `supabase/functions/verify-captcha`.

4.  **Limpeza:**
    *   Sugerir a remoção das variáveis de ambiente `VITE_HCAPTCHA_SITE_KEY` e `HCAPTCHA_SECRET_KEY` (se existir no Supabase).

### Validação
*   Verificarei se o build continua funcionando.
*   Confirmarei que o login por e-mail/senha permanece intacto.
*   Confirmarei que não há erros de console relacionados a variáveis ausentes.

**Impactos Possíveis:** A segurança contra bots no cadastro e login será reduzida sem o hCaptcha, mas a funcionalidade de autenticação por e-mail continuará operando normalmente.
