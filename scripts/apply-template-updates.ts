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

  // Remove qualquer linha antiga (ex: seeds de migration anteriores) que
  // ocupe o mesmo nicho + variante 1 mas com um ID diferente do curado,
  // pra evitar colisão com a constraint única (niche, variant_index).
  const curatedIds = TEMPLATES.map((t) => t.id);
  const curatedNiches = TEMPLATES.map((t) => t.niche);
  const { data: stale, error: staleError } = await supabase
    .from("ebook_templates")
    .select("id, niche")
    .in("niche", curatedNiches)
    .not("id", "in", `(${curatedIds.join(",")})`);
  if (staleError) throw new Error(`Failed to check stale rows: ${staleError.message}`);
  if (stale && stale.length > 0) {
    const staleIds = stale.map((r) => r.id);
    const { error: deleteError } = await supabase.from("ebook_templates").delete().in("id", staleIds);
    if (deleteError) throw new Error(`Failed to delete stale rows: ${deleteError.message}`);
    console.log(`Removidas ${staleIds.length} linha(s) antiga(s) duplicada(s): ${stale.map((r) => r.niche).join(", ")}`);
  }

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
      .upsert(
        {
          id: template.id,
          niche: template.niche,
          title: template.title,
          subtitle: template.subtitle,
          cover_prompt: template.coverPrompt,
          cover_url: images.cover,
          chapters,
          tags: [template.slug, "premium", "pexels-4k"],
          is_active: true,
        },
        { onConflict: "id" },
      );

    if (error) throw new Error(`Upsert failed for ${template.slug}: ${error.message}`);
    console.log(`UPSERTED ${template.slug}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
