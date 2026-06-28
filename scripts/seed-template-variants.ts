// Seed 100% determinístico das variantes 2, 3 e 4 de cada nicho.
// NÃO usa Lovable AI Gateway. NÃO usa nenhuma IA de texto. Apenas:
//   1. Composição estática a partir de scripts/templates-variants-config.ts
//   2. Busca de imagens reais no Pexels (única dependência externa, já em uso)
//
// Idempotente: se a variante já existe e tem capa+capítulos, pula.
// Reutiliza imagens já enviadas ao bucket quando o caminho determinístico existe.
//
// Uso: bun run scripts/seed-template-variants.ts
// Requer: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PEXELS_API_KEY.

import { createClient } from "@supabase/supabase-js";
import { NICHES, type NicheVariant } from "./templates-variants-config";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE || !PEXELS_API_KEY) {
  console.error("Faltam SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ou PEXELS_API_KEY");
  process.exit(1);
}

// ---------- Composição estática ----------

const CHAPTER_ARCHETYPES = [
  {
    key: "fundamentos",
    title: "Fundamentos essenciais",
    pexelsHint: "foundation concept study",
  },
  {
    key: "diagnostico",
    title: "Diagnóstico e ponto de partida",
    pexelsHint: "planning notebook checklist",
  },
  {
    key: "plano",
    title: "Plano de ação prático",
    pexelsHint: "workspace strategy action",
  },
  {
    key: "erros",
    title: "Erros comuns e como evitá-los",
    pexelsHint: "warning learning process",
  },
  {
    key: "consolidacao",
    title: "Consolidação e resultados duradouros",
    pexelsHint: "achievement long term growth",
  },
] as const;

type ArchetypeKey = (typeof CHAPTER_ARCHETYPES)[number]["key"];

