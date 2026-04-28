// Webhook público da Hotmart.
// Endpoint: POST /functions/v1/hotmart-webhook
// O autor cadastra na Hotmart o "HOTTOK" (token) e cola o MESMO valor no campo
// "Token de validação do webhook" do eBook na biblioteca.
// A Hotmart envia esse token no header `x-hotmart-hottok`.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hotmart-hottok",
};

const PLATFORM = "hotmart";

const APPROVED = new Set(["PURCHASE_APPROVED", "PURCHASE_COMPLETE", "approved"]);
const REFUND = new Set([
  "PURCHASE_REFUNDED", "PURCHASE_CHARGEBACK", "PURCHASE_CANCELED",
  "refunded", "chargeback", "canceled",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json().catch(() => ({}));
    console.log("hotmart-webhook payload:", JSON.stringify(payload));

    const event = String(payload?.event ?? payload?.data?.event ?? "");
    const data = payload?.data ?? payload;

    const productId = String(
      data?.product?.id ??
      data?.product?.ucode ??
      data?.purchase?.product?.id ??
      payload?.product?.id ??
      ""
    ).trim();

    const email = String(
      data?.buyer?.email ??
      data?.purchase?.buyer?.email ??
      payload?.buyer?.email ??
      ""
    ).toLowerCase().trim();

    const transactionId = String(
      data?.purchase?.transaction ??
      data?.transaction ??
      payload?.transaction ??
      ""
    ).trim() || null;

    const priceValue =
      data?.purchase?.price?.value ??
      data?.price?.value ??
      payload?.price?.value;
    const amountCents = typeof priceValue === "number"
      ? Math.round(priceValue * 100)
      : null;

    const providedToken = req.headers.get("x-hotmart-hottok") ?? "";

    const isApproved = APPROVED.has(event);
    const isRefund = REFUND.has(event);

    if (!email || !productId) {
      return new Response(JSON.stringify({ error: "email ou product id ausente" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isApproved && !isRefund) {
      return new Response(JSON.stringify({ ignored: true, event }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

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

    if (!ebook) {
      console.warn("hotmart-webhook: ebook não encontrado", productId);
      return new Response(JSON.stringify({ error: "ebook não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validação obrigatória: HOTTOK do autor (lido da tabela protegida)
    const { data: secretRow } = await supabase
      .from("ebook_webhook_secrets")
      .select("webhook_secret")
      .eq("ebook_id", ebook.id)
      .maybeSingle();
    const expectedToken = (secretRow as any)?.webhook_secret as string | null;
    if (!expectedToken || providedToken !== expectedToken) {
      console.warn("hotmart-webhook: HOTTOK inválido pro ebook", ebook.id);
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
    console.error("hotmart-webhook error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
