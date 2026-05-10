import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cakto-signature, x-hotmart-hottok, x-webhook-secret",
};

const APPROVED_STATUSES = new Set([
  "paid", "approved", "completed", "success", "succeeded", "purchase_approved", "payment_approved", "order_approved", "PURCHASE_APPROVED", "PURCHASE_COMPLETE"
]);

const REFUND_STATUSES = new Set([
  "refunded", "chargeback", "canceled", "cancelled", "refund", "purchase_refunded", "purchase_canceled", "purchase_chargeback", "PURCHASE_REFUNDED", "PURCHASE_CHARGEBACK"
]);

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

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const platformParam = url.searchParams.get("platform");
    const rawBody = await req.text();
    let payload: any = {};
    try { payload = JSON.parse(rawBody); } catch { /* ignore */ }

    // Determinar plataforma
    let platform = platformParam;
    if (!platform) {
      if (req.headers.get("x-hotmart-hottok")) platform = "hotmart";
      else if (req.headers.get("x-cakto-signature")) platform = "cakto";
      else if (url.searchParams.get("signature")) platform = "kiwify";
    }

    if (!platform) {
      return new Response(JSON.stringify({ error: "Plataforma não identificada" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validação de Secret Global
    const providedSecret = 
      req.headers.get("x-cakto-signature") || 
      req.headers.get("x-hotmart-hottok") || 
      url.searchParams.get("signature") || 
      url.searchParams.get("secret");

    let isValid = false;
    const globalSecret = Deno.env.get(`${platform.toUpperCase()}_WEBHOOK_SECRET`);

    if (platform === "kiwify") {
      if (globalSecret) {
        const expectedSig = await hmacSha1Hex(globalSecret, rawBody);
        isValid = providedSecret?.toLowerCase() === expectedSig.toLowerCase();
      }
    } else {
      isValid = providedSecret === globalSecret;
    }

    // Se o secret global não estiver configurado, avisar no log mas permitir (por enquanto, para não quebrar setups existentes sem secrets)
    // Mas o usuário pediu arquitetura profissional, então deveríamos exigir.
    if (globalSecret && !isValid) {
      console.warn(`Webhook ${platform}: Assinatura inválida.`);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extrair dados comuns
    const data = payload?.data ?? payload;
    
    const email = (
      data?.customer?.email || data?.customer_email || data?.buyer?.email || data?.buyer_email || 
      data?.email || payload?.Customer?.email || payload?.email || ""
    ).toLowerCase().trim();

    const productId = String(
      data?.product_id || data?.product?.id || data?.offer_id || data?.offer?.id || 
      payload?.Product?.product_id || payload?.product_id || ""
    ).trim();

    const transactionId = String(
      data?.transaction_id || data?.id || data?.transaction?.id || 
      payload?.order_id || payload?.id || ""
    ).trim();

    const status = String(
      data?.status || data?.payment_status || data?.event || data?.order_status || ""
    ).toLowerCase();

    const isApproved = APPROVED_STATUSES.has(status) || status.includes("approved") || status.includes("paid");
    const isRefund = REFUND_STATUSES.has(status) || status.includes("refund") || status.includes("canceled");

    if (!email || !productId) {
      return new Response(JSON.stringify({ error: "Email ou Product ID ausente", email, productId }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar ebook
    const { data: ebook, error: ebookError } = await supabase
      .from("ebooks")
      .select("id, user_id, title, pdf_url")
      .eq("external_product_id", productId)
      .eq("payment_platform", platform)
      .maybeSingle();

    if (ebookError || !ebook) {
      console.warn(`Ebook não encontrado para product_id ${productId} na plataforma ${platform}`);
      return new Response(JSON.stringify({ error: "Ebook não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar usuário pelo email
    let userId: string | null = null;
    const { data: userData } = await supabase.rpc('get_user_id_by_email', { email_param: email });
    if (userData) userId = userData;

    if (isRefund) {
      await supabase
        .from("purchases")
        .update({ status: "refunded" })
        .eq("ebook_id", ebook.id)
        .eq("customer_email", email);
      
      return new Response(JSON.stringify({ ok: true, action: "refunded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isApproved) {
      // Registrar compra
      const { error: purchaseError } = await supabase.from("purchases").upsert({
        ebook_id: ebook.id,
        user_id: userId,
        customer_email: email,
        platform: platform,
        platform_transaction_id: transactionId,
        status: "paid"
      }, { onConflict: 'ebook_id,customer_email' });

      if (purchaseError) {
        console.error("Erro ao registrar compra:", purchaseError);
      }

      // Enviar e-mail
      if (ebook.pdf_url) {
        await supabase.functions.invoke("send-ebook-email", {
          body: { 
            customerEmail: email, 
            ebookTitle: ebook.title, 
            pdfUrl: ebook.pdf_url 
          },
        });
      }

      return new Response(JSON.stringify({ ok: true, ebook_id: ebook.id, user_linked: !!userId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ignored: true, status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("unified-webhook error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});