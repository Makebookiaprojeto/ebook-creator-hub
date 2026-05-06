import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
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
  url.searchParams.set("per_page", "20");
  url.searchParams.set("orientation", orientation);
  url.searchParams.set("size", "large");
  url.searchParams.set("sort", "popular");

  const resp = await fetch(url.toString(), { headers: { Authorization: PEXELS_API_KEY } });
  if (!resp.ok) return null;
  const data = await resp.json();
  const photos = data.photos ?? [];
  if (!photos.length) return null;

  // Pick one from top 10 for better quality
  const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 10))];
  const imgUrl = pick.src?.large2x || pick.src?.large || pick.src?.original;

  const imgResp = await fetch(imgUrl);
  const contentType = imgResp.headers.get("content-type") || "image/jpeg";
  const bytes = new Uint8Array(await imgResp.arrayBuffer());
  const path = `${userId || 'system'}/${kind}-${crypto.randomUUID()}.jpg`;

  await sb.storage.from("ebook-images").upload(path, bytes, { contentType });
  const { data: pub } = sb.storage.from("ebook-images").getPublicUrl(path);
  return pub.publicUrl;
}

async function updateEbookImages(ebook: any) {
  console.log(`Updating images for: ${ebook.title} (${ebook.id})`);
  
  const prompt = [
    { role: "system", content: "Gere palavras-chave cinematográficas e específicas em inglês para busca de imagens PROFISSIONAIS no Pexels que se encaixem perfeitamente no nicho. Responda apenas com JSON: { \"cover\": \"string\", \"chapters\": [\"string\", \"string\"] }" },
    { role: "user", content: `Ebook Title: ${ebook.title}\nNiche: ${ebook.niche}\nChapters: ${ebook.content_json.map((c: any) => c.title).join(", ")}` }
  ];

  try {
    const keywords = await callAI(prompt);
    
    // Update Cover
    const newCover = await searchPexelsAndUpload(keywords.cover + " high quality 8k", ebook.user_id, "cover", "portrait");
    
    // Update Chapters (usually index 0 and 3)
    const newContent = [...ebook.content_json];
    let updatedChapters = 0;
    for (let i = 0; i < newContent.length; i++) {
      if (i === 0 || i === 3) {
        const kw = keywords.chapters[updatedChapters] || keywords.cover;
        const newImg = await searchPexelsAndUpload(kw + " professional photography 4k", ebook.user_id, "chapter", "landscape");
        if (newImg) {
          newContent[i].image_url = newImg;
          updatedChapters++;
        }
      }
    }

    const updates: any = { content_json: newContent };
    if (newCover) updates.cover_url = newCover;

    const { error: updErr } = await sb.from("ebooks").update(updates).eq("id", ebook.id);
    if (updErr) throw updErr;
    console.log(`Successfully updated ${ebook.title}`);
  } catch (e) {
    console.error(`Failed to update ${ebook.title}:`, e);
  }
}

async function main() {
  // Select the 18 ebooks that are used as base (template/public ebooks)
  const { data: ebooks, error } = await sb.from("ebooks")
    .select("*")
    .eq("generation_status", "done")
    .eq("status", "published")
    .order("created_at", { ascending: true })
    .limit(18);
    
  if (error) {
    console.error("Error fetching ebooks:", error);
    return;
  }
  
  if (!ebooks || ebooks.length === 0) {
    console.log("No ebooks found to update.");
    return;
  }

  console.log(`Found ${ebooks.length} ebooks to update.`);
  for (const ebook of ebooks) {
    await updateEbookImages(ebook);
    // Add a small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 1000));
  }
}

main();
