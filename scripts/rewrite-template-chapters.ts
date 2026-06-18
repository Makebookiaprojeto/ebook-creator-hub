// Rewrites all ebook_templates chapters: 400+ word content per chapter.
// Keeps existing chapter titles and image_url. Removes any TOC notion.
// Uses Lovable AI Gateway (google/gemini-2.5-flash).
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY!;

const supabase = createClient(SUPABASE_URL, SRK);

type Chapter = {
  title: string;
  subtitle?: string | null;
  content: string;
  image_url?: string | null;
};

type Template = {
  id: string;
  niche: string;
  audience: string | null;
  title: string;
  subtitle: string | null;
  chapters: Chapter[];
};

async function generateForTemplate(t: Template): Promise<Chapter[]> {
  const chaptersInput = t.chapters.map((c, i) => ({ index: i + 1, title: c.title, subtitle: c.subtitle || "" }));
  const sys = `Você é um escritor profissional de ebooks em português do Brasil. Escreva conteúdo profundo, prático, com exemplos concretos, sem clichês e sem markdown headers (##). Use parágrafos separados por linha em branco. Cada capítulo deve ter NO MÍNIMO 450 palavras (objetivo 500). Não inclua o título no conteúdo. Linguagem direta, segunda pessoa.`;
  const user = `Ebook: "${t.title}"${t.subtitle ? ` — ${t.subtitle}` : ""}
Nicho: ${t.niche}
Público: ${t.audience || "geral"}

Reescreva o CONTEÚDO de cada capítulo abaixo. Responda APENAS JSON válido no formato:
{"chapters":[{"index":1,"content":"..."}, ...]}

Capítulos:
${chaptersInput.map(c => `${c.index}. ${c.title}${c.subtitle ? ` — ${c.subtitle}` : ""}`).join("\n")}`;

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) {
    throw new Error(`AI ${resp.status}: ${await resp.text()}`);
  }
  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(text);
  const out: Chapter[] = t.chapters.map((c, i) => {
    const found = (parsed.chapters || []).find((x: any) => Number(x.index) === i + 1);
    return {
      title: c.title,
      subtitle: c.subtitle || "",
      content: (found?.content || c.content || "").trim(),
      image_url: c.image_url || null,
    };
  });
  return out;
}

function wc(s: string) { return s.trim().split(/\s+/).length; }

async function main() {
  const { data, error } = await supabase
    .from("ebook_templates")
    .select("id, niche, audience, title, subtitle, chapters")
    .order("niche");
  if (error) throw error;
  const templates = data as Template[];
  console.log(`Found ${templates.length} templates`);

  for (const t of templates) {
    // skip if already long enough
    const minLen = Math.min(...t.chapters.map(c => (c.content || "").trim().split(/\s+/).length));
    if (minLen >= 420) {
      console.log(`\n→ ${t.niche} — already long (min ${minLen}), skip`);
      continue;
    }
    console.log(`\n→ ${t.niche} — ${t.title} (min ${minLen})`);
    let attempt = 0;
    let delay = 8000;
    while (attempt < 6) {
      try {
        const newChapters = await generateForTemplate(t);
        const counts = newChapters.map(c => wc(c.content));
        console.log(`  word counts: ${counts.join(", ")}`);
        if (counts.some(n => n < 380)) {
          attempt++;
          console.log(`  too short, retry ${attempt}`);
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        const { error: upErr } = await supabase
          .from("ebook_templates")
          .update({ chapters: newChapters })
          .eq("id", t.id);
        if (upErr) throw upErr;
        console.log(`  ✓ updated`);
        await new Promise(r => setTimeout(r, 6000));
        break;
      } catch (e: any) {
        attempt++;
        console.error(`  attempt ${attempt} failed:`, e.message);
        if (String(e.message).includes("429")) {
          console.log(`  rate-limited, sleeping ${delay/1000}s`);
          await new Promise(r => setTimeout(r, delay));
          delay = Math.min(delay * 2, 90000);
        } else {
          await new Promise(r => setTimeout(r, 4000));
        }
      }
    }
  }
  console.log("\nDone.");
}

main().catch(e => { console.error(e); process.exit(1); });
