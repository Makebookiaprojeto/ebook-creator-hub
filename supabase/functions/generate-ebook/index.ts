// Generates ebook structure, chapter content, and AI images via Lovable AI Gateway.
// Images are uploaded to the public `ebook-images` storage bucket and the public URL is returned.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const TEXT_MODEL = "google/gemini-2.5-flash";
const IMAGE_MODEL = "google/gemini-3.1-flash-image-preview";

async function callAI(body: Record<string, unknown>) {
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
    return { error: { status: resp.status, text } };
  }
  return { data: await resp.json() };
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL from image model");
  const contentType = match[1];
  const b64 = match[2];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, contentType };
}

async function generateAndUploadImage(prompt: string, userId: string, kind: "cover" | "chapter") {
  const result = await callAI({
    model: IMAGE_MODEL,
    messages: [{ role: "user", content: prompt }],
    modalities: ["image", "text"],
  });
  if ("error" in result) return { error: result.error };

  const dataUrl: string | undefined =
    result.data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!dataUrl) return { error: { status: 500, text: "No image returned by model" } };

  const { bytes, contentType } = dataUrlToBytes(dataUrl);
  const ext = contentType.split("/")[1] || "png";
  const path = `${userId}/${kind}-${crypto.randomUUID()}.${ext}`;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { error: upErr } = await supabase.storage
    .from("ebook-images")
    .upload(path, bytes, { contentType, upsert: false });
  if (upErr) return { error: { status: 500, text: upErr.message } };

  const { data: pub } = supabase.storage.from("ebook-images").getPublicUrl(path);
  return { url: pub.publicUrl };
}

async function getUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth) return null;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const token = auth.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const body = await req.json();
    const { mode } = body;

    // ---------- structure ----------
    if (mode === "structure") {
      const { niche, audience } = body;
      const result = await callAI({
        model: TEXT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Você é um copywriter especialista em ebooks digitais comerciais em português do Brasil. Sempre responda chamando a tool fornecida.",
          },
          {
            role: "user",
            content: `Crie a estrutura de um ebook profissional sobre "${niche}".${
              audience ? ` Público-alvo: ${audience}.` : ""
            } Gere: título magnético (máx 60 caracteres), subtítulo persuasivo (máx 120 caracteres), e 6 capítulos com título curto e subtítulo descritivo. Os capítulos devem ter progressão lógica (introdução → fundamentos → prática → resultados).`,
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
                  cover_prompt: {
                    type: "string",
                    description:
                      "Detailed English prompt to generate the ebook cover image. Describe a concrete, photorealistic scene that visually represents the ebook's core theme: include the main subject, setting, lighting (natural or cinematic), camera angle, mood, and color palette. Prefer real-world photography or hyperrealistic 3D rendering over abstract or generic art. NO text, NO typography, NO letters in the image.",
                  },
                  chapters: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        subtitle: { type: "string" },
                      },
                      required: ["title", "subtitle"],
                      additionalProperties: false,
                    },
                    minItems: 5,
                    maxItems: 8,
                  },
                },
                required: ["title", "subtitle", "cover_prompt", "chapters"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_ebook_structure" } },
      });

      if ("error" in result && result.error) return jsonResponse({ error: result.error.text }, result.error.status);

      const args = result.data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      return jsonResponse(JSON.parse(args));
    }

    // ---------- chapter content ----------
    if (mode === "chapter") {
      const { ebookTitle, audience, chapterTitle, chapterSubtitle, chapterIndex, totalChapters } = body;
      const result = await callAI({
        model: TEXT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Você é um escritor profissional de ebooks comerciais em português do Brasil. Escreva conteúdo aprofundado, natural, envolvente e humano. Use parágrafos bem espaçados, exemplos práticos, e quando útil, listas numeradas ou com bullet (use '- ' no início da linha). Use '## ' para subtítulos dentro do capítulo. Não use '# ' (título principal). Evite linguagem robótica.",
          },
          {
            role: "user",
            content: `Ebook: "${ebookTitle}".${audience ? ` Público: ${audience}.` : ""}
Escreva o capítulo ${chapterIndex + 1} de ${totalChapters}: "${chapterTitle}" — ${chapterSubtitle ?? ""}.
Estrutura sugerida: abertura envolvente, 2-3 subtítulos com '## ', exemplos práticos, fechamento com gancho para o próximo capítulo.
Tamanho: 700-1000 palavras. Tom: profissional, próximo, motivador.`,
          },
        ],
      });

      if ("error" in result && result.error) return jsonResponse({ error: result.error.text }, result.error.status);
      const content = result.data.choices?.[0]?.message?.content ?? "";
      return jsonResponse({ content });
    }

    // ---------- image generation (cover or chapter) ----------
    if (mode === "image") {
      const userId = await getUserId(req);
      if (!userId) return jsonResponse({ error: "Não autenticado" }, 401);

      const { prompt, kind } = body as { prompt: string; kind: "cover" | "chapter" };
      const styled =
        kind === "cover"
          ? `Photorealistic ebook cover photograph, ultra-detailed, cinematic lighting, shallow depth of field, professional DSLR photography, natural colors, real-world scene, high resolution, intuitive visual metaphor that clearly represents the topic, magazine-quality composition. Absolutely NO text, NO letters, NO typography, NO logos, NO watermarks anywhere in the image. Subject: ${prompt}`
          : `Photorealistic editorial photograph for an ebook chapter, ultra-detailed real-world scene, natural lighting, professional photography, intuitive and literal visual representation of the concept (show real people, objects, or environments — not abstract shapes), shallow depth of field, magazine quality, lifelike textures and colors. Absolutely NO text, NO letters, NO typography, NO logos, NO watermarks anywhere in the image. Subject: ${prompt}`;

      const result = await generateAndUploadImage(styled, userId, kind);
      if ("error" in result && result.error) return jsonResponse({ error: result.error.text }, result.error.status);
      return jsonResponse({ url: result.url });
    }

    return jsonResponse({ error: "mode inválido" }, 400);
  } catch (e) {
    console.error("generate-ebook error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
