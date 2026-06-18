// Fetches premium 4K-oriented Pexels images and uploads them to Supabase storage.
// Resumable: skips images already present in /tmp/template-images-state.json.
// Run with: bun run scripts/generate-template-images.ts [start_index] [end_index]

import { createClient } from "@supabase/supabase-js";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { TEMPLATES } from "./templates-content";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STATE_FILE = "/tmp/template-images-state.json";
const BUCKET = "ebook-images";
const CONCURRENCY = 4;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

type State = Record<string, { cover?: string; chapters: Record<number, string> }>;
type Orientation = "landscape" | "portrait";
type Job = { slug: string; kind: "cover" | "chapter"; index: number; prompt: string; fallback: string };

function loadState(): State {
  if (existsSync(STATE_FILE)) return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  return {};
}
function saveState(s: State) {
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

function pexelsQueryFromPrompt(prompt: string, fallback: string): string {
  const noise = /ultra|premium|minimalist|editorial|photography|photorealistic|4k|background|lighting|composition|focus|detail|watermark|typography|turquoise|accent|element|shadow|soft|natural|diffused|seamless|white|clean|crisp|magazine|grade|refined|directional|single|large|central|subject|surface|no text|no typography|book cover|dark/gi;
  const clauses = prompt
    .replace(/#[0-9a-f]{6}/gi, " ")
    .replace(/\([^)]*\)/g, " ")
    .split(",")
    .map((part) => part.replace(noise, " ").replace(/\s+/g, " ").trim())
    .filter((part) => part.length > 8 && !/^(pure|no|subtle|fine|and)$/i.test(part));
  return (clauses.slice(0, 2).join(" ") || fallback).slice(0, 110);
}

async function searchPexels(query: string, orientation: Orientation): Promise<string> {
  let attempt = 0;
  while (true) {
    attempt++;
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", orientation);
    url.searchParams.set("size", "large");
    url.searchParams.set("per_page", "40");
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });
    if (res.status === 429 || res.status >= 500) {
      if (attempt > 8) throw new Error(`Pexels ${res.status} after ${attempt} attempts`);
      const wait = Math.min(45000, 4000 * attempt);
      console.log(`  Pexels throttled, retrying in ${wait / 1000}s (attempt ${attempt})`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Pexels ${res.status}: ${text.slice(0, 200)}`);
    }
    const body = await res.json();
    const photos = (body.photos ?? []) as Array<{ width: number; height: number; src?: Record<string, string> }>;
    if (!photos.length) throw new Error(`No Pexels photos for query: ${query}`);
    const ranked = photos
      .map((photo) => ({
        photo,
        score:
          photo.width * photo.height +
          (photo.width >= 3840 || photo.height >= 3840 ? 4_000_000 : 0) +
          (photo.width >= 2560 && photo.height >= 1440 ? 2_000_000 : 0),
      }))
      .sort((a, b) => b.score - a.score);
    return ranked[0].photo.src?.original || ranked[0].photo.src?.large2x || ranked[0].photo.src?.large || "";
  }
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadImage(slug: string, name: string, buf: Buffer): Promise<string> {
  const path = `templates/${slug}/${name}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw new Error(`Upload error ${path}: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function processJob(state: State, job: Job) {
  state[job.slug] ||= { chapters: {} };
  const existing =
    job.kind === "cover" ? state[job.slug].cover : state[job.slug].chapters[job.index];
  if (existing) {
    console.log(`SKIP ${job.slug}/${job.kind}${job.kind === "chapter" ? "-" + job.index : ""}`);
    return;
  }
  const label = `${job.slug}/${job.kind}${job.kind === "chapter" ? "-" + job.index : ""}`;
  const t0 = Date.now();
  try {
    const orientation: Orientation = job.kind === "cover" ? "portrait" : "landscape";
    const query = pexelsQueryFromPrompt(job.prompt, job.fallback);
    console.log(`QUERY ${label}: ${query}`);
    const sourceUrl = await searchPexels(query, orientation);
    if (!sourceUrl) throw new Error(`No source URL for ${query}`);
    const buf = await downloadImage(sourceUrl);
    const name = job.kind === "cover" ? "cover" : `chapter-${job.index}`;
    const url = await uploadImage(job.slug, name, buf);
    if (job.kind === "cover") state[job.slug].cover = url;
    else state[job.slug].chapters[job.index] = url;
    saveState(state);
    console.log(`OK   ${label} (${Math.round((Date.now() - t0) / 1000)}s)`);
  } catch (e: any) {
    console.error(`FAIL ${label}: ${e.message}`);
    throw e;
  }
}

async function runPool<T>(items: T[], concurrency: number, fn: (it: T) => Promise<void>) {
  let idx = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (idx < items.length) {
      const i = idx++;
      try {
        await fn(items[i]);
      } catch {
        /* keep going */
      }
    }
  });
  await Promise.all(workers);
}

async function main() {
  const start = parseInt(process.argv[2] || "0");
  const end = parseInt(process.argv[3] || String(TEMPLATES.length));
  const subset = TEMPLATES.slice(start, end);
  const state = loadState();

  const jobs: Job[] = [];
  for (const t of subset) {
    jobs.push({ slug: t.slug, kind: "cover", index: 0, prompt: t.coverPrompt, fallback: `${t.niche} ${t.title}` });
    t.chapters.forEach((c, i) => {
      jobs.push({ slug: t.slug, kind: "chapter", index: i + 1, prompt: c.imagePrompt, fallback: `${t.niche} ${c.title}` });
    });
  }
  console.log(`Processing ${jobs.length} jobs from ${subset.length} templates (concurrency ${CONCURRENCY})`);
  await runPool(jobs, CONCURRENCY, (j) => processJob(state, j));
  saveState(state);
  console.log("DONE. State at", STATE_FILE);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
