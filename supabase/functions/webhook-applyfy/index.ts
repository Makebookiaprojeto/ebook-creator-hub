// Webhook ApplyFy — EXCLUSIVO para os planos de assinatura do SaaS
// (Mensal e Vitalício). Reutiliza a arquitetura do webhook-ironpay.
//
// Eventos tratados nesta primeira etapa:
//   - TRANSACTION_PAID         -> ativa assinatura
//   - TRANSACTION_REFUNDED     -> revoga acesso
//   - TRANSACTION_CHARGED_BACK -> revoga acesso
//
// Qualquer outro evento é ignorado com HTTP 200. Renovação automática,
// cancelamento, cobrança recorrente recusada, deduplicação, uso de
// subscription.id / nextChargeAt / subscription.status ficam para a
// segunda etapa, após confirmação da documentação oficial.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

// ---------- Mapeamento de plano ----------
// TODO: Preencher com os IDs reais dos produtos ApplyFy quando forem
// informados. A chave é o valor de orderItems[].product.id retornado
// pelo webhook da ApplyFy.
const PRODUCT_ID_TO_PLAN: Record<string, "monthly" | "lifetime"> = {
  // "APPLYFY_PRODUCT_ID_MONTHLY":  "monthly",
  // "APPLYFY_PRODUCT_ID_LIFETIME": "lifetime",
};

// ---------- Utilitários ----------
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function collectKeys(obj: any, prefix = "", out: string[] = [], depth = 0): string[] {
  if (depth > 4 || !obj || typeof obj !== "object") return out;
  for (const k of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    out.push(path);
    const v = (obj as any)[k];
    if (v && typeof v === "object" && !Array.isArray(v)) collectKeys(v, path, out, depth + 1);
  }
  return out;
}

// ---------- Extração ----------
function extractApplyFyFields(payload: any) {
  const data = payload?.data ?? payload ?? {};
  const client = data?.client ?? data?.customer ?? {};
  const orderItems: any[] = Array.isArray(data?.orderItems)
    ? data.orderItems
    : Array.isArray(payload?.orderItems)
      ? payload.orderItems
      : [];

  const email = (client?.email || "").toString().toLowerCase().trim();
  const transactionId = (data?.id ?? data?.transactionId ?? payload?.id ?? "").toString();

  const productIds: string[] = orderItems
    .map((it) => it?.product?.id ?? it?.productId ?? it?.product_id)
    .filter((v) => typeof v === "string" && v.length > 0);

  const productNames: string[] = orderItems
    .map((it) => it?.product?.name ?? it?.product?.title ?? it?.name)
    .filter((v) => typeof v === "string" && v.length > 0);

  return { email, transactionId, productIds, productNames };
}

function inferPlanType(productIds: string[]): { plan: "monthly" | "lifetime" | null; source: string } {
  for (const id of productIds) {
    const mapped = PRODUCT_ID_TO_PLAN[id] || PRODUCT_ID_TO_PLAN[id.toLowerCase?.() ?? id];
    if (mapped) return { plan: mapped, source: `product_id:${id}` };
  }
  return { plan: null, source: "none" };
}

