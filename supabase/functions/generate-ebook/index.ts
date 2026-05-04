// Async ebook generator.
// Mode "start": creates the ebook row in DB with status=processing and kicks
// off the heavy work in the background (EdgeRuntime.waitUntil). Returns
// immediately with the ebook id. Frontend polls the `ebooks` row to get
// progress and the finished chapters.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const TEXT_MODEL = "google/gemini-2.0-flash";

type Json = Record<string, unknown>;
const admin = () => createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callAI(body: Json, attempt = 0): Promise<{ data?: any; error?: { status: number; text: string } }> {
  try {
    const resp = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text();
      // Retry on transient
      if ((resp.status === 429 || resp.status >= 500) && attempt < 2) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        return callAI(body, attempt + 1);
      }
      return { error: { status: resp.status, text } };
    }
    return { data: await resp.json() };
  } catch (e) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      return callAI(body, attempt + 1);
    }
    return { error: { status: 500, text: e instanceof Error ? e.message : String(e) } };
  }
}


async function searchPexelsAndUpload(
  query: string,
  userId: string,
  kind: "cover" | "chapter",
  orientation: "landscape" | "portrait" = "landscape",
): Promise<string | null> {
  if (!PEXELS_API_KEY) {
    console.error("PEXELS_API_KEY not configured");
    return null;
  }
  try {
    // Pexels search
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "15");
    url.searchParams.set("orientation", orientation);
    url.searchParams.set("size", "large");
    const resp = await fetch(url.toString(), {
      headers: { Authorization: PEXELS_API_KEY },
    });
    if (!resp.ok) {
      console.error(`Pexels error ${resp.status}:`, await resp.text());
      return null;
    }
    const data = await resp.json();
    const photos: any[] = data.photos ?? [];
    if (!photos.length) {
      console.warn(`Pexels: no results for "${query}"`);
      return null;
    }
    // Pick a random one from the top results to add variety between ebooks
    const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 10))];
    const imgUrl: string =
      pick.src?.large2x || pick.src?.large || pick.src?.original;
    if (!imgUrl) return null;

    // Download bytes
    const imgResp = await fetch(imgUrl);
    if (!imgResp.ok) {
      console.error("Pexels image download failed:", imgResp.status);
      return null;
    }
    const contentType = imgResp.headers.get("content-type") || "image/jpeg";
    const bytes = new Uint8Array(await imgResp.arrayBuffer());
    const ext = contentType.includes("png") ? "png" : "jpg";
    const path = `${userId}/${kind}-${crypto.randomUUID()}.${ext}`;
    const sb = admin();
    const { error: upErr } = await sb.storage
      .from("ebook-images")
      .upload(path, bytes, { contentType, upsert: false });
    if (upErr) {
      console.error("Upload failed:", upErr);
      return null;
    }
    const { data: pub } = sb.storage.from("ebook-images").getPublicUrl(path);
    return pub.publicUrl;
  } catch (e) {
    console.error(`Pexels (${kind}) error:`, e);
    return null;
  }
}

async function getUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth) return null;
  const sb = admin();
  const token = auth.replace("Bearer ", "");
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

// ----------- AI calls -----------

async function generateStructure(niche: string, audience: string) {
  const sys = `Você é um autor profissional de ebooks digitais bestsellers em português brasileiro.
Crie a estrutura COMPLETA de um ebook irresistível. Responda APENAS com JSON válido (sem markdown, sem comentários).
Formato exato:
{
  "title": "string (máx 70 chars, chamativo)",
  "subtitle": "string (máx 120 chars, promessa clara)",
  "cover_keywords": "2 a 4 palavras EM INGLÊS para buscar uma foto de capa em banco de imagens (ex: 'business success laptop', 'healthy food kitchen'). Use termos visuais concretos.",
  "chapters": [
    { "title": "string", "subtitle": "string curto (1 frase de promessa)", "image_keywords": "2 a 4 palavras EM INGLÊS para buscar uma foto temática no banco de imagens (ex: 'morning routine coffee'). Termos visuais concretos, sem texto." }
  ]
}
Gere EXATAMENTE 6 capítulos (nem mais, nem menos).`;
  const user = `Nicho: ${niche}\nPúblico-alvo: ${audience || "geral"}`;
  const result = await callAI({
    model: TEXT_MODEL,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
  });
  if (result.error) throw new Error(`structure: ${result.error.text}`);
  const txt = result.data?.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(txt);
}

