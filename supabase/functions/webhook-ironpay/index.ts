// Webhook IronPay — EXCLUSIVO para os planos de assinatura do SaaS
// (Mensal e Vitalício). NÃO tem relação com as vendas de ebooks dos
// usuários, que continuam sendo processadas pelo webhook da Cakto
// (`webhook-payment`).
//
// IMPORTANTE — pontos pendentes de confirmação oficial da IronPay:
//   1. Não há documentação oficial sobre header/HMAC de assinatura.
//      Portanto, NENHUMA validação de assinatura é aplicada aqui.
//      Todo o cabeçalho recebido é registrado para auditoria e para
//      permitir configurar a validação posteriormente, quando a
//      IronPay disponibilizar a informação.
//   2. Não há vocabulário oficial de status. Um mapeamento permissivo
//      (com valores frequentemente usados por gateways brasileiros) é
//      aplicado em `mapStatus()` e deve ser ajustado quando os status
//      reais forem observados nos primeiros webhooks.
//   3. Não há estrutura oficial de payload. A extração de campos está
//      concentrada em `extractIronPayFields()` para facilitar ajustes
//      quando o payload real for conhecido.
//   4. Identificação do plano (monthly/lifetime): como não há metadata
//      garantida, o plano é inferido pelo valor pago. Ajustar em
//      `inferPlanType()` caso a IronPay envie o produto/metadata.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

// ---------- Mapeamentos ajustáveis ----------

// Valores esperados (em reais) — usados apenas para inferir o plano
// enquanto não houver identificador oficial do produto no payload.
const MONTHLY_PRICE_BRL = 147.9;
const LIFETIME_PRICE_BRL = 247.9;

// Vocabulário provisório de status. Ajustar conforme observado.
function mapStatus(raw: string): "approved" | "pending" | "refused" | "refunded" | "unknown" {
  const s = (raw || "").toString().toLowerCase().trim();
  if (["paid", "approved", "completed", "success", "succeeded", "authorized", "aprovado", "pago"].includes(s)) return "approved";
  if (["pending", "waiting_payment", "pending_payment", "created", "processing", "pendente"].includes(s)) return "pending";
  if (["refused", "declined", "failed", "canceled", "cancelled", "recusado", "cancelado"].includes(s)) return "refused";
  if (["refunded", "chargeback", "estornado", "reembolsado"].includes(s)) return "refunded";
  return "unknown";
}

// Extração provisória e permissiva de campos.
function extractIronPayFields(payload: any) {
  const data = payload?.data || payload?.transaction || payload?.order || payload || {};
  const customer = data?.customer || data?.buyer || data?.client || payload?.customer || {};

  const email = (customer?.email || data?.email || payload?.email || "").toString().toLowerCase().trim();

  const status = (data?.status || payload?.status || data?.transaction_status || "").toString();

  const transactionId = (
    data?.id ??
    data?.transaction_id ??
    data?.order_id ??
    payload?.id ??
    payload?.transaction_id ??
    ""
  ).toString();

  // Valor: pode vir em reais (decimal) ou centavos (inteiro).
  const rawAmount = data?.amount ?? data?.value ?? data?.total ?? data?.amount_cents ?? payload?.amount ?? 0;
  let amountCents = 0;
  if (typeof rawAmount === "number") {
    amountCents = Number.isInteger(rawAmount) && rawAmount > 1000 ? rawAmount : Math.round(rawAmount * 100);
  } else if (typeof rawAmount === "string") {
    const normalized = rawAmount.replace(",", ".");
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) {
      amountCents = !normalized.includes(".") && parsed > 1000 ? Math.floor(parsed) : Math.round(parsed * 100);
    }
  }

  const productId = (data?.product_id ?? data?.product?.id ?? payload?.product_id ?? "").toString();
  const metadataPlan = (data?.metadata?.plan_type ?? payload?.metadata?.plan_type ?? "").toString().toLowerCase();

  return { email, status, transactionId, amountCents, productId, metadataPlan };
}

function inferPlanType(amountCents: number, metadataPlan: string): "monthly" | "lifetime" | null {
  if (metadataPlan === "monthly" || metadataPlan === "lifetime") return metadataPlan;
  const reais = amountCents / 100;
  // Tolerância de +/- R$ 1,00 para diferenças de arredondamento.
  if (Math.abs(reais - MONTHLY_PRICE_BRL) <= 1) return "monthly";
  if (Math.abs(reais - LIFETIME_PRICE_BRL) <= 1) return "lifetime";
  return null;
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

    // Registro completo dos headers e do body para permitir configurar
    // futuramente a validação de assinatura, quando a IronPay
    // documentar o mecanismo oficial.
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    console.log("--- IRONPAY WEBHOOK AUDIT START ---");
    console.log(`Headers: ${JSON.stringify(headersObj)}`);
    console.log(`Raw Body: ${rawBody}`);
    console.log("--- IRONPAY WEBHOOK AUDIT END ---");

    let payload: any = {};
    try { payload = JSON.parse(rawBody); } catch { payload = {}; }

    const { email, status, transactionId, amountCents, metadataPlan } = extractIronPayFields(payload);
    const mapped = mapStatus(status);

    console.log("IronPay parsed:", { email, status, mapped, transactionId, amountCents, metadataPlan });

    if (!email) {
      return new Response(JSON.stringify({ ok: false, error: "Email ausente" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Só ativa/cria assinatura para status aprovado. Outros status são
    // apenas registrados no log até que o vocabulário oficial seja
    // definido.
    if (mapped !== "approved") {
      return new Response(JSON.stringify({ ok: true, ignored_status: status, mapped }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planType = inferPlanType(amountCents, metadataPlan);
    if (!planType) {
      console.warn("IronPay: não foi possível inferir plan_type", { amountCents, metadataPlan });
      return new Response(JSON.stringify({ ok: false, error: "plan_type não identificado" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expiresAt = planType === "lifetime"
      ? null
      : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();

    // Localiza usuário pelo email (com paginação, igual ao webhook Cakto).
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

      // Reutiliza a coluna cakto_transaction_id como identificador de
      // transação da plataforma (evita migração de schema). Se preferir,
      // podemos criar `platform` + `platform_transaction_id` depois.
      await supabase.from("subscriptions").upsert({
        user_id: user.id,
        buyer_email: email,
        plan_type: planType,
        status: "active",
        cakto_transaction_id: transactionId || null,
        expires_at: expiresAt,
      }, { onConflict: "user_id" });

      console.info(`IronPay: assinatura ativada para ${email} (${planType})`);
    } else {
      // Usuário ainda não cadastrado — cria assinatura pendente que será
      // vinculada no signup pelo trigger handle_new_user.
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
      console.info(`IronPay: assinatura pré-vinculada para ${email} (${planType})`);
    }

    return new Response(JSON.stringify({ ok: true, plan_type: planType }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("IronPay Webhook Error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
