import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-11-20.acacia",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Localizar order para descobrir conta Stripe Connect do vendedor
    const { data: order } = await supabase
      .from("orders")
      .select("ebook_owner_id, ebook_id")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    let pdfUrl: string | null = null;
    if (order?.ebook_id) {
      const { data: ebook } = await supabase
        .from("ebooks")
        .select("pdf_url")
        .eq("id", order.ebook_id)
        .maybeSingle();
      pdfUrl = ebook?.pdf_url ?? null;
    }

    let stripeAccount: string | undefined;
    if (order?.ebook_owner_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_account_id")
        .eq("user_id", order.ebook_owner_id)
        .maybeSingle();
      stripeAccount = profile?.stripe_account_id ?? undefined;
    }

    const session = await stripe.checkout.sessions.retrieve(
      session_id,
      stripeAccount ? { stripeAccount } : undefined,
    );
    const paid = session.payment_status === "paid";

    await supabase
      .from("orders")
      .update({
        status: paid ? "paid" : session.payment_status,
        buyer_email: session.customer_details?.email ?? null,
        stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
      })
      .eq("stripe_session_id", session_id);

    return new Response(JSON.stringify({ paid, status: session.payment_status, pdf_url: paid ? pdfUrl : null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify-payment error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
