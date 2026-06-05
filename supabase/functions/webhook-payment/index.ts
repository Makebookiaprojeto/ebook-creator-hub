import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cakto-signature",
};

const APPROVED_STATUSES = new Set([
  "paid", "approved", "completed", "success", "succeeded"
]);

const PENDING_STATUSES = new Set([
  "pending", "waiting_payment", "pending_payment", "created"
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const rawBody = await req.text();
    const contentType = req.headers.get("content-type") || "not specified";
    const method = req.method;
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key] = key.toLowerCase().includes("authorization") || key.toLowerCase().includes("key") ? "[REDACTED]" : value;
    });

    console.log("--- WEBHOOK AUDIT START ---");
    console.log(`Method: ${method}`);
    console.log(`Content-Type: ${contentType}`);
    console.log(`Headers: ${JSON.stringify(headersObj)}`);
    console.log(`Body Size: ${rawBody.length} bytes`);
    console.log(`Raw Body: ${rawBody}`);
    
    let payload: any = {};
    let parseError = null;
    try { 
      payload = JSON.parse(rawBody);
      console.log("Parse JSON: Success");
    } catch (e) { 
      parseError = (e as Error).message;
      console.log(`Parse JSON: Failed (${parseError})`);
    }

    const data = payload?.data || payload;
    console.log("Fields Found:", {
      product_id: data?.product_id,
      "product.id": data?.product?.id,
      offer_id: data?.offer_id,
      "offer.id": data?.offer?.id,
      status: data?.status,
      amount: data?.amount || data?.value || data?.amount_cents,
      "customer.email": data?.customer?.email || data?.email,
      transaction_id: data?.id || data?.transaction_id
    });
    console.log("--- WEBHOOK AUDIT END ---");

    // Cakto uses x-cakto-signature or just sends the payload
    const signature = req.headers.get("x-cakto-signature");
    const expectedSecret = Deno.env.get("CAKTO_WEBHOOK_SECRET");

    if (expectedSecret && signature && signature !== expectedSecret) {
      console.warn("Cakto Webhook: Assinatura inválida");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Common extraction for Cakto
    const data = payload?.data || payload;
    const email = (data?.customer?.email || data?.email || "").toLowerCase().trim();
    const status = (data?.status || "").toLowerCase();
    const planType = (data?.metadata?.plan_type || "monthly").toLowerCase(); // monthly or lifetime
    const transactionId = String(data?.id || data?.transaction_id || "");
    
    // Support multiple product ID formats for better compatibility
    const productId = data?.product_id || data?.product?.id || payload?.product_id || payload?.product?.id;
    
    if (productId) {
      console.log(`Product ID identified: ${productId}`);
    } else {
      console.log("No product_id found in payload. Proceeding as possible subscription.");
    }

    const amountCents = data?.amount_cents || data?.value || data?.amount || 0;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email ausente" }), { 
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // --- LOGIC FOR EBOOK SALES ---
    if (productId) {
      console.log(`Processing ebook sale for product_id: ${productId}`);
      
      const { data: ebook, error: ebookError } = await supabase
        .from("ebooks")
        .select("id, user_id, title")
        .eq("cakto_product_id", productId)
        .maybeSingle();

      if (ebookError) {
        console.error("Error finding ebook:", ebookError);
      } else if (ebook) {
        console.log(`Product located: ${ebook.title} (ID: ${ebook.id})`);
        
        const isApproved = APPROVED_STATUSES.has(status);
        const isPending = PENDING_STATUSES.has(status);

        if (isApproved || isPending) {
          // Check for existing purchase to prevent duplicates
          const { data: existingPurchase } = await supabase
            .from("purchases")
            .select("id, status")
            .eq("platform_transaction_id", transactionId)
            .maybeSingle();

          if (existingPurchase) {
            console.log(`Duplicate detected for transaction ${transactionId}. Current status: ${existingPurchase.status}`);
            
            // If the incoming status is approved and existing is pending, update it
            if (isApproved && existingPurchase.status === 'pending') {
              const { error: updateError } = await supabase
                .from("purchases")
                .update({ 
                  status: 'approved',
                  updated_at: new Date().toISOString()
                })
                .eq("id", existingPurchase.id);

              if (!updateError) {
                console.log(`Venda atualizada para approved: ${transactionId}`);
                
                // Create notification for approved sale
                await supabase.from("notifications").insert({
                  user_id: ebook.user_id,
                  title: "Venda aprovada",
                  message: "Pagamento confirmado para seu ebook.",
                  type: "sale",
                  read: false
                });
                console.log("Notificação de venda aprovada criada");
              }
            }
          } else {
            // New purchase
            const finalStatus = isApproved ? 'approved' : 'pending';
            const { error: insertError } = await supabase
              .from("purchases")
              .insert({
                ebook_id: ebook.id,
                seller_user_id: ebook.user_id,
                buyer_email: email,
                platform_transaction_id: transactionId,
                amount_paid_cents: amountCents,
                status: finalStatus,
                platform: "cakto"
              });

            if (!insertError) {
              console.log(`Venda criada: ${transactionId} com status ${finalStatus}`);
              
              // Create notification
              const notifTitle = isApproved ? "Venda aprovada" : "Venda pendente";
              const notifMsg = isApproved 
                ? "Pagamento confirmado para seu ebook." 
                : "Uma nova compra foi iniciada para seu ebook.";
              const notifType = isApproved ? "sale" : "pending_sale";

              await supabase.from("notifications").insert({
                user_id: ebook.user_id,
                title: notifTitle,
                message: notifMsg,
                type: notifType,
                read: false
              });
              console.log(`Notificação de ${notifType} criada`);
            } else {
              console.error("Error inserting purchase:", insertError);
            }
          }
        }
      } else {
        console.log(`Product with cakto_product_id ${productId} not found in ebooks table.`);
      }
    }

    // --- LOGIC FOR SUBSCRIPTIONS (Existing) ---
    // Only process subscriptions if it's NOT an ebook sale (or if logic allows both)
    // For now, keeping current subscription logic as fallback
    if (APPROVED_STATUSES.has(status) && !productId) {
      const expiresAt = planType === "lifetime" ? null : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
      
      // 1. Find User by Email (handling pagination if many users)
      let user = null;
      let page = 1;
      while (true) {
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
          page: page,
          perPage: 1000
        });
        if (listError || !users || users.length === 0) break;
        user = users.find(u => u.email?.toLowerCase() === email);
        if (user) break;
        page++;
        if (page > 10) break; // Safety limit
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
          cakto_transaction_id: transactionId,
          expires_at: expiresAt
        }, { onConflict: 'user_id' });

        console.info(`Assinatura ativada para usuário existente: ${email} (${planType})`);
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
            cakto_transaction_id: transactionId,
            expires_at: expiresAt,
            updated_at: new Date().toISOString()
          }).eq("id", existingPending.id);
          console.info(`Assinatura pendente atualizada para: ${email} (${planType})`);
        } else {
          await supabase.from("subscriptions").insert({
            buyer_email: email,
            plan_type: planType,
            status: "active",
            cakto_transaction_id: transactionId,
            expires_at: expiresAt
          });
          console.info(`Assinatura pendente criada para: ${email} (${planType})`);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (e) {
    console.error("Cakto Webhook Error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { 
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
