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
// Each query is written to match the SPECIFIC chapter subject (not the niche),
// targeting real people in real situations. A per-slug `style` suffix is
// appended to every query to keep visual identity coherent across the ebook.
const QUERIES: Record<string, { cover: string; chapters: string[]; style: string }> = {
  decoracao: {
    style: "natural light photography editorial",
    cover: "elegant designed living room interior architecture magazine",
    chapters: [
      "interior designer selecting fabric swatches mood board",
      "warm pendant lamp lit cozy living room evening",
      "neutral color palette wall paint samples textured",
      "minimalist tidy living room sofa morning light",
      "indoor plants styled shelf living room",
    ],
  },
  beleza: {
    style: "soft natural skincare portrait",
    cover: "woman radiant glowing skin natural beauty portrait",
    chapters: [
      "woman washing face gentle cleanser bathroom mirror",
      "woman applying moisturizer cream face bathroom",
      "woman applying sunscreen face outdoor sunlight",
      "woman sleeping calm bed healthy fruit nightstand",
      "woman daily skincare routine bathroom morning",
    ],
  },
  "desenvolvimento-pessoal": {
    style: "calm editorial lifestyle photography",
    cover: "person journaling sunrise window personal growth",
    chapters: [
      "person writing reflection journal coffee morning",
      "person planning goals checklist notebook desk",
      "person building habit reading book quiet morning",
      "tidy minimalist workspace desk clean room",
      "person weekly review journal sunday calm",
    ],
  },
  emagrecimento: {
    style: "warm lifestyle wellness photography",
    cover: "woman healthy lifestyle morning kitchen bright",
    chapters: [
      "woman eating colorful salad bowl mindful table",
      "woman walking outdoor park morning exercise",
      "woman sleeping peacefully bed bedroom night",
      "woman drinking water glass kitchen hydration",
      "woman jogging consistency outdoor sunrise",
    ],
  },
  empreendedorismo: {
    style: "documentary small business photography",
    cover: "young entrepreneur small business owner shop",
    chapters: [
      "entrepreneur interviewing customer notebook cafe",
      "founder sketching simple prototype whiteboard",
      "focused entrepreneur deep work laptop quiet",
      "small business owner reviewing cash flow spreadsheet",
      "entrepreneur late night working laptop persistence",
    ],
  },
  espiritualidade: {
    style: "soft golden light contemplative photography",
    cover: "person meditating sunrise mountain peaceful silhouette",
    chapters: [
      "person meditating candle silence morning room",
      "person hands gratitude prayer warm light",
      "person walking forest path nature sunlight",
      "person yoga mat morning home practice",
      "volunteers helping community kindness hands",
    ],
  },
  estudos: {
    style: "focused study documentary lighting",
    cover: "student studying focused library books concentrated",
    chapters: [
      "student reading exam document highlighter notes",
      "student morning study routine desk planner",
      "student answering practice exam questions paper",
      "student reviewing flashcards study notes",
      "student stretching healthy snack break study",
    ],
  },
  financas: {
    style: "clean modern financial lifestyle photography",
    cover: "person reviewing personal finances laptop notebook home",
    chapters: [
      "person reviewing bank statements calculator notebook",
      "couple monthly budget kitchen table calculator",
      "person paying off credit card bills laptop home",
      "person saving emergency fund jar coins notebook",
      "young investor checking stocks chart smartphone",
    ],
  },
  fitness: {
    style: "gritty gym strength training photography",
    cover: "muscular man weightlifting gym strong barbell",
    chapters: [
      "man squat barbell rack gym progressive load",
      "athlete high protein meal chicken rice plate",
      "athlete resting stretching gym bench recovery",
      "personal trainer correcting deadlift form gym",
      "athlete consistent gym discipline years training",
    ],
  },
  idiomas: {
    style: "warm modern study photography",
    cover: "person learning english headphones laptop notebook",
    chapters: [
      "person listening english podcast headphones home",
      "people speaking conversation language cafe friends",
      "person writing vocabulary notebook flashcards",
      "english grammar textbook student desk reading",
      "person language daily practice calendar laptop",
    ],
  },
  "marketing-digital": {
    style: "modern creator workspace photography",
    cover: "creator filming content phone ring light home",
    chapters: [
      "entrepreneur researching niche notebook laptop coffee",
      "content creator filming video phone tripod",
      "marketer crafting offer landing page laptop",
      "marketer analyzing ads dashboard laptop screen",
      "support agent customer chat smiling laptop",
    ],
  },
  maternidade: {
    style: "tender warm family photography",
    cover: "mother holding newborn baby tender bonding",
    chapters: [
      "mother baby sleeping crib nursery night",
      "mother breastfeeding baby calm home",
      "grandmother helping mother baby family support",
      "tired mother coffee morning baby self care",
      "mother baby skin contact eye bonding",
    ],
  },
  moda: {
    style: "editorial fashion lifestyle photography",
    cover: "stylish woman outfit street fashion confident",
    chapters: [
      "woman mirror checking outfit fit body bedroom",
      "capsule wardrobe neutral clothes organized rack",
      "linen cotton quality fabric clothing closeup",
      "stylish accessories watch leather bag closeup",
      "confident woman walking street style sunlight",
    ],
  },
  pets: {
    style: "warm dog companionship photography",
    cover: "person hugging dog love park golden hour",
    chapters: [
      "owner feeding dog healthy bowl kitchen home",
      "trainer rewarding dog treat positive training park",
      "person running dog park exercise outdoor",
      "veterinarian examining dog clinic checkup",
      "person cuddling dog couch home bond",
    ],
  },
  receitas: {
    style: "appetizing food photography natural light",
    cover: "healthy meal prep bowl colorful kitchen table",
    chapters: [
      "grilled chicken bowl vegetables rice plate top view",
      "omelette vegetables pan skillet cooking kitchen",
      "salmon roasted vegetables plate dinner table",
      "protein smoothie glass post workout fruit",
      "fresh complete salad bowl wooden table",
    ],
  },
  relacionamentos: {
    style: "warm intimate couple photography",
    cover: "happy couple holding hands sunset walking",
    chapters: [
      "couple talking honest conversation coffee cafe",
      "couple setting boundaries calm discussion home",
      "couple cooking together kitchen quality time",
      "couple resolving conflict calmly listening home",
      "couple gratitude smiling embrace home",
    ],
  },
  "renda-extra": {
    style: "modern remote work lifestyle photography",
    cover: "freelancer working laptop coffee home office",
    chapters: [
      "freelance designer working laptop home office",
      "online course creator filming tutorial laptop camera",
      "affiliate marketer laptop honest review desk",
      "handyman local service smiling client neighborhood",
      "person investing extra income laptop notebook",
    ],
  },
  "saude-mental": {
    style: "calm soft mental health photography",
    cover: "woman breathing calm window peaceful morning",
    chapters: [
      "woman deep breathing meditation calm window",
      "person walking outdoor park mental health",
      "person putting away phone digital detox book",
      "friends supportive conversation coffee park",
      "therapist talking patient counseling session",
    ],
  },
  tecnologia: {
    style: "modern developer workspace photography",
    cover: "developer coding laptop screen code programmer",
    chapters: [
      "beginner programmer learning laptop tutorial notes",
      "developer coding daily practice laptop desk",
      "developer reviewing github portfolio screen",
      "developer reading english documentation laptop",
      "developers collaborating community meetup laptops",
    ],
  },
  viagens: {
    style: "cinematic travel photography",
    cover: "traveler airport window plane sunrise wanderlust",
    chapters: [
      "traveler booking flight laptop home suitcase",
      "traveler entering hotel room suitcase boutique",
      "tourist scenic viewpoint travel itinerary map",
      "tourist eating local street food market",
      "traveler passport documents suitcase organized",
    ],
  },
};
// Append per-slug style suffix to every query for visual coherence.
for (const slug of Object.keys(QUERIES)) {
  const q = QUERIES[slug];
  q.cover = `${q.cover} ${q.style}`;
  q.chapters = q.chapters.map((c) => `${c} ${q.style}`);
}

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
