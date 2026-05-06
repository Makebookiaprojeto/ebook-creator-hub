import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function callAI(messages: any[]) {
  const resp = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  const data = await resp.json();
  return JSON.parse(data.choices[0].message.content);
}

async function searchPexelsAndUpload(query: string, userId: string, kind: string, orientation: string = "landscape") {
  if (!PEXELS_API_KEY) return null;
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "10");
  url.searchParams.set("orientation", orientation);
  url.searchParams.set("size", "large");
  url.searchParams.set("sort", "popular");

  const resp = await fetch(url.toString(), { headers: { Authorization: PEXELS_API_KEY } });
  if (!resp.ok) return null;
  const data = await resp.json();
  const photos = data.photos ?? [];
  if (!photos.length) return null;

  const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 5))];
  const imgUrl = pick.src?.large2x || pick.src?.large;

  const imgResp = await fetch(imgUrl);
  const contentType = imgResp.headers.get("content-type") || "image/jpeg";
  const bytes = new Uint8Array(await imgResp.arrayBuffer());
  const path = `${userId}/${kind}-${crypto.randomUUID()}.jpg`;

  await sb.storage.from("ebook-images").upload(path, bytes, { contentType });
  const { data: pub } = sb.storage.from("ebook-images").getPublicUrl(path);
  return pub.publicUrl;
}

async function updateEbookImages(ebook: any) {
  console.log(`Updating images for: ${ebook.title}`);
  
  const prompt = [
    { role: "system", content: "Gere palavras-chave cinematográficas em inglês para busca de imagens profissionais no Pexels. Responda apenas com JSON: { \"cover\": \"string\", \"chapters\": [\"string\", \"string\"] }" },
    { role: "user", content: `Ebook Title: ${ebook.title}\nNiche: ${ebook.niche}\nChapters: ${ebook.content_json.map((c: any) => c.title).join(", ")}` }
  ];

  try {
    const keywords = await callAI(prompt);
    
    // Update Cover
    const newCover = await searchPexelsAndUpload(keywords.cover, ebook.user_id, "cover", "portrait");
    
    // Update Chapters (usually 1st and 4th based on logic)
    const newContent = [...ebook.content_json];
    for (let i = 0; i < newContent.length; i++) {
      if (i === 0 || i === 3) {
        const kw = keywords.chapters[i === 0 ? 0 : 1] || keywords.cover;
        const newImg = await searchPexelsAndUpload(kw, ebook.user_id, "chapter", "landscape");
        if (newImg) newContent[i].image_url = newImg;
      }
    }

    const updates: any = { content_json: newContent };
    if (newCover) updates.cover_url = newCover;

    await sb.from("ebooks").update(updates).eq("id", ebook.id);
    console.log(`Successfully updated ${ebook.title}`);
  } catch (e) {
    console.error(`Failed to update ${ebook.title}:`, e);
  }
}

async function main() {
  const { data: ebooks } = await sb.from("ebooks").select("*").eq("generation_status", "done").limit(5);
  if (!ebooks) return;
  for (const ebook of ebooks) {
    await updateEbookImages(ebook);
  }
}

main();
