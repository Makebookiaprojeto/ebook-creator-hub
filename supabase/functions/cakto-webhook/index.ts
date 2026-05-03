// Webhook público da Cakto.
// Trata DOIS tipos de venda:
//   1) Assinatura SaaS (planos monthly/lifetime) -> grava em `subscriptions`
//   2) Venda de eBook do autor -> grava em `ebook_sales` + dispara e-mail com PDF
// Endpoint: POST /functions/v1/cakto-webhook

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cakto-signature, x-webhook-secret",
};

const PLATFORM = "cakto";

// Mapeamento product_id (Cakto) -> plano do SaaS (mantido)
const PRODUCT_PLAN_MAP: Record<string, "monthly" | "lifetime"> = {
  "864624": "monthly",
  "864639": "lifetime",
};
const AMOUNT_PLAN_MAP: Record<number, "monthly" | "lifetime"> = {
  14990: "monthly",
  24990: "lifetime",
};

function pickEmail(p: any): string | null {
  const c = [p?.customer?.email, p?.customer_email, p?.buyer?.email, p?.buyer_email, p?.email,
    p?.data?.customer?.email, p?.data?.customer_email, p?.data?.email];
  for (const x of c) if (typeof x === "string" && x.includes("@")) return x.toLowerCase().trim();
  return null;
}
function pickProductId(p: any): string | null {
  const c = [p?.product_id, p?.product?.id, p?.offer_id, p?.offer?.id,
    p?.data?.product_id, p?.data?.product?.id, p?.data?.offer_id];
  for (const x of c) if (x !== undefined && x !== null) return String(x);
  return null;
}
function pickAmountCents(p: any): number | null {
  const c = [p?.amount, p?.value, p?.price, p?.total, p?.data?.amount, p?.data?.value, p?.data?.total];
  for (const x of c) {
    if (typeof x === "number") return x < 1000 ? Math.round(x * 100) : Math.round(x);
    if (typeof x === "string" && x.length > 0) {
      const n = Number(x.replace(",", "."));
      if (!isNaN(n)) return n < 1000 ? Math.round(n * 100) : Math.round(n);
    }
  }
  return null;
}
function pickStatus(p: any): string {
  const c = [p?.status, p?.payment_status, p?.event, p?.type, p?.data?.status];
  for (const x of c) if (typeof x === "string") return x.toLowerCase();
  return "";
}
function pickTransactionId(p: any): string | null {
  const c = [p?.transaction_id, p?.id, p?.transaction?.id, p?.data?.transaction_id, p?.data?.id];
  for (const x of c) if (x) return String(x);
  return null;
}

