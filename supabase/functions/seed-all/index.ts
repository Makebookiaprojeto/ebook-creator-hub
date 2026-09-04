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
    const { action, templates } = await req.json();
    
    // Simple hardcoded auth to prevent unauthorized use
    const adminToken = req.headers.get("x-admin-token");
    if (adminToken !== "AGY_SEED_TOKEN_2026") {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (action === "wipe_all") {
      // Wipes all templates
      const { error } = await supabase.from('ebook_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      return jsonResponse({ success: true, message: "Wiped all templates" });
    }

    if (action === "wipe_niche") {
      const niche = templates[0]?.niche;
      if (!niche) throw new Error("Niche not provided");
      const { error } = await supabase.from('ebook_templates').delete().eq('niche', niche);
      if (error) throw error;
    }

    if (action === "insert" || action === "wipe_niche") {
      if (!Array.isArray(templates) || templates.length === 0) {
         return jsonResponse({ error: "No templates provided" }, 400);
      }
      const { error } = await supabase.from('ebook_templates').insert(templates);
      if (error) throw error;
      return jsonResponse({ success: true, message: `Inserted ${templates.length} templates` });
    }

    return jsonResponse({ error: "Invalid action" }, 400);

  } catch (e) {
    console.error("seed-all error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