// Cada parágrafo ~80 palavras → 5 parágrafos ≈ 400 palavras por capítulo.
function paragraph(
  archetype: ArchetypeKey,
  paraIdx: number,
  niche: string,
  angle: string,
  tone: string,
): string {
  const blocks: Record<ArchetypeKey, string[]> = {
    fundamentos: [
      `Quando o assunto é ${niche}, todo plano consistente começa por compreender com clareza o que está em jogo em ${angle}. Não se trata de fórmulas mágicas, e sim de princípios estáveis que sustentam decisões inteligentes ao longo do tempo. Antes de adotar qualquer ferramenta nova, vale parar para mapear seus objetivos reais, o tempo disponível e a energia que você quer investir, evitando começar por modas passageiras que costumam render frustração mais rápido do que resultado.`,
      `Em um cenário marcado por excesso de informação, dominar os fundamentos é o que separa quem avança de quem fica preso a tentativas isoladas. ${angle.charAt(0).toUpperCase() + angle.slice(1)} possui pilares próprios que se repetem em praticamente todos os métodos sérios da área, ainda que sejam apresentados com nomes diferentes. Reconhecer esses pilares permite filtrar conteúdo, escolher referências confiáveis e construir uma base sobre a qual técnicas mais avançadas farão sentido em vez de apenas confundir.`,
      `O tom ${tone} adotado aqui não é apenas estilístico: ele reflete a forma como você deve se relacionar com o tema no dia a dia. Em ${niche}, a melhor estratégia raramente é a mais sofisticada, mas sim a que você consegue sustentar quando a empolgação inicial passa. Por isso, cada conceito apresentado vem acompanhado de exemplos concretos, situações reais e perguntas de autoavaliação, para que a leitura se transforme em ação observável em vez de teoria empilhada.`,
      `Outro ponto-chave é entender que ${angle} não acontece no vácuo. Sono, gestão de tempo, ambiente, círculo social e expectativas pessoais influenciam profundamente seus resultados, ainda que não pareçam, à primeira vista, ligados ao tema. Ao longo do livro, sempre que possível, esses contextos serão chamados de volta para mostrar como ajustes simples nesses fatores costumam destravar mais progresso do que qualquer técnica isolada — algo que iniciantes em ${niche} raramente percebem cedo o suficiente.`,
      `Encerre este capítulo com uma decisão simples: escolha um único conceito que tenha feito mais sentido até aqui e comprometa-se a observá-lo durante os próximos sete dias antes de seguir adiante. ${angle} ganha força quando deixa de ser uma ideia interessante e passa a ser uma referência diária para escolhas pequenas. É essa repetição consciente que vai preparar o terreno para os próximos capítulos, em que partiremos para diagnóstico, plano e correção de rota.`,
    ],
    diagnostico: [
      `Antes de adotar qualquer plano relacionado a ${angle}, é fundamental fazer um diagnóstico honesto de onde você está hoje em ${niche}. Sem esse retrato inicial, qualquer estratégia se transforma em palpite, e fica praticamente impossível medir progresso real. Reserve um momento sem pressa para responder, por escrito, a algumas perguntas-chave: o que você já tentou, o que funcionou parcialmente, o que claramente não serve para você e quais resultados específicos quer alcançar em um prazo realista.`,
      `Um bom diagnóstico envolve três camadas. A primeira é fatual: dados, números, hábitos atuais e rotinas que você consegue descrever sem julgamento. A segunda é interpretativa: o que esses fatos dizem sobre seu momento, recursos e limitações. A terceira é estratégica: a partir desse mapa, quais são as duas ou três alavancas mais promissoras dentro de ${angle}. Confundir essas camadas é um erro comum que faz pessoas tomarem decisões emocionais quando precisariam de método.`,
      `Em ${niche}, é tentador comparar-se com casos extremos da internet, mas raramente isso ajuda. Seu ponto de partida importa muito mais que o de qualquer outra pessoa, porque é dele que sairá o próximo passo. Use o tom ${tone} para conversar consigo mesmo: nem dura demais, nem complacente. O objetivo não é justificar onde você está, e sim entender com nitidez para então escolher para onde quer ir e, principalmente, por quê.`,
      `Construa indicadores simples para acompanhar evolução. Eles não precisam ser sofisticados: podem ser uma planilha de uma coluna, um caderno semanal ou uma nota no celular. O essencial é que sejam estáveis e que você revisite com frequência. Em ${angle}, indicadores claros evitam que você abandone um método que está funcionando só porque não notou o avanço, ou que insista por meses em algo claramente travado apenas por apego à decisão original.`,
      `Termine este capítulo com um diagnóstico em uma página: situação atual, principais obstáculos, dois objetivos concretos para os próximos 90 dias e uma métrica para cada objetivo. Esse documento será sua bússola ao percorrer os capítulos seguintes. Sempre que surgir dúvida sobre o que priorizar dentro de ${niche}, volte a essa página antes de procurar respostas externas — quase sempre a resposta já está nas escolhas que você mesmo declarou ao concluir o diagnóstico.`,
    ],
    plano: [
      `Com a base e o diagnóstico prontos, é hora de traduzir intenções em um plano executável focado em ${angle}. Um bom plano para ${niche} não tenta cobrir tudo de uma vez: ele isola dois ou três comportamentos centrais, define quando e como acontecerão e elimina deliberadamente atrito para que sejam realizados mesmo nos dias ruins. Quanto mais simples a estrutura, maior a probabilidade de você sustentá-la nas semanas em que motivação e disposição estiverem baixas.`,
      `Divida o plano em ciclos curtos, idealmente de duas a quatro semanas. Cada ciclo deve ter um foco principal e, no máximo, um foco secundário. Ao final, dedique 20 minutos para revisar o que funcionou, o que travou e o que ajustar. Essa cadência transforma ${angle} em um processo iterativo, em vez de uma promessa anual que se desfaz em fevereiro. Em ${niche}, ciclos curtos protegem contra perfeccionismo e contra a paralisia de tentar otimizar tudo.`,
      `Trabalhe com gatilhos ambientais. Onde você guarda os materiais, como organiza a agenda, quais aplicativos abre primeiro pela manhã: tudo isso influencia o quanto seu plano se executa quase sozinho. Em ${angle}, pequenas mudanças no ambiente costumam ter impacto maior do que aumento de força de vontade. Inspire-se no tom ${tone}: torne o caminho desejado o mais óbvio e fácil possível, e o caminho indesejado um pouco mais inconveniente do que ele é hoje.`,
      `Inclua, desde já, um "plano B" para dias imperfeitos. Defina uma versão mínima da rotina que você consegue cumprir mesmo cansado, viajando ou ocupado. Em ${niche}, é a continuidade dessa versão reduzida que evita a famosa quebra de sequência depois de uma semana atípica. Sem plano B, qualquer imprevisto vira pretexto para começar tudo de novo do zero, o que custa muito mais energia do que manter mesmo um esforço pequeno, porém constante, em ${angle}.`,
      `Feche o capítulo escrevendo seu plano em formato curto: foco do ciclo, três ações concretas, gatilhos ambientais, métrica de acompanhamento e versão mínima para dias difíceis. Compartilhe com alguém de confiança apenas se isso aumentar seu comprometimento; se não, mantenha privado. O importante é que esse plano esteja acessível e revisitado com frequência, transformando ${angle} em um conjunto de decisões antecipadas, em vez de uma série de escolhas tomadas no calor do momento.`,
    ],
    erros: [
      `Em ${niche}, os erros mais comuns não são técnicos: são de execução. Aplicado a ${angle}, isso significa que a maioria das pessoas conhece o que deveria fazer, mas tropeça em armadilhas de comportamento, expectativa e ritmo. Mapear essas armadilhas com antecedência é o que permite atravessá-las sem perder meses. Este capítulo reúne os deslizes mais frequentes observados em iniciantes e intermediários, com sinais práticos para você reconhecê-los rapidamente em si mesmo.`,
      `O primeiro grande erro é a expectativa equivocada de prazo. Pessoas costumam superestimar o que dá para fazer em quatro semanas e subestimar o que dá para construir em um ano. Em ${angle}, isso gera um padrão tóxico: começar com intensidade exagerada, frustrar-se com a falta de resultado imediato e abandonar antes que o método tivesse chance de mostrar valor. O tom ${tone} ajuda aqui: prazos realistas, métricas semanais e revisões mensais, sem dramas.`,
      `Outro erro recorrente é a troca constante de método. Cada nova promessa parece melhor que a anterior, e o plano original é abandonado antes de gerar dados. Em ${niche}, métodos diferentes podem funcionar para a mesma pessoa, mas raramente quando alternados a cada duas semanas. Defina um critério claro para mudar de abordagem — por exemplo, quatro ciclos sem evolução observável — e respeite-o. Disciplina aqui não é rigidez, é proteção contra o ruído permanente que cerca ${angle}.`,
      `Erros sociais também pesam. Comentários de pessoas próximas, comparações com colegas e conteúdo agressivo de redes sociais conseguem destruir, em minutos, semanas de progresso emocional. Em ${angle}, vale curar deliberadamente as fontes de informação que você consome, escolher pelo menos uma referência verdadeiramente alinhada ao seu momento e reduzir a exposição a perfis que geram comparação destrutiva. Pequenas mudanças nesse cardápio costumam liberar muito mais energia para focar em ${niche}.`,
      `Encerre o capítulo elaborando seu "kit antierros": três sinais de alerta pessoais, uma frase curta para se lembrar nos momentos difíceis e uma ação concreta a tomar quando perceber que está caindo em um padrão antigo. Esse kit funciona como um para-choque mental. Em ${angle}, errar é inevitável; o que diferencia quem chega lá é a velocidade com que reconhece o erro, ajusta a rota e volta ao plano sem transformar o tropeço em pretexto para abandonar tudo.`,
    ],
    consolidacao: [
      `Chegar até aqui já significa muito, mas o objetivo final não é apenas atingir um resultado em ${angle}: é torná-lo parte natural da sua rotina dentro de ${niche}. Consolidação é o estágio em que o esforço deixa de ser exceção e passa a ser default. Para isso, você precisa transformar decisões repetidas em hábitos, hábitos em identidade e identidade em ambiente — uma sequência que protege seu progresso contra fases de cansaço, mudanças de contexto e imprevistos da vida real.`,
      `Reavalie suas metas a cada trimestre. Em ${angle}, o que fazia sentido seis meses atrás pode estar ultrapassado pela sua nova realidade. Mantenha o que ainda serve, ajuste o que está obsoleto e adicione apenas o que realmente puxa você para frente. Use o tom ${tone} nesse momento: gentil com sua trajetória, exigente com o presente. Reavaliações honestas são o que impede que pessoas brilhantes em ${niche} fiquem presas em planos antigos que já não correspondem ao que querem hoje.`,
      `Construa redes de apoio compatíveis com a fase em que está. Comunidades, mentores, parceiros de prática e profissionais especializados aceleram aprendizado e diminuem a sensação de solidão. Em ${angle}, conviver com pessoas mais avançadas, mas acessíveis, é uma das alavancas mais subestimadas. Ao mesmo tempo, ofereça ajuda a quem está começando: ensinar consolida o que você aprendeu e gera um senso de propósito que dificilmente é alcançado quando o progresso fica restrito a métricas individuais.`,
      `Documente sua jornada. Um caderno, um arquivo digital ou um espaço privado em qualquer ferramenta servem. Registre tentativas, resultados, hipóteses, frustrações e pequenas vitórias. Esse acervo se torna um patrimônio prático em ${niche}: serve como referência quando você quiser repetir o que funcionou, como aviso para evitar repetir erros e como prova concreta de progresso nos momentos em que parecer, equivocadamente, que nada mudou. Em ${angle}, memória organizada é vantagem competitiva sustentável.`,
      `Por fim, defina sua próxima fronteira. Toda consolidação saudável aponta para um próximo ciclo, mais ambicioso e melhor calibrado pela experiência acumulada. Em ${angle}, isso pode significar aprofundar uma especialização, integrar o tema a outras áreas da sua vida ou ajudar formalmente outras pessoas em ${niche}. Independentemente do caminho, mantenha vivo o senso de progresso: ele é o combustível silencioso que faz com que tudo o que você construiu continue valendo a pena ano após ano.`,
    ],
  };
  return blocks[archetype][paraIdx];
}

