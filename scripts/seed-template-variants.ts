// Gera as variantes 2, 3 e 4 de cada nicho (60 templates novos).
// Para cada variante:
//   1. Chama Lovable AI (Gemini Flash) para produzir título, subtítulo, 5 capítulos (~100 palavras cada)
//      e 6 queries Pexels (1 capa + 5 capítulos).
//   2. Baixa as imagens do Pexels, faz upload no bucket ebook-images.
//   3. UPSERT em ebook_templates com variant_index 2|3|4.
//
// Uso: bun run scripts/seed-template-variants.ts
// Requer: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LOVABLE_API_KEY, PEXELS_API_KEY.

import { createClient } from "@supabase/supabase-js";
import { NICHES } from "./templates-variants-config";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY!;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const TEXT_MODEL = "google/gemini-2.5-flash-lite";

type Chapter = { title: string; content: string; pexels_query: string };
type GeneratedTemplate = {
  title: string;
  subtitle: string;
  cover_pexels_query: string;
  chapters: Chapter[];
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateContent(
  niche: string,
  angle: string,
  toneHint: string,
): Promise<GeneratedTemplate> {
  const sys = `Você é um editor sênior de ebooks digitais premium em português brasileiro. Produza conteúdo profissional, profundo, original e prático. Use a tool 'emit_template' para retornar a estrutura.`;
  const user = `Nicho: ${niche}
Ângulo editorial específico (foco desta edição): ${angle}
Tom: ${toneHint}

Crie um ebook com:
- title: título magnético (até 65 caracteres)
- subtitle: promessa clara (até 130 caracteres)
- cover_pexels_query: 3-5 palavras EM INGLÊS para buscar foto profissional de capa
- 5 chapters, cada um com:
  - title: até 60 caracteres
  - content: 90 a 120 palavras, parágrafo único, denso, sem markdown, sem listas, sem repetir o título
  - pexels_query: 3-5 palavras EM INGLÊS para foto temática do capítulo

Importante: o conteúdo deve girar EXCLUSIVAMENTE sobre o ângulo "${angle}", não cobrir o nicho de forma genérica. Cada capítulo aborda um aspecto diferente desse ângulo.`;

  const body = {
    model: TEXT_MODEL,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "emit_template",
          description: "Retorna a estrutura do template",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              subtitle: { type: "string" },
              cover_pexels_query: { type: "string" },
              chapters: {
                type: "array",
                minItems: 5,
                maxItems: 5,
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    pexels_query: { type: "string" },
                  },
                  required: ["title", "content", "pexels_query"],
                  additionalProperties: false,
                },
              },
            },
            required: ["title", "subtitle", "cover_pexels_query", "chapters"],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "emit_template" } },
  };

  let lastErr = "";
  for (let attempt = 0; attempt < 8; attempt++) {
    const resp = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (resp.ok) {
      const data = await resp.json();
      const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) throw new Error(`No tool args: ${JSON.stringify(data).slice(0, 300)}`);
      return JSON.parse(args);
    }
    lastErr = `${resp.status}: ${(await resp.text()).slice(0, 200)}`;
    if (resp.status === 429 || resp.status >= 500) {
      const wait = Math.min(60000, 8000 * Math.pow(1.6, attempt));
      console.warn(`   ⏳ rate-limit, esperando ${Math.round(wait / 1000)}s (tentativa ${attempt + 1}/8)`);
      await sleep(wait);
      continue;
    }
    throw new Error(`AI call failed ${lastErr}`);
  }
  throw new Error(`AI call failed after retries: ${lastErr}`);
}

