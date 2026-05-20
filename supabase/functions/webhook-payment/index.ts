import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cakto-signature",
};

const APPROVED_STATUSES = new Set([
  "paid", "approved", "completed", "success", "succeeded"
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const rawBody = await req.text();
    let payload: any = {};
    try { payload = JSON.parse(rawBody); } catch { /* ignore */ }

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

    if (!email) {
      return new Response(JSON.stringify({ error: "Email ausente" }), { 
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

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

    if (APPROVED_STATUSES.has(status)) {
      const expiresAt = planType === "lifetime" ? null : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
      
      if (user) {
        // 1. Update Profile if Lifetime
        if (planType === "lifetime") {
          await supabase.from("profiles").update({ is_lifetime: true }).eq("user_id", user.id);
        }

        // 2. Insert/Update Subscription
        // The unique constraint on user_id ensures upsert works
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
        // 3. User doesn't exist yet, save as pending subscription
        // The trigger on profiles creation will link this later
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
