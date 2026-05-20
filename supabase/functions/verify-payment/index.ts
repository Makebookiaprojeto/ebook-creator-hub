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
    const { data: purchase } = await supabase
      .from("purchases")
      .select("seller_user_id, ebook_id")
      .eq("platform_session_id", session_id)
      .maybeSingle();

    let pdfUrl: string | null = null;
    let ebookTitle: string = "Seu eBook";
    if (purchase?.ebook_id) {
      const { data: ebook } = await supabase
        .from("ebooks")
        .select("pdf_url, title")
        .eq("id", purchase.ebook_id)
        .maybeSingle();
      pdfUrl = ebook?.pdf_url ?? null;
      ebookTitle = ebook?.title ?? ebookTitle;
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paid = session.payment_status === "paid";
    const buyerEmail = session.customer_details?.email;

    await supabase
      .from("purchases")
      .update({
        status: paid ? "paid" : session.payment_status,
        buyer_email: buyerEmail ?? null,
        platform_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
      })
      .eq("platform_session_id", session_id);

    // Disparar e-mail se estiver pago e tivermos as informações necessárias
    if (paid && buyerEmail && pdfUrl) {
      console.log(`Disparando e-mail para ${buyerEmail} do eBook ${ebookTitle}`);
      try {
        await supabase.functions.invoke("send-ebook-email", {
          body: { 
            customerEmail: buyerEmail, 

            ebookTitle, 
            pdfUrl 
          },
        });
      } catch (emailErr) {
        console.error("Erro ao disparar e-mail:", emailErr);
        // Não travamos a resposta principal se o e-mail falhar
      }
    }

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
