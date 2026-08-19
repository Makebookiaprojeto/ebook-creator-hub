import { createClient } from "@supabase/supabase-js";

// Pegue as chaves do .env local ou do ambiente
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY || !PEXELS_API_KEY) {
  console.error("Faltam chaves de API! Certifique-se de configurar VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY e PEXELS_API_KEY no seu arquivo .env.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const GATEWAY = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const TEXT_MODEL = "gemini-2.5-flash-lite";

async function callAI(body: any) {
  const resp = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`AI error: ${resp.status} - ${text}`);
  }
  return await resp.json();
}

async function searchPexels(query: string, orientation: "landscape" | "portrait" = "landscape"): Promise<string | null> {
  try {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "5");
    url.searchParams.set("orientation", orientation);
    const resp = await fetch(url.toString(), { headers: { Authorization: PEXELS_API_KEY! } });
    if (!resp.ok) return null;
    const data = await resp.json();
    const photos = data.photos ?? [];
    if (!photos.length) return null;
    // Pega sempre a primeira imagem, que é a mais relevante
    return photos[0].src?.large2x || photos[0].src?.large || photos[0].src?.original || null;
  } catch (e) {
    console.error("Pexels error:", e);
    return null;
  }
}

async function main() {
  console.log("Buscando templates do banco de dados...");
  const { data: templates, error } = await supabase.from("ebook_templates").select("*").eq("is_active", true);
  if (error || !templates) {
    console.error("Erro ao buscar templates:", error);
    return;
  }
  console.log(`Encontrados ${templates.length} templates ativos.`);

  for (let i = 0; i < templates.length; i++) {
    const t = templates[i];
    console.log(`\n[${i + 1}/${templates.length}] Processando Template: ${t.title} (Nicho: ${t.niche})`);

    const baseChapters = Array.isArray(t.chapters) ? t.chapters : [];

    // Chama o Gemini para gerar as queries de imagem em inglês baseadas no template
    console.log("  - Gerando termos visuais de busca via IA (Inglês)...");
    try {
      const personalizationRes = await callAI({
        model: TEXT_MODEL,
        messages: [
          {
            role: "system",
            content: "Você é um assistente que gera termos de pesquisa para bancos de imagem."
          },
          {
            role: "user",
            content: `Template do nicho "${t.niche}".
Título: ${t.title}
Capítulos:
${baseChapters.map((c: any, idx: number) => `${idx + 1}. ${c.title}`).join("\n")}

Gere termos de pesquisa EXCLUSIVAMENTE EM INGLÊS otimizados para um banco de imagens (como Pexels) para a CAPA (cover_image_query_en) e para CADA CAPÍTULO (chapter_image_queries_en). Os termos devem ser curtos (2-4 palavras no máximo), focados no visual e altamente representativos do nicho/tema (ex: "healthy fresh food", "woman fitness gym", "calm peaceful mind"). Nunca use palavras soltas sem sentido visual.`,
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_queries",
            description: "Gera as queries de imagem",
            parameters: {
              type: "object",
              properties: {
                cover_image_query_en: { type: "string" },
                chapter_image_queries_en: {
                  type: "array",
                  items: { type: "string" },
                  minItems: baseChapters.length,
                  maxItems: baseChapters.length,
                },
              },
              required: ["cover_image_query_en", "chapter_image_queries_en"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_queries" } },
      });

      const args = personalizationRes.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) throw new Error("IA não retornou tool_calls");
      const parsed = JSON.parse(args);

      const coverQuery = parsed.cover_image_query_en || t.title;
      console.log(`  - Buscando imagem de capa para query: "${coverQuery}"`);
      const newCoverUrl = await searchPexels(coverQuery, "portrait");

      const newChapters = [];
      for (let j = 0; j < baseChapters.length; j++) {
        const c = baseChapters[j];
        const chapterQuery = parsed.chapter_image_queries_en[j] || c.title;
        console.log(`  - Buscando imagem para Cap ${j + 1} com query: "${chapterQuery}"`);
        const imageUrl = await searchPexels(chapterQuery, "landscape") || c.image_url;
        newChapters.push({ ...c, image_url: imageUrl });
      }

      console.log("  - Atualizando template no banco de dados...");
      const { error: updateErr } = await supabase
        .from("ebook_templates")
        .update({
          cover_url: newCoverUrl || t.cover_url,
          chapters: newChapters
        })
        .eq("id", t.id);
        
      if (updateErr) {
        console.error("  - ERRO ao atualizar banco:", updateErr);
      } else {
        console.log("  - Sucesso!");
      }

      // Pequeno delay para evitar rate limit da API do Pexels
      await new Promise(r => setTimeout(r, 1000));

    } catch (err: any) {
      console.error("  - Erro ao processar template:", err.message);
    }
  }

  console.log("\nProcessamento concluído! Todos os templates foram atualizados com imagens fixas de alta qualidade no banco de dados.");
}

main();
