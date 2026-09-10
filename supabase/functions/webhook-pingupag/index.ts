// Webhook PinguPag — Exclusivo para os planos de assinatura do SaaS (Mensal e Vitalício)
// Pagamentos via PIX processados pela PinguPag.
//
// Eventos tratados:
//   - approved / paid / completed / success -> ativa assinatura
//   - refunded / chargeback                -> revoga acesso

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "";
  const [u, d] = email.split("@");
  const head = u.length <= 2 ? u : u.slice(0, 2);
  return `${head}***@${d}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const rawBody = await req.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = {};
    }

    const data = payload?.data ?? payload ?? {};
    const customer = data?.customer ?? payload?.customer ?? {};

    const email = (customer?.email || data?.email || payload?.email || "")
      .toString()
      .toLowerCase()
      .trim();

    const status = (data?.status ?? payload?.status ?? "").toString().toLowerCase().trim();
    const transactionId = (
      data?.transaction_id ??
      payload?.transaction_id ??
      data?.id ??
      payload?.id ??
      ""
    ).toString();
    const amount = Number(data?.amount ?? payload?.amount ?? 0);
    const description = (data?.description ?? payload?.description ?? "").toString().toLowerCase();

    console.log("PinguPag received:", {
      status,
      email: maskEmail(email),
      transactionId,
      amount,
    });

    if (!email && status !== "refunded" && status !== "chargeback") {
      return new Response(JSON.stringify({ error: "Email ausente" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Estorno ou Chargeback
    if (status === "refunded" || status === "chargeback") {
      const reason = status;
      let sub: any = null;

      if (transactionId) {
        const { data: foundSub } = await supabase
          .from("subscriptions")
          .select("id, user_id, buyer_email, plan_type")
          .eq("cakto_transaction_id", transactionId)
          .maybeSingle();
        if (foundSub) sub = foundSub;
      }

      if (!sub && email) {
        const { data: foundSub } = await supabase
          .from("subscriptions")
          .select("id, user_id, buyer_email, plan_type")
          .eq("buyer_email", email)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (foundSub) sub = foundSub;
      }

      if (sub) {
        await supabase
          .from("subscriptions")
          .update({ status: reason, updated_at: new Date().toISOString() })
          .eq("id", sub.id);

        if (sub.user_id) {
          await supabase
            .from("profiles")
            .update({ is_lifetime: false })
            .eq("user_id", sub.user_id);
        }
      }

      return new Response(JSON.stringify({ ok: true, revoked: !!sub, reason }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Identificação do Plano
    // PinguPag Hash Mensal: bc663b82df
    // PinguPag Hash Vitalício: bda346ec22
    let isLifetime = false;
    if (rawBody.includes("bda346ec22")) {
      isLifetime = true;
    } else if (
      description.includes("vitalicio") ||
      description.includes("vitalício") ||
      description.includes("lifetime")
    ) {
      isLifetime = true;
    } else if (amount >= 20000) {
      isLifetime = true;
    }

    const planType: "monthly" | "lifetime" = isLifetime ? "lifetime" : "monthly";

    // 3. Pagamento Aprovado
    const approvedStatuses = new Set(["approved", "paid", "completed", "success", "succeeded"]);
    if (approvedStatuses.has(status)) {
      // Idempotência
      if (transactionId) {
        const { data: existingTx } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("cakto_transaction_id", transactionId)
          .maybeSingle();

        if (existingTx) {
          return new Response(JSON.stringify({ ok: true, duplicate: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      const expiresAt =
        planType === "lifetime"
          ? null
          : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();

      // Localiza usuário pelo email via RPC
      let user: { id: string } | null = null;
      const { data: rpcUserId } = await supabase.rpc("get_user_id_by_email", {
        email_param: email,
      });
      if (rpcUserId) user = { id: rpcUserId as string };

      if (user) {
        if (planType === "lifetime") {
          await supabase
            .from("profiles")
            .update({ is_lifetime: true })
            .eq("user_id", user.id);
        }

        await supabase.from("subscriptions").upsert(
          {
            user_id: user.id,
            buyer_email: email,
            plan_type: planType,
            status: "active",
            cakto_transaction_id: transactionId || null,
            expires_at: expiresAt,
          },
          { onConflict: "user_id" },
        );

        console.info(`PinguPag ativado com sucesso para: ${maskEmail(email)} (${planType})`);
      } else {
        // Usuário ainda não cadastrado: guarda pendência
        const { data: existingPending } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("buyer_email", email)
          .is("user_id", null)
          .maybeSingle();

        if (existingPending) {
          await supabase
            .from("subscriptions")
            .update({
              plan_type: planType,
              status: "active",
              cakto_transaction_id: transactionId || null,
              expires_at: expiresAt,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingPending.id);
        } else {
          await supabase.from("subscriptions").insert({
            buyer_email: email,
            plan_type: planType,
            status: "active",
            cakto_transaction_id: transactionId || null,
            expires_at: expiresAt,
          });
        }
        console.info(`PinguPag pendente registrado para: ${maskEmail(email)} (${planType})`);
      }

      return new Response(JSON.stringify({ ok: true, plan_type: planType }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, status, ignored: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PinguPag Webhook Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
