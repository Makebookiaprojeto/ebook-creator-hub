// Links de checkout dos planos de assinatura do SaaS.
//
// Reorganização preparatória para suportar múltiplos meios de pagamento por
// plano. Nenhum fluxo, página, webhook, hook, rota ou banco foi alterado.
//
// - CHECKOUT_LINKS (mantido): mapa plano → URL. Continua sendo a fonte usada
//   hoje por src/pages/Plans.tsx (handleCheckout). Aponta para as URLs atuais
//   da IronPay (PIX).
// - CHECKOUT_LINKS_BY_METHOD (novo): mapa plano → { pix, card } já pronto
//   para quando a ApplyFy (Cartão) for integrada. NÃO é consumido por
//   nenhum arquivo no momento.
//
// A integração da Cakto (vendas de ebooks) não é afetada.

export type PlanId = "monthly" | "lifetime";
export type PaymentMethod = "pix" | "card";

// URLs atuais em produção (IronPay / PIX).
const IRONPAY_MONTHLY = "https://go.ironpayapp.com.br/rz667jowdt";
const IRONPAY_LIFETIME = "https://go.ironpayapp.com.br/pdg8y8zsl4";

// URLs da ApplyFy (Cartão) — a preencher quando a integração for ativada.
const APPLYFY_MONTHLY = "";
const APPLYFY_LIFETIME = "";

// Estrutura legada mantida para compatibilidade com o fluxo atual (PIX).
export const CHECKOUT_LINKS: Record<PlanId, string> = {
  monthly: IRONPAY_MONTHLY,
  lifetime: IRONPAY_LIFETIME,
};

// Nova estrutura, preparada para múltiplos meios de pagamento.
export const CHECKOUT_LINKS_BY_METHOD: Record<PlanId, Record<PaymentMethod, string>> = {
  monthly: {
    pix: IRONPAY_MONTHLY,
    card: APPLYFY_MONTHLY,
  },
  lifetime: {
    pix: IRONPAY_LIFETIME,
    card: APPLYFY_LIFETIME,
  },
};