async function generateChapter(args: {
  ebookTitle: string;
  audience: string;
  chapterTitle: string;
  chapterSubtitle: string;
  chapterIndex: number;
  totalChapters: number;
}) {
  const sys = `Você é um autor profissional de ebooks digitais bestsellers.
Escreva um capítulo COMPLETO, profundo e prático em português brasileiro.
- REQUISITO DE TAMANHO: O conteúdo DEVE ter entre 800 e 1200 palavras para ser considerado um capítulo de alta qualidade.
- Estrutura interna obrigatória:
  1. Introdução cativante que conecte com a dor do leitor (3-4 parágrafos).
  2. 4 a 6 subseções aprofundadas com subtítulos (##) explorando conceitos, técnicas ou estratégias.
  3. Exemplos práticos, estudos de caso ou exercícios passo a passo.
  4. Conclusão ou resumo com os próximos passos imediatos.
- Formatação: Use markdown (## para subtítulos, **negrito** para ênfase, listas com marcadores).
- Tom: Profissional, motivador e autoritário.
- NÃO repita o título do capítulo no início.
Responda APENAS com o conteúdo em markdown, sem comentários extras.`;
  const user = `Ebook: "${args.ebookTitle}"
Público-alvo: ${args.audience || "geral"}
Capítulo ${args.chapterIndex + 1} de ${args.totalChapters}: "${args.chapterTitle}"
Objetivo/Promessa deste capítulo: ${args.chapterSubtitle}`;
  const result = await callAI({
    model: TEXT_MODEL,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    max_tokens: 3000,
    temperature: 0.7,
  });
  if (result.error) throw new Error(`chapter ${args.chapterIndex}: ${result.error.text}`);
  return result.data?.choices?.[0]?.message?.content ?? "";
}

// ----------- Background worker -----------

