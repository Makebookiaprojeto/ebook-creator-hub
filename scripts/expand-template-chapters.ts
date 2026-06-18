// Static deterministic expansion to 450+ words/chapter, using the
// chapter's title + niche as anchors, preserving the original short
// content as the opening hook. Keeps title/subtitle/image_url intact.
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

type Chapter = { title: string; subtitle?: string|null; content: string; image_url?: string|null; };
type Template = { id: string; niche: string; audience: string|null; title: string; subtitle: string|null; chapters: Chapter[]; };

function wc(s: string){ return s.trim().split(/\s+/).filter(Boolean).length; }

function expand(t: Template, ch: Chapter, idx: number): string {
  const niche = t.niche;
  const audience = (t.audience || "qualquer pessoa que esteja começando").toLowerCase();
  const subject = ch.title.trim();
  const opener = (ch.content || "").trim();

  // 5 reflective/practical paragraphs, niche-aware, 80-110 words each.
  const p1 = opener.length > 40 ? opener : `Quando o assunto é ${subject.toLowerCase()}, a maioria das pessoas começa pelo lugar errado: buscam atalhos antes de entender o terreno. Em ${niche.toLowerCase()}, esse é o erro que mais custa tempo. Este capítulo coloca o assunto na mesa de uma forma honesta, sem promessas mágicas, mostrando o que realmente importa quando você está dando os primeiros passos. A ideia aqui não é teorizar; é te dar um chão firme para pisar no que vem depois e te tirar do modo "tentativa e erro" que cansa e desmotiva.`;

  const p2 = `Por que isso importa? Porque, em ${niche.toLowerCase()}, resultado consistente vem de decisões pequenas, repetidas todos os dias, e não de uma virada espetacular. Quando você entende a lógica por trás de ${subject.toLowerCase()}, para de depender de motivação e passa a confiar em um sistema. Para ${audience}, isso muda o jogo: você gasta menos energia decidindo o que fazer e mais energia executando. O que parecia uma escolha difícil vira rotina. E rotina, no longo prazo, é o que separa quem desiste em três semanas de quem ainda está no caminho daqui a um ano.`;

  const p3 = `Na prática, aplicar ${subject.toLowerCase()} envolve quatro movimentos simples:

- Defina um objetivo concreto e mensurável para os próximos trinta dias. Vago não vira ação.
- Escolha uma única ação âncora que você consegue cumprir mesmo em dias ruins. Pequena, ridícula, mas inegociável.
- Crie um gatilho de ambiente: deixe pronto, à vista, ou agendado. Quanto menos atrito, maior a adesão.
- Reveja semanalmente o que funcionou e o que não funcionou. Não é cobrança, é calibragem.

Esses quatro passos parecem básicos, mas é justamente neles que está a diferença entre quem fala sobre ${niche.toLowerCase()} e quem realmente colhe resultado.`;

  const p4 = `Existem três armadilhas que aparecem sempre que alguém começa com ${subject.toLowerCase()}, e vale conhecê-las de antemão. A primeira é o perfeccionismo: esperar o momento ideal, a ferramenta ideal, o método ideal — e nunca começar. A segunda é a comparação: olhar para quem está há cinco anos no caminho e se sentir atrasado, quando o que importa é o seu marco zero. A terceira é a sobrecarga: tentar mudar tudo de uma vez, queimar todas as cartas em uma semana e travar na seguinte. Reconhecer essas três armadilhas já reduz pela metade a chance de você sair do trilho nas primeiras semanas.`;

  const p5 = `O próximo passo é prático. Antes de virar a página, pegue cinco minutos e escreva, em uma frase só, o que você vai fazer diferente nos próximos sete dias depois de ler este capítulo sobre ${subject.toLowerCase()}. Não precisa ser bonito, não precisa ser ambicioso — precisa ser claro o suficiente para você cumprir mesmo em um dia cheio. Anote, cole na geladeira, deixe como lembrete no celular. O capítulo seguinte só faz sentido se este aqui sair do papel e virar movimento na sua semana.`;

  return [p1, p2, p3, p4, p5].join("\n\n");
}

async function main(){
  const { data, error } = await supabase
    .from("ebook_templates")
    .select("id, niche, audience, title, subtitle, chapters")
    .order("niche");
  if (error) throw error;
  const templates = data as Template[];
  for (const t of templates){
    const newChapters = t.chapters.map((c, i) => ({
      title: c.title,
      subtitle: c.subtitle || "",
      image_url: c.image_url || null,
      content: expand(t, c, i),
    }));
    const counts = newChapters.map(c => wc(c.content));
    const { error: e } = await supabase.from("ebook_templates").update({ chapters: newChapters }).eq("id", t.id);
    if (e) { console.error(t.niche, e.message); continue; }
    console.log(`✓ ${t.niche} — words: ${counts.join(", ")}`);
  }
  console.log("done");
}
main().catch(e => { console.error(e); process.exit(1); });
