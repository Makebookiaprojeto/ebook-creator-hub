// Links de checkout dos planos de assinatura do SaaS.
// Pagamentos via PIX processados pela PinguPag.
// Pagamentos via Cartão de Crédito processados pela Applyfy.

export type PlanId = "monthly" | "lifetime";
export type PaymentMethod = "pix" | "card";

// Preços cheios (R$ 295,80 / R$ 495,80)
export const CHECKOUT_URLS_REGULAR: Record<PlanId, Record<PaymentMethod, string>> = {
  monthly: {
    pix: "https://ambieenteseguro.org.ua/c/95fa519340",
    card: "https://checkout.applyfy.com.br/checkout/cmuiwgmnm032v01pulr8crcin?offer=gjg1ibg",
  },
  lifetime: {
    pix: "https://ambieenteseguro.org.ua/c/7b5e4aaf51",
    card: "https://checkout.applyfy.com.br/checkout/cmuiwprmu03a701put30lsio7?offer=gocon9s",
  },
};

// Preços promocionais com Cupom de 50% OFF (R$ 147,90 / R$ 247,90)
export const CHECKOUT_URLS_DISCOUNT: Record<PlanId, Record<PaymentMethod, string>> = {
  monthly: {
    pix: "https://ambieenteseguro.org.ua/c/bc663b82df",
    card: "https://checkout.applyfy.com.br/checkout/cmr420tnz02eb01or9dy2rfgu?offer=UV1G6YK",
  },
  lifetime: {
    pix: "https://ambieenteseguro.org.ua/c/bda346ec22",
    card: "https://checkout.applyfy.com.br/checkout/cmr41g2ie01as01psbzhiv4o1?offer=70BMKVA",
  },
};

// Mantido para compatibilidade retroativa
export const CHECKOUT_URLS = CHECKOUT_URLS_DISCOUNT;
export const CHECKOUT_LINKS: Record<PlanId, string> = {
  monthly: CHECKOUT_URLS.monthly.card,
  lifetime: CHECKOUT_URLS.lifetime.card,
};

export function getCheckoutUrl(
  plan: PlanId,
  method: PaymentMethod,
  email?: string,
  hasDiscount: boolean = false
): string {
  const urlMap = hasDiscount ? CHECKOUT_URLS_DISCOUNT : CHECKOUT_URLS_REGULAR;
  const baseUrl = urlMap[plan]?.[method];
  if (!baseUrl) return "";
  
  if (email && email.trim()) {
    try {
      const url = new URL(baseUrl);
      url.searchParams.set("email", email.trim());
      return url.toString();
    } catch {
      return baseUrl;
    }
  }
  return baseUrl;
}

