// Personaliza um ebook gerado a partir de um template:
// - Reescreve título e subtítulo para o público específico (1 chamada curta)
// - Adapta a INTRODUÇÃO de cada capítulo (1 chamada curta no total, batch)
// - Busca imagens no Pexels para capa e cada capítulo
// O corpo principal dos capítulos vem do template (custo zero de IA).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const TEXT_MODEL = "google/gemini-2.5-flash-lite";

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callAI(body: Record<string, unknown>) {
  const resp = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    return { error: { status: resp.status, text } };
  }
  return { data: await resp.json() };
}

async function searchPexels(query: string, orientation: "landscape" | "portrait" = "landscape"): Promise<string | null> {
  if (!PEXELS_API_KEY) return null;
  try {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "10");
    url.searchParams.set("orientation", orientation);
    const resp = await fetch(url.toString(), { headers: { Authorization: PEXELS_API_KEY } });
    if (!resp.ok) return null;
    const data = await resp.json();
    const photos = data.photos ?? [];
    if (!photos.length) return null;
    const pick = photos[Math.floor(Math.random() * photos.length)];
    return pick.src?.large2x || pick.src?.large || pick.src?.original;
  } catch (e) {
    console.error("Pexels error:", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) return jsonResponse({ error: "LOVABLE_API_KEY não configurada" }, 500);

    const auth = req.headers.get("Authorization");
    if (!auth) return jsonResponse({ error: "Não autenticado" }, 401);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: userData, error: userErr } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (userErr || !userData.user) return jsonResponse({ error: "Não autenticado" }, 401);

    const { niche, audience } = await req.json();
    if (!niche || typeof niche !== "string") return jsonResponse({ error: "Nicho inválido" }, 400);

    // Buscar template ativo via SECURITY DEFINER (bypassa RLS)
    const { data: tpls, error: tErr } = await supabase.rpc("find_active_template_by_niche", {
      _niche: niche,
    });
    if (tErr) {
      console.error("find_active_template_by_niche error:", tErr);
      return jsonResponse({ template: null });
    }
    const template = Array.isArray(tpls) && tpls.length > 0 ? tpls[0] : null;
    if (!template) return jsonResponse({ template: null });

    const baseChapters: { title: string; subtitle: string; content: string; image_url?: string }[] = template.chapters ?? [];

    // 1 chamada IA: reescreve título/subtítulo + intro de cada capítulo, adaptado ao público
    const personalizationRes = await callAI({
      model: TEXT_MODEL,
      messages: [
        {
          role: "system",
          content: "Você adapta ebooks templates para públicos específicos em PT-BR. Mantém o conteúdo original mas reescreve título, subtítulo e a abertura de cada capítulo para soar feito sob medida para o público informado. Retorne via tool.",
        },
        {
          role: "user",
          content: `Template do nicho "${niche}".
Público específico: ${audience || "geral"}.

Título atual: ${template.title}
Subtítulo atual: ${template.subtitle ?? ""}
Capítulos:
${baseChapters.map((c, i) => `${i + 1}. ${c.title} — ${c.subtitle}`).join("\n")}

Gere: novo título magnético adaptado ao público (≤60 chars), novo subtítulo (≤120 chars), e para cada capítulo um parágrafo de ABERTURA (80-120 palavras) que conecta o tema do capítulo ao público "${audience || "geral"}". Não reescreva o capítulo inteiro, só a abertura.

Além disso, gere exatamente 6 tópicos curtos de aprendizado para a seção "O que você vai aprender" da página de vendas. Cada tópico deve ter um título curto e impactante (até 40 caracteres) e uma descrição curta e persuasiva (até 120 caracteres) destacando benefícios reais do ebook para este público.`,
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "personalize",
          description: "Retorna personalização",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              subtitle: { type: "string" },
              chapter_intros: {
                type: "array",
                items: { type: "string" },
                minItems: baseChapters.length,
                maxItems: baseChapters.length,
              },
              learning_topics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["title", "description"],
                  additionalProperties: false,
                },
                minItems: 6,
                maxItems: 6,
              },
            },
            required: ["title", "subtitle", "chapter_intros", "learning_topics"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "personalize" } },
    });

    let personalized = {
      title: template.title,
      subtitle: template.subtitle,
      chapter_intros: baseChapters.map(() => ""),
    };
    if (!("error" in personalizationRes) || !personalizationRes.error) {
      const args = personalizationRes.data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (args) {
        try { personalized = { ...personalized, ...JSON.parse(args) }; } catch (_) {}
      }
    }

    // Busca imagens: Prioriza as que estão no template (fixas/profissionais)
    // Se não houver no template, faz o fallback para o searchPexels (manteve a lógica para flexibilidade futura)
    const coverUrl = template.cover_url || await searchPexels(template.cover_prompt || template.title || niche, "portrait");
    
    // Monta capítulos: intro personalizada + corpo do template + imagem do template (ou busca se faltar)
    const finalChapters = await Promise.all(baseChapters.map(async (c, i) => {
      const intro = personalized.chapter_intros[i]?.trim();
      const content = intro ? `${intro}\n\n${c.content}` : c.content;
      
      // Usa a imagem do template se disponível, senão busca
      const imageUrl = c.image_url || await searchPexels(c.title + " " + niche, "landscape");
      
      return { title: c.title, subtitle: c.subtitle, content, image_url: imageUrl };
    }));

    // Incrementa contador de uso (fire-and-forget)
    supabase.rpc("increment_template_use", { _template_id: template.id }).then(() => {});

    return jsonResponse({
      template: {
        id: template.id,
        title: personalized.title,
        subtitle: personalized.subtitle,
        cover_url: coverUrl,
        chapters: finalChapters,
      },
    });
  } catch (e) {
    console.error("personalize-template error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});