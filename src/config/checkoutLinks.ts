// Links de checkout dos planos de assinatura do SaaS.
// Estrutura preparada para múltiplos meios de pagamento por plano:
//   - pix  → IronPay (fluxo atual)
//   - card → ApplyFy (a ser integrado futuramente)
//
// IMPORTANTE: esta reorganização é apenas estrutural. Nenhum fluxo de
// pagamento, página, webhook ou hook foi alterado. O consumo destes links
// continua sendo feito exclusivamente por src/pages/Plans.tsx via
// handleCheckout, que hoje utiliza somente o gateway PIX (IronPay).
//
// A integração da Cakto (vendas de ebooks dos usuários) não é afetada.

export type PlanId = "monthly" | "lifetime";
export type PaymentMethod = "pix" | "card";

export const CHECKOUT_LINKS: Record<PlanId, Record<PaymentMethod, string>> = {
  monthly: {
    // IronPay (PIX) — URL atual em produção
    pix: "https://go.ironpayapp.com.br/rz667jowdt",
    // ApplyFy (Cartão) — a ser preenchido quando a integração for ativada
    card: "",
  },
  lifetime: {
    // IronPay (PIX) — URL atual em produção
    pix: "https://go.ironpayapp.com.br/pdg8y8zsl4",
    // ApplyFy (Cartão) — a ser preenchido quando a integração for ativada
    card: "",
  },
};