function composeChapterContent(
  archetype: ArchetypeKey,
  niche: string,
  variant: NicheVariant,
): string {
  const paras: string[] = [];
  for (let i = 0; i < 5; i++) {
    paras.push(paragraph(archetype, i, niche, variant.angle, variant.toneHint));
  }
  return paras.join("\n\n");
}

function chapterTitleFor(variantIndex: number, archetypeTitle: string, angle: string): string {
  // Variar levemente o título por variante para reforçar unicidade.
  const prefixes: Record<number, string> = {
    2: "",
    3: "Aprofundando: ",
    4: "Reinventando: ",
  };
  const prefix = prefixes[variantIndex] ?? "";
  return `${prefix}${archetypeTitle} — ${capitalize(angle)}`;
}

function templateTitle(variantIndex: number, niche: string, angle: string): string {
  const titulo = capitalize(angle);
  const formats: Record<number, string> = {
    2: `Domine ${titulo}: guia prático de ${niche}`,
    3: `${titulo}: do zero ao avançado em ${niche}`,
    4: `Reinvente seu caminho em ${niche} com ${titulo}`,
  };
  return (formats[variantIndex] ?? `${niche}: ${titulo}`).slice(0, 110);
}

function templateSubtitle(variantIndex: number, niche: string, angle: string, tone: string): string {
  const formats: Record<number, string> = {
    2: `Um roteiro ${tone} para transformar ${angle} em resultados sustentáveis dentro de ${niche}.`,
    3: `Conceitos, plano e prática para evoluir em ${angle} sem atalhos arriscados em ${niche}.`,
    4: `Repense ${angle} com método, leveza e consistência para uma nova fase em ${niche}.`,
  };
  return (formats[variantIndex] ?? `Guia completo de ${angle} em ${niche}.`).slice(0, 180);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function coverPexelsQuery(variantIndex: number, niche: string, angle: string): string {
  // Pexels prefere queries em inglês curtas; aqui usamos termos visuais genéricos
  // derivados do índice e tema. Como angle/niche são em PT-BR, complementamos com
  // âncoras visuais em inglês para aumentar a qualidade do resultado.
  const anchors: Record<number, string> = {
    2: "professional modern lifestyle",
    3: "focused learning growth",
    4: "calm transformation journey",
  };
  return `${anchors[variantIndex] ?? "lifestyle"} ${slugWords(niche)}`.trim();
}

function chapterPexelsQuery(
  variantIndex: number,
  archetypeHint: string,
  niche: string,
): string {
  return `${archetypeHint} ${slugWords(niche)}`.trim();
}

function slugWords(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// ---------- Pexels + Storage ----------

async function fetchPexelsAndUpload(
  supabase: ReturnType<typeof createClient>,
  query: string,
  storagePath: string,
  orientation: "landscape" | "portrait",
): Promise<string | null> {
  // Reutiliza se já existe no bucket
  const folder = storagePath.split("/").slice(0, -1).join("/");
  const file = storagePath.split("/").pop()!;
  const { data: list } = await supabase.storage.from("ebook-images").list(folder, { search: file });
  if (list && list.some((f) => f.name === file)) {
    const { data: pub } = supabase.storage.from("ebook-images").getPublicUrl(storagePath);
    return pub.publicUrl;
  }

  const u = new URL("https://api.pexels.com/v1/search");
  u.searchParams.set("query", query);
  u.searchParams.set("per_page", "15");
  u.searchParams.set("orientation", orientation);
  u.searchParams.set("size", "large");
  u.searchParams.set("sort", "popular");
  const resp = await fetch(u.toString(), { headers: { Authorization: PEXELS_API_KEY } });
  if (!resp.ok) {
    console.warn(`Pexels failed (${query}): ${resp.status}`);
    return null;
  }
  const data = await resp.json();
  const photos: any[] = data.photos ?? [];
  if (!photos.length) {
    console.warn(`Pexels no photo for: ${query}`);
    return null;
  }
  const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 8))];
  const imgUrl: string = pick.src?.large2x || pick.src?.large || pick.src?.original;
  if (!imgUrl) return null;

  const imgResp = await fetch(imgUrl);
  if (!imgResp.ok) return null;
  const bytes = new Uint8Array(await imgResp.arrayBuffer());
  const contentType = imgResp.headers.get("content-type") || "image/jpeg";

  const { error: upErr } = await supabase.storage
    .from("ebook-images")
    .upload(storagePath, bytes, { contentType, upsert: true });
  if (upErr) {
    console.error("upload error:", upErr.message);
    return null;
  }
  const { data: pub } = supabase.storage.from("ebook-images").getPublicUrl(storagePath);
  return pub.publicUrl;
}