// ---------- Handler ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const rawBody = await req.text();

    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => { headersObj[key] = value; });
    console.log("--- APPLYFY WEBHOOK AUDIT START ---");
    console.log(`Headers: ${JSON.stringify(headersObj)}`);
    console.log(`Raw Body: ${rawBody}`);
    console.log("--- APPLYFY WEBHOOK AUDIT END ---");

    let payload: any = {};
    try { payload = JSON.parse(rawBody); } catch { payload = {}; }

    // ---------- Validação por token ----------
    const expectedToken = Deno.env.get("APPLYFY_WEBHOOK_TOKEN") || "";
    // ApplyFy pode enviar o token via header (x-webhook-token / authorization)
    // ou no corpo (payload.token). Aceita ambos.
    const headerToken =
      req.headers.get("x-webhook-token") ||
      req.headers.get("x-applyfy-token") ||
      (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "") ||
      "";
    const bodyToken = (payload?.token ?? "").toString();
    const receivedToken = headerToken || bodyToken;

    if (!expectedToken) {
      console.error("ApplyFy: APPLYFY_WEBHOOK_TOKEN não configurado.");
      return new Response(JSON.stringify({ error: "Webhook token não configurado" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!receivedToken || !timingSafeEqual(receivedToken, expectedToken)) {
      console.warn("ApplyFy: token inválido ou ausente.");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- Evento ----------
    const event = (payload?.event ?? payload?.type ?? payload?.eventName ?? "").toString();
    console.log("ApplyFy event:", event);
    try { console.log("ApplyFy payload keys:", JSON.stringify(collectKeys(payload))); } catch {}

    const HANDLED = new Set(["TRANSACTION_PAID", "TRANSACTION_REFUNDED", "TRANSACTION_CHARGED_BACK"]);
    if (!HANDLED.has(event)) {
      return new Response(JSON.stringify({ ok: true, ignored_event: event }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, transactionId, productIds, productNames } = extractApplyFyFields(payload);
    console.log("ApplyFy parsed:", { event, email, transactionId, productIds, productNames });

    if (!email) {
      return new Response(JSON.stringify({ ok: false, error: "Email ausente" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- Refund / Chargeback ----------
    if (event === "TRANSACTION_REFUNDED" || event === "TRANSACTION_CHARGED_BACK") {
      const reason = event === "TRANSACTION_REFUNDED" ? "refunded" : "chargeback";

      let sub: any = null;
      if (transactionId) {
        const { data } = await supabase
          .from("subscriptions")
          .select("id, user_id, buyer_email, plan_type, status")
          .eq("cakto_transaction_id", transactionId)
          .maybeSingle();
        if (data) sub = data;
      }
      if (!sub && email) {
        const { data } = await supabase
          .from("subscriptions")
          .select("id, user_id, buyer_email, plan_type, status")
          .eq("buyer_email", email)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) sub = data;
      }

      if (!sub) {
        console.warn(`ApplyFy ${reason}: assinatura não encontrada`, { transactionId, email });
        return new Response(JSON.stringify({ ok: true, revoked: false, reason: "subscription_not_found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("subscriptions").update({
        status: reason,
        updated_at: new Date().toISOString(),
      }).eq("id", sub.id);

      if (sub.user_id) {
        await supabase.from("profiles").update({ is_lifetime: false }).eq("user_id", sub.user_id);
      }

      console.info(
        `ApplyFy ${reason}: acesso revogado. user_id=${sub.user_id ?? "null"} email=${sub.buyer_email} plano=${sub.plan_type} tx=${transactionId}`,
      );

      return new Response(JSON.stringify({
        ok: true, revoked: true, reason, plan_type: sub.plan_type, user_id: sub.user_id,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---------- TRANSACTION_PAID ----------
    const { plan: planType, source: planSource } = inferPlanType(productIds);
    console.log("ApplyFy plan inference:", { planType, planSource });

    if (!planType) {
      console.warn("ApplyFy: não foi possível inferir plan_type (verifique PRODUCT_ID_TO_PLAN)", {
        productIds, productNames,
      });
      return new Response(JSON.stringify({ ok: false, error: "plan_type não identificado" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expiresAt = planType === "lifetime"
      ? null
      : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();

    // Localiza usuário pelo email (paginação como no IronPay).
    let user: any = null;
    let page = 1;
    while (true) {
      const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (error || !users || users.length === 0) break;
      user = users.find((u) => u.email?.toLowerCase() === email);
      if (user) break;
      page++;
      if (page > 10) break;
    }

    if (user) {
      if (planType === "lifetime") {
        await supabase.from("profiles").update({ is_lifetime: true }).eq("user_id", user.id);
      }
      await supabase.from("subscriptions").upsert({
        user_id: user.id,
        buyer_email: email,
        plan_type: planType,
        status: "active",
        cakto_transaction_id: transactionId || null,
        expires_at: expiresAt,
      }, { onConflict: "user_id" });

      console.info(`ApplyFy: assinatura ativada para ${email} (${planType})`);
    } else {
      const { data: existingPending } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("buyer_email", email)
        .is("user_id", null)
        .maybeSingle();

      if (existingPending) {
        await supabase.from("subscriptions").update({
          plan_type: planType,
          status: "active",
          cakto_transaction_id: transactionId || null,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        }).eq("id", existingPending.id);
      } else {
        await supabase.from("subscriptions").insert({
          buyer_email: email,
          plan_type: planType,
          status: "active",
          cakto_transaction_id: transactionId || null,
          expires_at: expiresAt,
        });
      }
      console.info(`ApplyFy: assinatura pré-vinculada para ${email} (${planType})`);
    }

    return new Response(JSON.stringify({ ok: true, plan_type: planType }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ApplyFy Webhook Error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
