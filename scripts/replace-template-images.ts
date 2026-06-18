// Replaces ONLY the image bytes for each of the 20 active templates.
// Storage paths (and therefore public URLs / template IDs / DB rows) stay the same.
// A cache-busting ?v=<timestamp> is appended to cover_url and chapters[*].image_url
// so the new image is fetched everywhere immediately. Nothing else changes.
//
// Run: bun run scripts/replace-template-images.ts [slug1 slug2 ...]

import { createClient } from "@supabase/supabase-js";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "ebook-images";
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Orientation = "landscape" | "portrait";

// Curated Pexels queries: cover (portrait) + 5 chapter-specific (landscape).
// Queries are written in English (Pexels search is English-first) and target
// the *specific* chapter subject, not just the niche.
const QUERIES: Record<string, { cover: string; chapters: string[] }> = {
  decoracao: {
    cover: "modern luxury living room interior design",
    chapters: [
      "scandinavian interior design style mood board",
      "warm interior lighting lamps cozy room",
      "interior color palette paint swatches textures",
      "minimalist living room neutral tones",
      "indoor plants home decor green",
    ],
  },
  beleza: {
    cover: "natural skincare beauty woman portrait",
    chapters: [
      "gentle face cleanser skincare routine",
      "moisturizer cream skincare bottle",
      "sunscreen application beach face",
      "woman sleeping healthy food fruits",
      "skincare daily routine flatlay",
    ],
  },
  "desenvolvimento-pessoal": {
    cover: "person journaling sunrise mountain inspiration",
    chapters: [
      "person writing journal self reflection",
      "goal planner notebook checklist",
      "morning habits coffee book routine",
      "tidy organized workspace desk",
      "weekly planner review journal",
    ],
  },
  emagrecimento: {
    cover: "healthy meal weight loss colorful bowl",
    chapters: [
      "healthy meal preparation vegetables plate",
      "woman walking outdoors exercise",
      "person sleeping bed peaceful",
      "drinking water glass hydration",
      "fitness progress consistency calendar",
    ],
  },
  empreendedorismo: {
    cover: "small business owner laptop coffee shop",
    chapters: [
      "customer interview market research notes",
      "startup whiteboard prototype sketch",
      "focused entrepreneur single task laptop",
      "cash flow finance spreadsheet calculator",
      "entrepreneur late night working laptop",
    ],
  },
  espiritualidade: {
    cover: "person meditating sunrise peaceful nature",
    chapters: [
      "silent meditation candle morning",
      "gratitude journal hands writing",
      "forest walk nature path sunlight",
      "yoga mat morning practice home",
      "volunteer helping community hands",
    ],
  },
  estudos: {
    cover: "student studying books library desk",
    chapters: [
      "reading official document highlighter",
      "study schedule planner desk",
      "multiple choice exam answer sheet",
      "flashcards revision study notes",
      "student healthy break stretching",
    ],
  },
  financas: {
    cover: "personal finance budget planning calculator",
    chapters: [
      "person reviewing bank statements bills",
      "monthly budget notebook calculator",
      "cutting credit card debt scissors",
      "saving money jar coins emergency",
      "investment chart stocks smartphone",
    ],
  },
  fitness: {
    cover: "athletic muscular man gym training",
    chapters: [
      "weight lifting barbell gym training",
      "high protein meal chicken eggs",
      "athlete resting recovery stretching",
      "personal trainer correcting form gym",
      "long term fitness transformation gym",
    ],
  },
  idiomas: {
    cover: "english language books dictionary flag",
    chapters: [
      "language learning app smartphone headphones",
      "people speaking conversation cafe",
      "vocabulary flashcards notebook study",
      "english grammar book notebook",
      "calendar streak language study habit",
    ],
  },
  "marketing-digital": {
    cover: "digital marketing laptop analytics dashboard",
    chapters: [
      "target audience niche market research",
      "social media content creator camera",
      "sales offer landing page laptop",
      "facebook ads analytics dashboard screen",
      "customer service chat support smartphone",
    ],
  },
  maternidade: {
    cover: "mother holding newborn baby tender",
    chapters: [
      "baby sleeping crib peaceful nursery",
      "mother breastfeeding baby gentle",
      "family supporting new mother baby",
      "tired mother self care coffee",
      "mother baby bonding skin contact",
    ],
  },
  moda: {
    cover: "woman fashion style outfit street",
    chapters: [
      "woman trying clothes mirror fitting",
      "capsule wardrobe minimalist clothing rack",
      "quality fabric tailor fashion atelier",
      "fashion accessories jewelry handbag flatlay",
      "confident woman walking street fashion",
    ],
  },
  pets: {
    cover: "happy dog owner park golden retriever",
    chapters: [
      "puppy training treats obedience",
      "veterinarian examining dog clinic",
      "dog food healthy bowl ingredients",
      "dog playing fetch park exercise",
      "dog cuddling owner sofa bond",
    ],
  },
  receitas: {
    cover: "healthy fit meal bowl colorful kitchen",
    chapters: [
      "meal prep containers healthy food",
      "healthy breakfast oatmeal fruits",
      "grilled chicken vegetables plate lunch",
      "healthy dinner salmon vegetables plate",
      "healthy snacks nuts fruits energy balls",
    ],
  },
  relacionamentos: {
    cover: "happy couple holding hands sunset",
    chapters: [
      "couple talking deep conversation cafe",
      "couple listening attentively each other",
      "couple resolving conflict calm talk",
      "couple romantic dinner candles",
      "couple long term marriage embrace",
    ],
  },
  "renda-extra": {
    cover: "freelancer home office laptop side hustle",
    chapters: [
      "person brainstorming ideas notebook home",
      "freelancer laptop home office remote",
      "handmade products craft small business",
      "online seller packaging orders home",
      "freelancer scaling business growth chart",
    ],
  },
  "saude-mental": {
    cover: "person calm peaceful mental health",
    chapters: [
      "person deep breathing relaxation window",
      "therapy session psychologist counseling",
      "person nature walk forest calm",
      "journaling emotions notebook coffee",
      "supportive friends conversation park",
    ],
  },
  tecnologia: {
    cover: "programmer coding laptop screen code",
    chapters: [
      "beginner coding tutorial laptop notes",
      "html css code editor screen",
      "javascript code programming screen",
      "developer github code review pair",
      "developer building project portfolio laptop",
    ],
  },
  viagens: {
    cover: "traveler airport passport suitcase window",
    chapters: [
      "travel planning map notebook coffee",
      "cheap flights search laptop airport",
      "packing suitcase travel essentials",
      "tourist exploring city street local",
      "traveler journal photos memories",
    ],
  },
};

