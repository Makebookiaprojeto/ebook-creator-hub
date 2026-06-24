// Deterministic visual upgrade for the 20 ebook templates.
// No AI, no credits. Builds a rich structured chapter body using
// markdown headings ("## ") and bullet lists ("- ") that both
// EbookPreviewCarousel and EbookPreview already render.
//
// Structure per chapter:
//   - Intro paragraph
//   - ## Bloco principal  + 2 paragraphs
//   - ## Principais pontos + bullet list
//   - ## Dicas práticas    + bullet list (✓)
//   - ## Resumo do capítulo + closing paragraph
//
// Preserves: title, subtitle, image_url, niche, audience, cover, etc.
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

const wc = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

function buildSubtitle(existing: string | null | undefined, subject: string, niche: string) {
  if (existing && existing.trim().length > 0) return existing.trim();
  return `Um guia prático sobre ${subject.toLowerCase()} aplicado a ${niche.toLowerCase()}.`;
}

function buildContent(t: Template, ch: Chapter, idx: number): string {
  const niche = t.niche;
  const audience = (t.audience || "qualquer pessoa que esteja começando").toLowerCase();
  const subject = ch.title.trim();
  const subjectLow = subject.toLowerCase();
  const original = (ch.content || "").trim();

  const intro =
    original.length > 60
      ? original
      : `Neste capítulo vamos olhar de frente para ${subjectLow} dentro do universo de ${niche.toLowerCase()}. A proposta não é cobrir tudo o que existe sobre o tema, mas dar a você uma visão clara, prática e aplicável, voltada especialmente para ${audience}. Ao final, você terá um modelo simples de pensar e agir, mesmo que esteja começando hoje.`;

  const mainP1 = `Quando falamos de ${subjectLow}, é fácil cair na armadilha de buscar fórmulas mágicas. A realidade é mais sóbria: o que funciona em ${niche.toLowerCase()} são decisões pequenas, consistentes e bem calibradas. O segredo está em entender o "porquê" antes do "como", para que cada ação faça sentido dentro de um plano maior. Esse é o tipo de base que separa quem fica no improviso de quem constrói resultados ao longo do tempo.`;

  const mainP2 = `Na prática, isso significa transformar ${subjectLow} em uma rotina executável. Em vez de tentar mudar tudo de uma só vez, você define um objetivo concreto, escolhe uma ação âncora que cabe na sua semana e mede o resultado de forma honesta. Para ${audience}, essa abordagem reduz a ansiedade, diminui o desperdício de tempo e cria um ciclo de melhoria contínua, que é exatamente o que sustenta qualquer projeto sério em ${niche.toLowerCase()}.`;

  const keyPoints = [
    `${subject} faz mais diferença pelo que você repete do que pelo que você tenta uma vez só.`,
    `Em ${niche.toLowerCase()}, clareza vale mais do que velocidade — saber para onde está indo evita refação.`,
    `Resultado bom é resultado mensurável: defina antes como vai saber se funcionou.`,
    `Constância importa mais que perfeição: prefira uma ação simples feita toda semana a um plano ambicioso esquecido no segundo dia.`,
  ];

  const tips = [
    `Reserve 20 minutos para escrever, com suas palavras, o que você entendeu sobre ${subjectLow}.`,
    `Escolha uma única ação relacionada a ${subjectLow} para aplicar nos próximos 7 dias.`,
    `Marque na agenda um momento fixo na semana para revisar o que funcionou e o que precisa ajustar.`,
  ];

  const summary = `Em resumo, ${subjectLow} dentro de ${niche.toLowerCase()} não é sobre saber tudo, é sobre aplicar bem o que importa. Você viu aqui o porquê, o como e os principais pontos de atenção. O próximo passo é simples: pegue uma ideia deste capítulo e leve para a prática ainda esta semana — é dessa repetição que nasce o resultado real.`;

  return [
    intro,
    `## Bloco principal`,
    mainP1,
    mainP2,
    `## Principais pontos`,
    keyPoints.map((p) => `- ${p}`).join("\n"),
    `## Dicas práticas`,
    tips.map((p) => `- ✓ ${p}`).join("\n"),
    `## Resumo do capítulo`,
    summary,
  ].join("\n\n");
}

async function main() {
  const { data, error } = await supabase
    .from("ebook_templates")
    .select("id, niche, audience, title, subtitle, chapters")
    .order("niche");
  if (error) throw error;
  const templates = data as Template[];

  let totalChapters = 0;
  let totalWords = 0;

  for (const t of templates) {
    const newChapters = t.chapters.map((c, i) => {
      const content = buildContent(t, c, i);
      totalChapters += 1;
      totalWords += wc(content);
      return {
        title: c.title,
        subtitle: buildSubtitle(c.subtitle, c.title, t.niche),
        image_url: c.image_url || null,
        content,
      };
    });
    const { error: e } = await supabase
      .from("ebook_templates")
      .update({ chapters: newChapters })
      .eq("id", t.id);
    if (e) {
      console.error("FAIL", t.niche, e.message);
      continue;
    }
    console.log(`✓ ${t.niche} — ${newChapters.length} capítulos`);
  }

  console.log("---");
  console.log(`Templates: ${templates.length}`);
  console.log(`Capítulos: ${totalChapters}`);
  console.log(`Média de palavras/capítulo: ${Math.round(totalWords / totalChapters)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
