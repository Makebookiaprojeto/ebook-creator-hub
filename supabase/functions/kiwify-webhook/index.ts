// Webhook público da Kiwify.
// Endpoint: POST /functions/v1/kiwify-webhook?signature=...
// A Kiwify assina o body com HMAC-SHA1 usando o "Token do webhook" do produto.
// O autor deve cadastrar esse mesmo token no campo "Token de validação do webhook"
// do eBook na biblioteca.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM = "kiwify";

const APPROVED = new Set(["paid", "approved", "order_approved"]);
const REFUND = new Set(["refunded", "chargeback", "canceled", "order_refunded"]);

async function hmacSha1Hex(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-1" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const providedSig = url.searchParams.get("signature") ?? "";

    const rawBody = await req.text();
    let payload: any = {};
    try { payload = JSON.parse(rawBody); } catch { /* ignore */ }
    console.log("kiwify-webhook payload:", rawBody.slice(0, 2000));

    const status = String(
      payload?.order_status ?? payload?.status ?? payload?.webhook_event_type ?? ""
    ).toLowerCase();

    const productId = String(
      payload?.Product?.product_id ??
      payload?.product?.id ??
      payload?.product_id ??
      ""
    ).trim();

    const email = String(
      payload?.Customer?.email ??
      payload?.customer?.email ??
      payload?.email ??
      ""
    ).toLowerCase().trim();

    const transactionId = String(
      payload?.order_id ??
      payload?.transaction_id ??
      payload?.id ??
      ""
    ).trim() || null;

    const amount = payload?.Commissions?.charge_amount
      ?? payload?.charge_amount
      ?? payload?.amount;
    const amountCents = typeof amount === "number"
      ? (amount < 1000 ? Math.round(amount * 100) : Math.round(amount))
      : null;

    const isApproved = APPROVED.has(status);
    const isRefund = REFUND.has(status);

    if (!email || !productId) {
      return new Response(JSON.stringify({ error: "email ou product id ausente" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isApproved && !isRefund) {
      return new Response(JSON.stringify({ ignored: true, status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: ebook } = await supabase
      .from("ebooks")
      .select("id, user_id, title, pdf_url, payment_webhook_secret")
      .eq("cakto_product_id", productId)
      .eq("payment_platform", PLATFORM)
      .maybeSingle();

    if (!ebook) {
      return new Response(JSON.stringify({ error: "ebook não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validação obrigatória: HMAC-SHA1 do body com o token do autor
    const secret = (ebook as any).payment_webhook_secret as string | null;
    if (!secret) {
      console.warn("kiwify-webhook: ebook sem token configurado", ebook.id);
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const expectedSig = await hmacSha1Hex(secret, rawBody);
    if (providedSig.toLowerCase() !== expectedSig.toLowerCase()) {
      console.warn("kiwify-webhook: assinatura inválida", { providedSig, ebookId: ebook.id });
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
      return new Response(JSON.stringify({ ok: true, action: "refunded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("ebook_sales").insert({
      ebook_id: ebook.id,
      ebook_owner_id: ebook.user_id,
      customer_email: email,
      amount_paid_cents: amountCents,
      status: "paid",
      platform: PLATFORM,
      platform_transaction_id: transactionId,
    } as any);

    if (ebook.pdf_url) {
      try {
        await supabase.functions.invoke("send-ebook-email", {
          body: { customerEmail: email, ebookTitle: ebook.title, pdfUrl: ebook.pdf_url },
        });
      } catch (e) {
        console.error("send-ebook-email falhou:", e);
      }
    }

    return new Response(JSON.stringify({ ok: true, ebook_id: ebook.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("kiwify-webhook error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