async function runWorker(ebookId: string, userId: string, niche: string, audience: string) {
  const sb = admin();
  const updateProgress = (progress: Json, extra: Json = {}) =>
    sb.from("ebooks").update({ generation_progress: progress, ...extra }).eq("id", ebookId);

  try {
    // 1. Structure
    await updateProgress({ stage: "structure", message: "Criando estrutura..." });
    const structure = await generateStructure(niche, audience);
    let chapters: Array<{ title: string; subtitle: string; image_keywords?: string }> =
      structure.chapters ?? [];
    // Garantir exatamente 6 capítulos
    if (chapters.length > 6) chapters = chapters.slice(0, 6);
    while (chapters.length < 6) {
      chapters.push({
        title: `Capítulo ${chapters.length + 1}`,
        subtitle: "Conteúdo complementar",
        image_keywords: niche,
      });
    }
    const total = chapters.length;

    await sb.from("ebooks").update({
      title: structure.title,
      subtitle: structure.subtitle,
      generation_progress: { stage: "content", message: "Estrutura pronta. Gerando conteúdo e buscando imagens...", total, done: 0 },
    }).eq("id", ebookId);

    // 2. Cover (in parallel with first chapter content) — uses Pexels
    const coverQuery = (structure.cover_keywords || niche || "business").toString().slice(0, 80);
    const coverPromise = searchPexelsAndUpload(coverQuery, userId, "cover", "portrait").then(async (url) => {
      if (url) await sb.from("ebooks").update({ cover_url: url }).eq("id", ebookId);
      return url;
    });

    // 3. Chapters: process sequentially to be robust and avoid timeouts/rate limits
    let done = 0;
    for (let i = 0; i < total; i++) {
      const ch = chapters[i];
      try {
        // 1 imagem a cada 2 capítulos: capítulos com índice 0, 2, 4 recebem imagem (total 3)
        const shouldHaveImage = i % 2 === 0;
        
        const contentPromise = generateChapter({
          ebookTitle: structure.title,
          audience,
          chapterTitle: ch.title,
          chapterSubtitle: ch.subtitle,
          chapterIndex: i,
          totalChapters: total,
        });

        const imagePromise = shouldHaveImage
          ? searchPexelsAndUpload(
              (ch.image_keywords || ch.title || niche).toString().slice(0, 80),
              userId,
              "chapter",
              "landscape",
            )
          : Promise.resolve(null);

        const [content, imageUrl] = await Promise.all([contentPromise, imagePromise]);

        if (!content || content.length < 100) {
          throw new Error("Conteúdo gerado muito curto ou vazio");
        }

        await sb.from("chapters").insert({
          ebook_id: ebookId,
          user_id: userId,
          title: ch.title,
          content,
          image_url: imageUrl,
          order_index: i,
        });
      } catch (e) {
        console.error(`Chapter ${i} failed:`, e);
        // Retry once or insert placeholder
        await sb.from("chapters").insert({
          ebook_id: ebookId,
          user_id: userId,
          title: ch.title,
          content: `## ${ch.title}\n\n_Desculpe, houve um erro ao gerar este capítulo automaticamente. Você pode editá-lo manualmente clicando no capítulo abaixo._`,
          image_url: null,
          order_index: i,
        });
      } finally {
        done += 1;
        await updateProgress({ 
          stage: "content", 
          message: `Gerando capítulo ${done} de ${total}...`, 
          total, 
          done 
        });
      }
    }

    await coverPromise; // ensure cover finishes too

    await sb.from("ebooks").update({
      generation_status: "done",
      generation_progress: { stage: "done", message: "Concluído!", total, done: total },
    }).eq("id", ebookId);

    // Increment monthly counter only on success
    const { data: profile } = await sb
      .from("profiles")
      .select("ebooks_generated_this_month")
      .eq("user_id", userId)
      .single();
    if (profile) {
      await sb.from("profiles")
        .update({ ebooks_generated_this_month: (profile.ebooks_generated_this_month ?? 0) + 1 })
        .eq("user_id", userId);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Worker failed:", msg);
    await sb.from("ebooks").update({
      generation_status: "failed",
      generation_error: msg,
      generation_progress: { stage: "failed", message: msg },
    }).eq("id", ebookId);
  }
}

// ----------- HTTP entrypoint -----------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const body = await req.json();
    const { mode } = body;
    const userId = await getUserId(req);
    if (!userId) return jsonResponse({ error: "Não autenticado" }, 401);

    if (mode === "start") {
      const { niche, audience } = body as { niche: string; audience?: string };
      if (!niche?.trim()) return jsonResponse({ error: "Nicho obrigatório" }, 400);

      const sb = admin();

      // Limit check
      const { data: profile } = await sb
        .from("profiles")
        .select("monthly_ebook_limit, ebooks_generated_this_month, last_ebook_reset_at")
        .eq("user_id", userId)
        .single();

      if (profile) {
        const now = new Date();
        const lastReset = new Date(profile.last_ebook_reset_at ?? now);
        let usage = profile.ebooks_generated_this_month ?? 0;
        const isNewMonth =
          now.getMonth() !== lastReset.getMonth() ||
          now.getFullYear() !== lastReset.getFullYear();
        if (isNewMonth) {
          usage = 0;
          await sb.from("profiles")
            .update({ ebooks_generated_this_month: 0, last_ebook_reset_at: now.toISOString() })
            .eq("user_id", userId);
        }
        if (usage >= (profile.monthly_ebook_limit ?? 20)) {
          return jsonResponse({
            error: `Você atingiu seu limite mensal de ${profile.monthly_ebook_limit} eBooks.`,
          }, 403);
        }
      }

      // Create skeleton row
      const { data: ebook, error: insErr } = await sb
        .from("ebooks")
        .insert({
          user_id: userId,
          title: "Gerando...",
          niche,
          audience: audience ?? null,
          category: niche,
          status: "draft",
          is_public: false,
          generation_status: "processing",
          generation_progress: { stage: "queued", message: "Iniciando..." },
          generation_input: { niche, audience: audience ?? null },
        })
        .select("id")
        .single();
      if (insErr || !ebook) throw insErr ?? new Error("Falha ao criar ebook");

      // Kick off background work
      // @ts-ignore EdgeRuntime is available in Supabase Edge runtime
      EdgeRuntime.waitUntil(runWorker(ebook.id, userId, niche, audience ?? ""));

      return jsonResponse({ ebook_id: ebook.id });
    }

    return jsonResponse({ error: "mode inválido" }, 400);
  } catch (e) {
    console.error("generate-ebook error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
