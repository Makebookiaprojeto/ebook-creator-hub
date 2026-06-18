// Applies the curated 20 ebook templates using URLs generated in /tmp/template-images-state.json.
// Run after image collection: bun run scripts/apply-template-updates.ts

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { TEMPLATES } from "./templates-content";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STATE_FILE = "/tmp/template-images-state.json";

type State = Record<string, { cover?: string; chapters: Record<number, string> }>;

function loadState(): State {
  if (!existsSync(STATE_FILE)) throw new Error(`Missing image state file: ${STATE_FILE}`);
  return JSON.parse(readFileSync(STATE_FILE, "utf8"));
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const state = loadState();

  for (const template of TEMPLATES) {
    const images = state[template.slug];
    if (!images?.cover) throw new Error(`Missing cover image for ${template.slug}`);

    const chapters = template.chapters.map((chapter, index) => {
      const imageUrl = images.chapters[index + 1];
      if (!imageUrl) throw new Error(`Missing chapter ${index + 1} image for ${template.slug}`);
      return {
        title: chapter.title,
        subtitle: "",
        content: chapter.content,
        image_url: imageUrl,
      };
    });

    const { error } = await supabase
      .from("ebook_templates")
      .update({
        title: template.title,
        subtitle: template.subtitle,
        cover_prompt: template.coverPrompt,
        cover_url: images.cover,
        chapters,
        tags: [template.slug, "premium", "pexels-4k"],
        is_active: true,
      })
      .eq("id", template.id);

    if (error) throw new Error(`Update failed for ${template.slug}: ${error.message}`);
    console.log(`UPDATED ${template.slug}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});