const APPROVED = new Set(["paid","approved","completed","success","succeeded","purchase_approved","payment_approved","order_approved"]);
const REFUND = new Set(["refunded","chargeback","canceled","cancelled","refund","purchase_refunded","purchase_canceled","purchase_chargeback"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Validação global do SaaS (opcional). Sempre bloqueia se setado e errado.
    const expectedSecret = Deno.env.get("CAKTO_WEBHOOK_SECRET");
    const providedGlobalSecret =
      req.headers.get("x-cakto-signature") ||
      req.headers.get("x-webhook-secret") ||
      new URL(req.url).searchParams.get("secret");

    const payload = await req.json().catch(() => ({}));
    console.log("cakto-webhook payload:", JSON.stringify(payload));

    const status = pickStatus(payload);
    const email = pickEmail(payload);
    const productId = pickProductId(payload);
    const amountCents = pickAmountCents(payload);
    const transactionId = pickTransactionId(payload);

    if (!email) {
      return new Response(JSON.stringify({ error: "email ausente" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isApproved = APPROVED.has(status);
    const isRefund = REFUND.has(status);
    if (!isApproved && !isRefund) {
      return new Response(JSON.stringify({ ignored: true, status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ============================================================
    // ROUTE 1: venda de eBook (procura via ebook_payment_config)
    // ============================================================
    if (productId) {
      const { data: cfg } = await supabase
        .from("ebook_payment_config")
        .select("ebook_id, owner_id, ebooks!inner(id, title, pdf_url)")
        .eq("product_id", productId)
        .eq("payment_platform", PLATFORM)
        .maybeSingle();

      const ebook = cfg
        ? { id: (cfg as any).ebook_id, user_id: (cfg as any).owner_id,
            title: (cfg as any).ebooks?.title, pdf_url: (cfg as any).ebooks?.pdf_url }
        : null;

      if (ebook) {
        // Validação por-ebook (secret armazenado em tabela protegida)
        const { data: secretRow } = await supabase
          .from("ebook_webhook_secrets")
          .select("webhook_secret")
          .eq("ebook_id", ebook.id)
          .maybeSingle();
        const ebookSecret = (secretRow as any)?.webhook_secret as string | null;
        if (ebookSecret && providedGlobalSecret !== ebookSecret) {
          console.warn("cakto-webhook: assinatura inválida pro ebook", ebook.id);
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (isRefund) {
          await supabase
            .from("ebook_sales")
            .update({ status: "refunded" })
            .eq("ebook_id", ebook.id)
            .or(`platform_transaction_id.eq.${transactionId ?? "_"},customer_email.eq.${email}`);
          return new Response(JSON.stringify({ ok: true, type: "ebook", action: "refunded" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const row: any = {
          ebook_id: ebook.id,
          ebook_owner_id: ebook.user_id,
          customer_email: email,
          amount_paid_cents: amountCents,
          status: "paid",
          platform: PLATFORM,
          platform_transaction_id: transactionId,
          cakto_transaction_id: transactionId, // legacy
        };
        if (transactionId) {
          await supabase.from("ebook_sales").upsert(row, {
            onConflict: "cakto_transaction_id",
          });
        } else {
          await supabase.from("ebook_sales").insert(row);
        }

        if (ebook.pdf_url) {
          try {
            await supabase.functions.invoke("send-ebook-email", {
              body: { customerEmail: email, ebookTitle: ebook.title, pdfUrl: ebook.pdf_url },
            });
          } catch (e) {
            console.error("send-ebook-email falhou:", e);
          }
        }

        return new Response(JSON.stringify({ ok: true, type: "ebook", ebook_id: ebook.id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ============================================================
    // ROUTE 2: assinatura SaaS — exige secret global (se setado)
    // ============================================================
    if (!expectedSecret || providedGlobalSecret !== expectedSecret) {
      console.warn("cakto-webhook: tentativa de acesso SaaS sem secret configurado ou inválido.");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let planType: "monthly" | "lifetime" | null = null;
    if (productId && PRODUCT_PLAN_MAP[productId]) planType = PRODUCT_PLAN_MAP[productId];
    if (!planType && amountCents && AMOUNT_PLAN_MAP[amountCents]) planType = AMOUNT_PLAN_MAP[amountCents];

    if (!planType) {
      console.warn("cakto-webhook: produto não identificado", { productId, amountCents });
      return new Response(JSON.stringify({ error: "produto não identificado" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userId: string | null = null;
    try {
      const { data: list } = await (supabase.auth.admin as any).listUsers({ page: 1, perPage: 200 });
      const match = list?.users?.find((u: any) => (u.email || "").toLowerCase() === email);
      if (match?.id) userId = match.id;
    } catch (e) { console.warn("listUsers falhou", e); }

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
        await supabase.from("subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      }
      return new Response(JSON.stringify({ ok: true, type: "subscription", action: "canceled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let expiresAt: string | null = null;
    if (planType === "monthly") {
      const baseMs = existing?.expires_at && new Date(existing.expires_at).getTime() > Date.now()
        ? new Date(existing.expires_at).getTime() : Date.now();
      expiresAt = new Date(baseMs + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    if (existing) {
      await supabase.from("subscriptions").update({
        status: "active", expires_at: expiresAt,
        user_id: userId ?? undefined,
        cakto_transaction_id: transactionId ?? undefined,
        updated_at: new Date().toISOString(),
      }).eq("id", existing.id);
    } else {
      await supabase.from("subscriptions").insert({
        buyer_email: email, user_id: userId, plan_type: planType,
        status: "active", expires_at: expiresAt,
        cakto_transaction_id: transactionId,
      });
    }

    return new Response(JSON.stringify({
      ok: true, type: "subscription", plan_type: planType, expires_at: expiresAt, linked_user: !!userId,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("cakto-webhook error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