async function searchPexels(query: string, orientation: Orientation, exclude: Set<string>): Promise<string[]> {
  let attempt = 0;
  while (true) {
    attempt++;
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", orientation);
    url.searchParams.set("size", "large");
    url.searchParams.set("per_page", "40");
    const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (res.status === 429 || res.status >= 500) {
      if (attempt > 6) throw new Error(`Pexels ${res.status}`);
      await sleep(3000 * attempt);
      continue;
    }
    if (!res.ok) throw new Error(`Pexels ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const body = await res.json() as { photos: Array<{ id: number; width: number; height: number; src: Record<string, string> }> };
    const ranked = (body.photos ?? [])
      .filter((p) => !exclude.has(String(p.id)))
      .map((p) => ({
        p,
        score: p.width * p.height + (p.width >= 3840 || p.height >= 3840 ? 5_000_000 : 0),
      }))
      .sort((a, b) => b.score - a.score);
    return ranked.flatMap(({ p }) => {
      exclude.add(String(p.id));
      return [p.src.original, p.src.large2x, p.src.large].filter(Boolean);
    });
  }
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadImage(path: string, buf: Buffer) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: "image/jpeg",
    upsert: true,
    cacheControl: "3600",
  });
  if (error) throw new Error(`Upload ${path}: ${error.message}`);
}

async function fetchOne(query: string, orientation: Orientation, exclude: Set<string>): Promise<Buffer> {
  const urls = await searchPexels(query, orientation, exclude);
  for (const u of urls.slice(0, 8)) {
    try { return await downloadImage(u); } catch (e: any) { console.warn(`  retry: ${e.message}`); }
  }
  throw new Error(`All downloads failed for: ${query}`);
}

async function processSlug(slug: string, niche: string) {
  const q = QUERIES[slug];
  if (!q) { console.warn(`SKIP ${slug} — no query map`); return; }
  console.log(`\n=== ${slug} (${niche}) ===`);
  const exclude = new Set<string>();

  // cover
  console.log(`  cover: ${q.cover}`);
  const coverBuf = await fetchOne(q.cover, "portrait", exclude);
  await uploadImage(`templates/${slug}/cover.jpg`, coverBuf);
  console.log(`  ✓ cover uploaded`);

  // chapters
  for (let i = 0; i < q.chapters.length; i++) {
    const query = q.chapters[i];
    console.log(`  ch${i + 1}: ${query}`);
    const buf = await fetchOne(query, "landscape", exclude);
    await uploadImage(`templates/${slug}/chapter-${i + 1}.jpg`, buf);
    console.log(`  ✓ chapter-${i + 1} uploaded`);
  }

  // bump cache-buster on DB URLs (same path, new bytes)
  const v = Date.now();
  const baseUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/templates/${slug}`;
  const { data: row, error: fetchErr } = await supabase
    .from("ebook_templates")
    .select("id, chapters")
    .eq("is_active", true)
    .ilike("niche", niche)
    .maybeSingle();
  if (fetchErr || !row) throw new Error(`DB read ${slug}: ${fetchErr?.message ?? "no row"}`);
  const newChapters = (row.chapters as any[]).map((c, i) => ({
    ...c,
    image_url: `${baseUrl}/chapter-${i + 1}.jpg?v=${v}`,
  }));
  const { error: updErr } = await supabase
    .from("ebook_templates")
    .update({
      cover_url: `${baseUrl}/cover.jpg?v=${v}`,
      chapters: newChapters,
    })
    .eq("id", row.id);
  if (updErr) throw new Error(`DB update ${slug}: ${updErr.message}`);
  console.log(`  ✓ DB cache-buster updated (v=${v})`);
}

async function main() {
  const SLUG_TO_NICHE: Record<string, string> = {
    decoracao: "Arquitetura e Decoração",
    beleza: "Beleza e autocuidado",
    "desenvolvimento-pessoal": "Desenvolvimento pessoal",
    emagrecimento: "Emagrecimento",
    empreendedorismo: "Empreendedorismo",
    espiritualidade: "Espiritualidade",
    estudos: "Estudos e concursos",
    financas: "Finanças",
    fitness: "Fitness e musculação",
    idiomas: "Idiomas",
    "marketing-digital": "Marketing digital",
    maternidade: "Maternidade",
    moda: "Moda e Estilo",
    pets: "Pets",
    receitas: "Receitas e culinária",
    relacionamentos: "Relacionamentos",
    "renda-extra": "Renda extra",
    "saude-mental": "Saúde mental",
    tecnologia: "Tecnologia e programação",
    viagens: "Viagens",
  };
  const requested = process.argv.slice(2);
  const slugs = requested.length ? requested : Object.keys(SLUG_TO_NICHE);
  for (const slug of slugs) {
    try {
      await processSlug(slug, SLUG_TO_NICHE[slug]);
    } catch (e: any) {
      console.error(`FAIL ${slug}: ${e.message}`);
    }
  }
  console.log("\nDONE");
}

main().catch((e) => { console.error(e); process.exit(1); });
