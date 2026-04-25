import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ebook_id } = await req.json();
    if (!ebook_id) {
      return new Response(JSON.stringify({ error: "ebook_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: ebook, error } = await supabase
      .from("ebooks")
      .select("id, title, description, cover_url, price_cents, user_id, is_public, slug")
      .eq("id", ebook_id)
      .maybeSingle();

    if (error || !ebook) {
      return new Response(JSON.stringify({ error: "Ebook não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!ebook.is_public) {
      return new Response(JSON.stringify({ error: "Ebook não disponível" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const amount = ebook.price_cents ?? 0;
    if (amount < 50) {
      return new Response(JSON.stringify({ error: "Preço inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar conta Stripe Connect do vendedor
    const { data: sellerProfile } = await supabase
      .from("profiles")
      .select("stripe_account_id, stripe_charges_enabled")
      .eq("user_id", ebook.user_id)
      .maybeSingle();

    if (!sellerProfile?.stripe_account_id || !sellerProfile.stripe_charges_enabled) {
      return new Response(JSON.stringify({
        error: "O vendedor ainda não conectou sua conta de pagamentos. Tente novamente em breve.",
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-11-20.acacia",
    });

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "";

    // Direct charge na conta conectada — 100% para o vendedor
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "brl",
          product_data: {
            name: ebook.title,
            description: ebook.description?.slice(0, 500) || undefined,
            images: ebook.cover_url ? [ebook.cover_url] : undefined,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      success_url: `${origin}/e/${ebook.slug}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/e/${ebook.slug}?canceled=1`,
    }, {
      stripeAccount: sellerProfile.stripe_account_id,
    });

    await supabase.from("orders").insert({
      ebook_id: ebook.id,
      ebook_owner_id: ebook.user_id,
      amount_cents: amount,
      currency: "brl",
      status: "pending",
      stripe_session_id: session.id,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