// ---------- Processamento por variante ----------

type AuditRow = {
  niche: string;
  variant: number;
  status: "created" | "updated" | "skipped-existing";
  title: string;
};

async function processVariant(
  supabase: ReturnType<typeof createClient>,
  niche: string,
  slug: string,
  variantIndex: number,
  variant: NicheVariant,
): Promise<AuditRow> {
  // Já existe completo?
  const { data: existing } = await supabase
    .from("ebook_templates")
    .select("id, cover_url, chapters")
    .eq("variant_index", variantIndex)
    .ilike("niche", niche)
    .maybeSingle();

  const title = templateTitle(variantIndex, niche, variant.angle);
  const subtitle = templateSubtitle(variantIndex, niche, variant.angle, variant.toneHint);

  if (
    existing?.id &&
    existing.cover_url &&
    Array.isArray(existing.chapters) &&
    existing.chapters.length === 5
  ) {
    console.log(`   ↩︎  ${niche} v${variantIndex} já completo — pulando`);
    return { niche, variant: variantIndex, status: "skipped-existing", title };
  }

  console.log(`\n→ ${niche} v${variantIndex} (${variant.angle})`);

  // Imagens (caminhos determinísticos → reuso automático)
  const coverQuery = coverPexelsQuery(variantIndex, niche, variant.angle);
  const coverPath = `templates/${slug}/v${variantIndex}/cover.jpg`;
  const coverUrl = await fetchPexelsAndUpload(supabase, coverQuery, coverPath, "portrait");

  const chaptersJson: any[] = [];
  for (let i = 0; i < CHAPTER_ARCHETYPES.length; i++) {
    const arc = CHAPTER_ARCHETYPES[i];
    const chQuery = chapterPexelsQuery(variantIndex, arc.pexelsHint, niche);
    const chPath = `templates/${slug}/v${variantIndex}/chapter-${i + 1}.jpg`;
    const imgUrl = await fetchPexelsAndUpload(supabase, chQuery, chPath, "landscape");
    chaptersJson.push({
      title: chapterTitleFor(variantIndex, arc.title, variant.angle),
      subtitle: "",
      content: composeChapterContent(arc.key, niche, variant),
      image_url: imgUrl,
    });
  }

  const payload = {
    niche,
    title,
    subtitle,
    cover_prompt: coverQuery,
    cover_url: coverUrl,
    chapters: chaptersJson,
    tags: [slug, "premium", `variant-${variantIndex}`],
    is_active: true,
    variant_index: variantIndex,
  };

  if (existing?.id) {
    const { error } = await supabase.from("ebook_templates").update(payload).eq("id", existing.id);
    if (error) throw error;
    console.log(`   ✓ UPDATED ${niche} v${variantIndex} — "${title}"`);
    return { niche, variant: variantIndex, status: "updated", title };
  }
  const { error } = await supabase.from("ebook_templates").insert(payload);
  if (error) throw error;
  console.log(`   ✓ INSERTED ${niche} v${variantIndex} — "${title}"`);
  return { niche, variant: variantIndex, status: "created", title };
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const audit: AuditRow[] = [];

  for (const cfg of NICHES) {
    for (let i = 0; i < cfg.variants.length; i++) {
      const variantIndex = i + 2; // 2, 3, 4
      try {
        const row = await processVariant(
          supabase,
          cfg.niche,
          cfg.slug,
          variantIndex,
          cfg.variants[i],
        );
        audit.push(row);
      } catch (e) {
        console.error(`FAILED ${cfg.niche} v${variantIndex}:`, e instanceof Error ? e.message : e);
      }
    }
  }

  // ---------- Auditoria final ----------
  const created = audit.filter((a) => a.status === "created").length;
  const updated = audit.filter((a) => a.status === "updated").length;
  const skipped = audit.filter((a) => a.status === "skipped-existing").length;

  const { count: total } = await supabase
    .from("ebook_templates")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  console.log("\n══════════════ AUDITORIA ══════════════");
  console.log(`Chamadas ao Lovable AI Gateway nesta execução: 0`);
  console.log(`Chamadas a qualquer IA de texto nesta execução: 0`);
  console.log(`Variantes criadas:    ${created}`);
  console.log(`Variantes atualizadas: ${updated}`);
  console.log(`Variantes já completas (puladas): ${skipped}`);
  console.log(`Total de templates ativos no banco: ${total}`);
  console.log("═══════════════════════════════════════");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
