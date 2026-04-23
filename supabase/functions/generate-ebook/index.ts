// Generates ebook structure (title, subtitle, chapter titles) and chapter content via Lovable AI
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

async function callAI(body: Record<string, unknown>) {
  const resp = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, ...body }),
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
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const { mode, niche, audience, ebookTitle, chapterTitle, chapterIndex, totalChapters } =
      await req.json();

    // ---------- MODE 1: structure (title, subtitle, chapter titles) ----------
    if (mode === "structure") {
      const result = await callAI({
        messages: [
          {
            role: "system",
            content:
              "Você é um copywriter especialista em ebooks digitais em português do Brasil. Sempre responda chamando a tool fornecida.",
          },
          {
            role: "user",
            content: `Crie a estrutura de um ebook sobre "${niche}".${
              audience ? ` Público-alvo: ${audience}.` : ""
            } Gere um título magnético, subtítulo persuasivo e 7 títulos de capítulos progressivos.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_ebook_structure",
              description: "Retorna a estrutura do ebook",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  subtitle: { type: "string" },
                  chapters: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 5,
                    maxItems: 9,
                  },
                },
                required: ["title", "subtitle", "chapters"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_ebook_structure" } },
      });

      if ("error" in result) {
        return new Response(
          JSON.stringify({ error: result.error.text }),
          { status: result.error.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const args = result.data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      const parsed = JSON.parse(args);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- MODE 2: chapter content ----------
    if (mode === "chapter") {
      const result = await callAI({
        messages: [
          {
            role: "system",
            content:
              "Você é um escritor profissional de ebooks em português do Brasil. Escreva conteúdo claro, prático e envolvente. Use parágrafos curtos, listas quando útil e exemplos concretos. Não use markdown de cabeçalho (###).",
          },
          {
            role: "user",
            content: `Ebook: "${ebookTitle}".${audience ? ` Público: ${audience}.` : ""}
Escreva o capítulo ${chapterIndex + 1} de ${totalChapters}: "${chapterTitle}".
Tamanho: 400-600 palavras. Tom: direto, motivador, prático.`,
          },
        ],
      });

      if ("error" in result) {
        return new Response(
          JSON.stringify({ error: result.error.text }),
          { status: result.error.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const content = result.data.choices?.[0]?.message?.content ?? "";
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "mode inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ebook error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
