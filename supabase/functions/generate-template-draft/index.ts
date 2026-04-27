// Gera um rascunho completo de template de ebook (título, subtítulo, capa, capítulos com conteúdo)
// usando Lovable AI. Apenas admins podem chamar. O admin revisa e salva.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const TEXT_MODEL = "google/gemini-2.5-flash";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) return jsonResponse({ error: "LOVABLE_API_KEY não configurada" }, 500);

    // Auth + admin check
    const auth = req.headers.get("Authorization");
    if (!auth) return jsonResponse({ error: "Não autenticado" }, 401);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: userData, error: userErr } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (userErr || !userData.user) return jsonResponse({ error: "Não autenticado" }, 401);

    const { data: isAdminData } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdminData) return jsonResponse({ error: "Apenas administradores" }, 403);

    const { niche, audience } = await req.json();
    if (!niche || typeof niche !== "string" || niche.length < 2 || niche.length > 200) {
      return jsonResponse({ error: "Nicho inválido" }, 400);
    }

    // 1) Estrutura
    const structRes = await callAI({
      model: TEXT_MODEL,
      messages: [
        {
          role: "system",
          content: "Você é um copywriter especialista em ebooks digitais comerciais em PT-BR. Sempre responda chamando a tool fornecida.",
        },
        {
          role: "user",
          content: `Crie um TEMPLATE BASE de ebook profissional sobre "${niche}".${audience ? ` Público sugerido: ${audience}.` : ""} Gere: título magnético genérico (≤60 chars), subtítulo (≤120 chars), prompt de capa (em INGLÊS, fotorrealista, sem texto), e 6 capítulos com title + subtitle. Conteúdo deve ser EVERGREEN (atemporal), aplicável a vários públicos do nicho.`,
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "create_template",
          description: "Retorna estrutura do template",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              subtitle: { type: "string" },
              cover_prompt: { type: "string" },
              chapters: {
                type: "array",
                items: {
                  type: "object",
                  properties: { title: { type: "string" }, subtitle: { type: "string" } },
                  required: ["title", "subtitle"],
                  additionalProperties: false,
                },
                minItems: 5, maxItems: 8,
              },
            },
            required: ["title", "subtitle", "cover_prompt", "chapters"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "create_template" } },
    });

    if ("error" in structRes && structRes.error) {
      return jsonResponse({ error: structRes.error.text }, structRes.error.status);
    }
    const structure = JSON.parse(
      structRes.data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "{}"
    );

    // 2) Conteúdo dos capítulos (paralelo)
    const chapterDefs: { title: string; subtitle: string }[] = structure.chapters ?? [];
    const contents = await Promise.all(chapterDefs.map(async (c, idx) => {
      const r = await callAI({
        model: TEXT_MODEL,
        messages: [
          {
            role: "system",
            content: "Você escreve ebooks comerciais EVERGREEN em PT-BR. Conteúdo aprofundado, natural, exemplos genéricos aplicáveis a qualquer leitor do nicho. Use '## ' para subtítulos, '- ' para listas. Não use '# '.",
          },
          {
            role: "user",
            content: `Ebook template: "${structure.title}".${audience ? ` Público sugerido: ${audience}.` : ""}
Escreva o capítulo ${idx + 1} de ${chapterDefs.length}: "${c.title}" — ${c.subtitle}.
Estrutura: abertura envolvente, 2-3 subtítulos, exemplos práticos GENÉRICOS, fechamento.
Tamanho: 700-1000 palavras. Tom: profissional, próximo, motivador.
IMPORTANTE: Conteúdo evergreen, sem datas específicas, sem nomes de pessoas/marcas reais.`,
          },
        ],
      });
      if ("error" in r && r.error) return "Conteúdo a ser gerado.";
      return r.data.choices?.[0]?.message?.content ?? "";
    }));

    const chapters = chapterDefs.map((c, i) => ({
      title: c.title,
      subtitle: c.subtitle,
      content: contents[i],
    }));

    return jsonResponse({
      title: structure.title,
      subtitle: structure.subtitle,
      cover_prompt: structure.cover_prompt,
      chapters,
    });
  } catch (e) {
    console.error("generate-template-draft error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