async function fetchPexelsAndUpload(
  supabase: ReturnType<typeof createClient>,
  query: string,
  storagePath: string,
  orientation: "landscape" | "portrait",
): Promise<string | null> {
  // Pexels search
  const u = new URL("https://api.pexels.com/v1/search");
  u.searchParams.set("query", query);
  u.searchParams.set("per_page", "15");
  u.searchParams.set("orientation", orientation);
  u.searchParams.set("size", "large");
  u.searchParams.set("sort", "popular");
  const resp = await fetch(u.toString(), { headers: { Authorization: PEXELS_API_KEY } });
  if (!resp.ok) {
    console.warn(`Pexels failed (${query}): ${resp.status}`);
    return null;
  }
  const data = await resp.json();
  const photos: any[] = data.photos ?? [];
  if (!photos.length) {
    console.warn(`Pexels no photo for: ${query}`);
    return null;
  }
  const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 8))];
  const imgUrl: string = pick.src?.large2x || pick.src?.large || pick.src?.original;
  if (!imgUrl) return null;

  const imgResp = await fetch(imgUrl);
  if (!imgResp.ok) return null;
  const bytes = new Uint8Array(await imgResp.arrayBuffer());
  const contentType = imgResp.headers.get("content-type") || "image/jpeg";

  const { error: upErr } = await supabase.storage
    .from("ebook-images")
    .upload(storagePath, bytes, { contentType, upsert: true });
  if (upErr) {
    console.error("upload error:", upErr.message);
    return null;
  }
  const { data: pub } = supabase.storage.from("ebook-images").getPublicUrl(storagePath);
  return pub.publicUrl;
}

async function processVariant(
  supabase: ReturnType<typeof createClient>,
  niche: string,
  slug: string,
  variantIndex: number,
  angle: string,
  toneHint: string,
) {
  console.log(`\n→ ${niche} v${variantIndex} (${angle})`);
  const gen = await generateContent(niche, angle, toneHint);

  // images in parallel (cover + 5 chapters)
  const ts = Date.now();
  const [coverUrl, ...chapterUrls] = await Promise.all([
    fetchPexelsAndUpload(
      supabase,
      gen.cover_pexels_query,
      `templates/${slug}/v${variantIndex}/cover-${ts}.jpg`,
      "portrait",
    ),
    ...gen.chapters.map((c, idx) =>
      fetchPexelsAndUpload(
        supabase,
        c.pexels_query,
        `templates/${slug}/v${variantIndex}/chapter-${idx + 1}-${ts}.jpg`,
        "landscape",
      ),
    ),
  ]);

  const chaptersJson = gen.chapters.map((c, idx) => ({
    title: c.title,
    subtitle: "",
    content: c.content,
    image_url: chapterUrls[idx],
  }));

  // Check if variant exists
  const { data: existing } = await supabase
    .from("ebook_templates")
    .select("id")
    .eq("variant_index", variantIndex)
    .ilike("niche", niche)
    .maybeSingle();

  const payload = {
    niche,
    title: gen.title,
    subtitle: gen.subtitle,
    cover_prompt: gen.cover_pexels_query,
    cover_url: coverUrl,
    chapters: chaptersJson,
    tags: [slug, "premium", `variant-${variantIndex}`],
    is_active: true,
    variant_index: variantIndex,
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("ebook_templates")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw error;
    console.log(`   UPDATED ${niche} v${variantIndex} — "${gen.title}"`);
  } else {
    const { error } = await supabase.from("ebook_templates").insert(payload);
    if (error) throw error;
    console.log(`   INSERTED ${niche} v${variantIndex} — "${gen.title}"`);
  }
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  for (const cfg of NICHES) {
    for (let i = 0; i < 3; i++) {
      const variantIndex = i + 2; // 2, 3, 4
      const variant = cfg.variants[i];
      try {
        await processVariant(supabase, cfg.niche, cfg.slug, variantIndex, variant.angle, variant.toneHint);
      } catch (e) {
        console.error(`FAILED ${cfg.niche} v${variantIndex}:`, e instanceof Error ? e.message : e);
      }
      await sleep(15000); // 15s throttle between variantes para respeitar rate limit
    }
    await sleep(5000);
  }
  console.log("\n✓ Seed completo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
