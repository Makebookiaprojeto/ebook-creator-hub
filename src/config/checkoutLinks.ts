// Links de checkout dos planos de assinatura do SaaS.
// Todos os pagamentos (PIX e Cartão) utilizam exclusivamente a ApplyFy.

export type PlanId = "monthly" | "lifetime";
export type PaymentMethod = "pix" | "card";

// Checkout da ApplyFy
const APPLYFY_MONTHLY =
  "https://checkout.applyfy.com.br/checkout/cmr420tnz02eb01or9dy2rfgu?offer=UV1G6YK";

const APPLYFY_LIFETIME =
  "https://checkout.applyfy.com.br/checkout/cmr41g2ie01as01psbzhiv4o1?offer=70BMKVA";

// Compatibilidade com código legado
export const CHECKOUT_LINKS: Record<PlanId, string> = {
  monthly: APPLYFY_MONTHLY,
  lifetime: APPLYFY_LIFETIME,
};

// Múltiplos métodos de pagamento.
// Atualmente PIX e Cartão apontam para o mesmo checkout da ApplyFy.
export const CHECKOUT_LINKS_BY_METHOD: Record<
  PlanId,
  Record<PaymentMethod, string>
> = {
  monthly: {
    pix: APPLYFY_MONTHLY,
    card: APPLYFY_MONTHLY,
  },
  lifetime: {
    pix: APPLYFY_LIFETIME,
    card: APPLYFY_LIFETIME,
  },
};
