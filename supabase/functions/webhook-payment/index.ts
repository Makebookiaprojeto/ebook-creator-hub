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

    // Find User
    const { data: userList } = await supabase.auth.admin.listUsers();
    const user = userList.users.find(u => u.email?.toLowerCase() === email);

    if (APPROVED_STATUSES.has(status)) {
      if (user) {
        // 1. Update Profile if Lifetime
        if (planType === "lifetime") {
          await supabase.from("profiles").update({ is_lifetime: true }).eq("user_id", user.id);
        }

        // 2. Insert/Update Subscription
        const expiresAt = planType === "lifetime" ? null : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
        
        await supabase.from("subscriptions").upsert({
          user_id: user.id,
          buyer_email: email,
          plan_type: planType,
          status: "active",
          cakto_transaction_id: transactionId,
          expires_at: expiresAt
        }, { onConflict: 'user_id' });

        console.info(`Assinatura ativada para ${email} (${planType})`);
      } else {
        console.warn(`Usuário não encontrado para o email ${email}. Acesso será ativado no primeiro login.`);
        // Optional: Store in a 'pending_activations' table if needed, 
        // but here we already have 'set_lifetime_by_email' or similar logic
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
