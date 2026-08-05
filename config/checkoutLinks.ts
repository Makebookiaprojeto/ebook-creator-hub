// Links de checkout dos planos de assinatura do SaaS.
//
// A partir desta versão, todo o processamento de pagamento (Pix e cartão)
// é feito pela ApplyFy, que já lida com ambos os métodos dentro do próprio
// checkout dela. A IronPay não é mais utilizada.
//
// A integração da Cakto (vendas de ebooks) não é afetada.

export type PlanId = "monthly" | "lifetime";

// URLs de checkout da ApplyFy.
const APPLYFY_MONTHLY = "https://checkout.applyfy.com.br/checkout/cmr420tnz02eb01or9dy2rfgu?offer=UV1G6YK";
const APPLYFY_LIFETIME = "https://checkout.applyfy.com.br/checkout/cmr41g2ie01as01psbzhiv4o1?offer=70BMKVA";

export const CHECKOUT_LINKS: Record<PlanId, string> = {
  monthly: APPLYFY_MONTHLY,
  lifetime: APPLYFY_LIFETIME,
};
