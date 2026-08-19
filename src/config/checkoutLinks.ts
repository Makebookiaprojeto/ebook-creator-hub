// Links de checkout dos planos de assinatura do SaaS.
// Usando Applyfy para todos os processamentos (PIX e Cartão).

export type PlanId = "monthly" | "lifetime";

const APPLYFY_MONTHLY = "https://checkout.applyfy.com.br/checkout/cmr420tnz02eb01or9dy2rfgu?offer=UV1G6YK";
const APPLYFY_LIFETIME = "https://checkout.applyfy.com.br/checkout/cmr41g2ie01as01psbzhiv4o1?offer=70BMKVA";

export const CHECKOUT_LINKS: Record<PlanId, string> = {
  monthly: APPLYFY_MONTHLY,
  lifetime: APPLYFY_LIFETIME,
};
