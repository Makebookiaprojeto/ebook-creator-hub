// Generates premium images via Lovable AI Gateway and uploads to Supabase storage.
// Resumable: skips images already present in /tmp/template-images-state.json.
// Run with: bun run scripts/generate-template-images.ts [start_index] [end_index]

import { createClient } from "@supabase/supabase-js";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { TEMPLATES } from "./templates-content";

const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STATE_FILE = "/tmp/template-images-state.json";
const BUCKET = "ebook-images";
const CONCURRENCY = 2;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

type State = Record<string, { cover?: string; chapters: Record<number, string> }>;

function loadState(): State {
  if (existsSync(STATE_FILE)) return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  return {};
}
function saveState(s: State) {
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

async function generateImage(prompt: string): Promise<Buffer> {
  let attempt = 0;
  while (true) {
    attempt++;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });
    if (res.status === 429 || res.status >= 500) {
      if (attempt > 8) throw new Error(`Gateway ${res.status} after ${attempt} attempts`);
      const wait = Math.min(60000, 5000 * attempt);
      console.log(`  rate-limited, retrying in ${wait / 1000}s (attempt ${attempt})`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gateway ${res.status}: ${text.slice(0, 200)}`);
    }
    const body = await res.json();
    const b64 = body?.data?.[0]?.b64_json;
    if (!b64) throw new Error("No b64_json: " + JSON.stringify(body).slice(0, 300));
    return Buffer.from(b64, "base64");
  }
}

async function uploadImage(slug: string, name: string, buf: Buffer): Promise<string> {
  const path = `templates/${slug}/${name}.png`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw new Error(`Upload error ${path}: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

type Job = { slug: string; kind: "cover" | "chapter"; index: number; prompt: string };

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
    const buf = await generateImage(job.prompt);
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
    jobs.push({ slug: t.slug, kind: "cover", index: 0, prompt: t.coverPrompt });
    t.chapters.forEach((c, i) => {
      jobs.push({ slug: t.slug, kind: "chapter", index: i + 1, prompt: c.imagePrompt });
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
