// Webhook público da Cakto — registra/atualiza assinaturas após pagamento aprovado.
// Endpoint: POST /functions/v1/cakto-webhook
// Configure essa URL no painel da Cakto e (opcional) defina CAKTO_WEBHOOK_SECRET.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cakto-signature, x-webhook-secret",
};

// Mapeamento product_id (Cakto) -> tipo de plano
const PRODUCT_PLAN_MAP: Record<string, "monthly" | "lifetime"> = {
  "864624": "monthly",
  "864639": "lifetime",
};

// Fallback por valor (em centavos) caso o product_id não venha
const AMOUNT_PLAN_MAP: Record<number, "monthly" | "lifetime"> = {
  14990: "monthly",
  24990: "lifetime",
};

function pickEmail(payload: any): string | null {
  const candidates = [
    payload?.customer?.email,
    payload?.customer_email,
    payload?.buyer?.email,
    payload?.buyer_email,
    payload?.email,
    payload?.data?.customer?.email,
    payload?.data?.customer_email,
    payload?.data?.email,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.includes("@")) return c.toLowerCase().trim();
  }
  return null;
}

function pickProductId(payload: any): string | null {
  const candidates = [
    payload?.product_id,
    payload?.product?.id,
    payload?.offer_id,
    payload?.offer?.id,
    payload?.data?.product_id,
    payload?.data?.product?.id,
    payload?.data?.offer_id,
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null) return String(c);
  }
  return null;
}

function pickAmountCents(payload: any): number | null {
  const candidates = [
    payload?.amount,
    payload?.value,
    payload?.price,
    payload?.total,
    payload?.data?.amount,
    payload?.data?.value,
    payload?.data?.total,
  ];
  for (const c of candidates) {
    if (typeof c === "number") {
      // Se vier em reais (ex.: 149.9), converte para centavos
      return c < 1000 ? Math.round(c * 100) : Math.round(c);
    }
    if (typeof c === "string" && c.length > 0) {
      const n = Number(c.replace(",", "."));
      if (!isNaN(n)) return n < 1000 ? Math.round(n * 100) : Math.round(n);
    }
  }
  return null;
}

function pickStatus(payload: any): string {
  const candidates = [
    payload?.status,
    payload?.payment_status,
    payload?.event,
    payload?.type,
    payload?.data?.status,
  ];
  for (const c of candidates) {
    if (typeof c === "string") return c.toLowerCase();
  }
  return "";
}

function pickTransactionId(payload: any): string | null {
  const candidates = [
    payload?.transaction_id,
    payload?.id,
    payload?.transaction?.id,
    payload?.data?.transaction_id,
    payload?.data?.id,
  ];
  for (const c of candidates) {
    if (c) return String(c);
  }
  return null;
}

const APPROVED_STATUSES = new Set([
  "paid", "approved", "completed", "success", "succeeded",
  "purchase_approved", "payment_approved", "order_approved",
]);

const REFUND_STATUSES = new Set([
  "refunded", "chargeback", "canceled", "cancelled", "refund",
  "purchase_refunded", "purchase_canceled", "purchase_chargeback",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Validação opcional por secret
    const expectedSecret = Deno.env.get("CAKTO_WEBHOOK_SECRET");
    if (expectedSecret) {
      const provided =
        req.headers.get("x-cakto-signature") ||
        req.headers.get("x-webhook-secret") ||
        new URL(req.url).searchParams.get("secret");
      if (provided !== expectedSecret) {
        console.warn("cakto-webhook: invalid secret");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const payload = await req.json().catch(() => ({}));
    console.log("cakto-webhook payload:", JSON.stringify(payload));

    const status = pickStatus(payload);
    const email = pickEmail(payload);
    const productId = pickProductId(payload);
    const amountCents = pickAmountCents(payload);
    const transactionId = pickTransactionId(payload);

    if (!email) {
      console.warn("cakto-webhook: email ausente");
      return new Response(JSON.stringify({ error: "email ausente no payload" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determina o plano
    let planType: "monthly" | "lifetime" | null = null;
    if (productId && PRODUCT_PLAN_MAP[productId]) planType = PRODUCT_PLAN_MAP[productId];
    if (!planType && amountCents && AMOUNT_PLAN_MAP[amountCents]) planType = AMOUNT_PLAN_MAP[amountCents];

    if (!planType) {
      console.warn("cakto-webhook: plano não identificado", { productId, amountCents });
      return new Response(JSON.stringify({ error: "plano não identificado" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Tenta vincular ao user_id pelo e-mail (se já houver conta)
    let userId: string | null = null;
    try {
      const { data: list } = await (supabase.auth.admin as any).listUsers({ page: 1, perPage: 200 });
      const match = list?.users?.find((u: any) => (u.email || "").toLowerCase() === email);
      if (match?.id) userId = match.id;
    } catch (e) {
      console.warn("cakto-webhook: não foi possível listar usuários", e);
    }

    const isApproved = APPROVED_STATUSES.has(status);
    const isRefund = REFUND_STATUSES.has(status);

    if (!isApproved && !isRefund) {
      console.log("cakto-webhook: status ignorado:", status);
      return new Response(JSON.stringify({ ignored: true, status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Procura assinatura existente desse e-mail/plano
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id, plan_type, status, expires_at")
      .eq("buyer_email", email)
      .eq("plan_type", planType)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (isRefund) {
      if (existing) {
        await supabase
          .from("subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      }
      return new Response(JSON.stringify({ ok: true, action: "canceled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // APROVADO -> criar/estender assinatura
    let expiresAt: string | null = null;
    if (planType === "monthly") {
      // Renovação: estende a partir do expires_at atual (se ainda no futuro), senão de agora.
      const baseMs = existing?.expires_at && new Date(existing.expires_at).getTime() > Date.now()
        ? new Date(existing.expires_at).getTime()
        : Date.now();
      expiresAt = new Date(baseMs + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    if (existing) {
      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          expires_at: expiresAt,
          user_id: userId ?? undefined,
          cakto_transaction_id: transactionId ?? undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("subscriptions").insert({
        buyer_email: email,
        user_id: userId,
        plan_type: planType,
        status: "active",
        expires_at: expiresAt,
        cakto_transaction_id: transactionId,
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      plan_type: planType,
      expires_at: expiresAt,
      linked_user: !!userId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cakto-webhook error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
