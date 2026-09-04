import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return jsonResponse({ error: "Não autenticado" }, 401);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: userData, error: userErr } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (userErr || !userData.user) return jsonResponse({ error: "Não autenticado" }, 401);

    const { niche } = await req.json();
    if (!niche || typeof niche !== "string") return jsonResponse({ error: "Nicho inválido" }, 400);

    const { data: tpls, error: tErr } = await supabase.rpc("pick_next_template_for_niche", {
      _niche: niche,
    });
    if (tErr) {
      console.error("pick_next_template_for_niche error:", tErr);
      return jsonResponse({ template: null });
    }
    const template = Array.isArray(tpls) && tpls.length > 0 ? tpls[0] : null;
    if (!template) return jsonResponse({ template: null });

    supabase.rpc("increment_template_use", { _template_id: template.id }).then(() => {});

    // Ensure we parse tags properly if it's stored as JSON array
    const topics = Array.isArray(template.tags) ? template.tags.map((t: string) => ({ title: t, description: "" })) : [];

    return jsonResponse({
      template: {
        id: template.id,
        title: template.title,
        subtitle: template.subtitle,
        cover_url: template.cover_prompt || template.cover_url, // Allow using cover_prompt to store static URL if needed
        chapters: template.chapters,
        learning_topics: topics,
      },
    });
  } catch (e) {
    console.error("personalize-template error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
