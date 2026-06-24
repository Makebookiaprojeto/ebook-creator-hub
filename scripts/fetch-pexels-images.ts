// Fetches contextual Pexels photos for the 20 templates, uploads them to the
// `ebook-images` bucket under `templates/<slug>/`, and emits the state file
// consumed by scripts/apply-template-updates.ts.
//
// Run:
//   PEXELS_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//   bun run scripts/fetch-pexels-images.ts

import { createClient } from "@supabase/supabase-js";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { TEMPLATES } from "./templates-content";
import { PEXELS_QUERIES } from "./pexels-queries";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "ebook-images";
const STATE_FILE = "/tmp/template-images-state.json";

type State = Record<string, { cover?: string; chapters: Record<number, string> }>;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

function loadState(): State {
  if (existsSync(STATE_FILE)) return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  return {};
}

function saveState(state: State) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function searchPexels(query: string, orientation: "portrait" | "landscape"): Promise<string> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=${orientation}&size=large`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
  if (!res.ok) throw new Error(`Pexels search failed (${res.status}) for "${query}"`);
  const data = (await res.json()) as { photos?: Array<{ src: { large2x: string; large: string } }> };
  const photo = data.photos?.[0];
  if (!photo) throw new Error(`Pexels returned no results for "${query}"`);
  return photo.src.large2x || photo.src.large;
}

async function downloadJpg(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadJpg(path: string, buffer: Buffer): Promise<string> {
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: "image/jpeg",
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`Upload failed for ${path}: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function fetchAndUpload(query: string, orientation: "portrait" | "landscape", storagePath: string): Promise<string> {
  const photoUrl = await searchPexels(query, orientation);
  const buffer = await downloadJpg(photoUrl);
  return uploadJpg(storagePath, buffer);
}

async function main() {
  const state = loadState();

  for (const template of TEMPLATES) {
    const queries = PEXELS_QUERIES[template.slug];
    if (!queries) throw new Error(`Missing Pexels queries for slug ${template.slug}`);

    state[template.slug] ??= { chapters: {} };
    const entry = state[template.slug];

    if (!entry.cover) {
      entry.cover = await fetchAndUpload(queries.cover, "portrait", `templates/${template.slug}/cover.jpg`);
      saveState(state);
      console.log(`[${template.slug}] cover`);
    }

    for (let i = 0; i < 5; i++) {
      const chapterNum = i + 1;
      if (entry.chapters[chapterNum]) continue;
      const url = await fetchAndUpload(
        queries.chapters[i],
        "landscape",
        `templates/${template.slug}/chapter-${chapterNum}.jpg`,
      );
      entry.chapters[chapterNum] = url;
      saveState(state);
      console.log(`[${template.slug}] chapter-${chapterNum}`);
    }
  }

  console.log(`\nDONE. State at ${STATE_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
