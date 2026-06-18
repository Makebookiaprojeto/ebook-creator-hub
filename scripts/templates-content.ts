// Conteúdo curado dos 20 novos templates premium de ebooks.
// Cada nicho: 1 capa + 5 capítulos. Textos curtos (80-120 palavras),
// sem sumário/intro/conclusão. Paleta visual: fundo branco, detalhe turquesa #00CED1.

export type ChapterSeed = {
  title: string;
  content: string; // 80-120 palavras, parágrafo único
  imagePrompt: string;
};

export type TemplateSeed = {
  niche: string;
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  coverPrompt: string;
  chapters: ChapterSeed[];
};

const baseStyle =
  "ultra premium editorial photography, pure white seamless background, soft natural diffused lighting, minimalist composition, fine detail, crisp focus, magazine-grade, subtle dark turquoise (#00CED1) accent element, no text, no watermark, photorealistic, 4k";

const coverStyle =
  "premium minimalist book cover photography, pure white background, large central subject, refined composition, soft directional light, single dark turquoise (#00CED1) accent, no text, no typography, photorealistic, editorial, 4k";

export const TEMPLATES: TemplateSeed[] = [
  {
    niche: "Emagrecimento",
    id: "8562c1c2-6259-4321-988f-157c992a1db0",
    slug: "emagrecimento",
    title: "Corpo Leve",
    subtitle: "Cinco passos visuais para emagrecer com consistência",
    coverPrompt: `${coverStyle}, fresh green apple with measuring tape lightly wrapped around it, clean shadow`,
    chapters: [
      {
        title: "Alimentação Consciente",
        content:
          "Emagrecer começa antes do prato. Significa observar a fome real, mastigar com calma e escolher comida que sustenta sem pesar. Reduza ultraprocessados, priorize cores vivas no prato e beba água ao longo do dia. Não existe alimento mágico: existe constância. Quando você come com atenção, o cérebro recebe o sinal de saciedade no tempo certo e a fome emocional perde força. Comece simples — substitua um item por dia e mantenha por uma semana.",
        imagePrompt: `${baseStyle}, overhead flat lay of fresh colorful vegetables, avocado, salmon fillet, lemon, on white marble`,
      },
      {
        title: "Movimento Diário",
        content:
          "Você não precisa de academia para começar. Precisa se mover. Trinta minutos diários de caminhada acelerada já mudam metabolismo, humor e qualidade do sono. Some duas sessões semanais de força e o corpo passa a queimar mais mesmo em repouso. O segredo está na repetição: marque o horário, vista a roupa, saia. Em quatro semanas o hábito se instala. Em doze, o resultado aparece no espelho.",
        imagePrompt: `${baseStyle}, premium running shoes and folded white towel on light wooden floor, soft morning light`,
      },
      {
        title: "Sono e Hormônios",
        content:
          "Dormir mal sabota qualquer dieta. Menos de seis horas elevam cortisol, aumentam fome de carboidrato e travam a perda de gordura. Crie um ritual: tela desligada uma hora antes, quarto escuro, temperatura fresca. Sete a oito horas por noite são inegociáveis. O corpo se regenera, o apetite se equilibra e a disposição para treinar aparece naturalmente no dia seguinte.",
        imagePrompt: `${baseStyle}, neatly made white linen bed with single soft pillow, minimalist bedroom corner, morning light`,
      },
      {
        title: "Hidratação Real",
        content:
          "A maior parte da sensação de fome ao longo do dia é, na verdade, sede. Comece o dia com dois copos de água em jejum e mantenha uma garrafa visível na mesa. A meta simples: trinta e cinco mililitros por quilo de peso. Hidratado, o corpo digere melhor, a pele responde e o cérebro pensa mais claro. Água é a intervenção mais barata e mais subestimada de qualquer plano de emagrecimento.",
        imagePrompt: `${baseStyle}, tall clear glass of water with single ice cube and cucumber slice, white background, water droplets`,
      },
      {
        title: "Constância Acima de Tudo",
        content:
          "Resultado vem de pequenas decisões repetidas centenas de vezes. Não busque perfeição: busque presença. Em vez de planos extremos que duram dez dias, monte uma rotina simples que dure dez meses. Pese-se uma vez por semana, registre como se sente, ajuste sem culpa. O corpo magro é consequência de um estilo de vida — e estilo de vida se constrói devagar, com paciência e respeito pelo próprio ritmo.",
        imagePrompt: `${baseStyle}, minimalist white calendar page with single turquoise check mark, clean desk, soft shadow`,
      },
    ],
  },
  {
    niche: "Fitness e musculação",
    id: "c343dfaa-2862-4798-af99-af2bdcd2bfbe",
    slug: "fitness",
    title: "Hipertrofia Real",
    subtitle: "Cinco pilares para construir músculo de verdade",
    coverPrompt: `${coverStyle}, single chrome dumbbell standing vertically, dramatic side light, polished surface`,
    chapters: [
      {
        title: "Sobrecarga Progressiva",
        content:
          "Músculo cresce quando é desafiado além do que já aguenta. Isso significa adicionar carga, repetição ou volume a cada ciclo. Anote cada treino: o que não é medido não evolui. Comece com uma base sólida de doze semanas focando técnica e amplitude. Depois aumente cinco por cento de carga a cada duas semanas nos exercícios principais. Sem progressão não há hipertrofia, apenas manutenção.",
        imagePrompt: `${baseStyle}, stack of black weight plates neatly arranged, polished barbell, white floor`,
      },
      {
        title: "Proteína Suficiente",
        content:
          "Sem proteína o treino não vira músculo. A meta funcional é entre 1,6 e 2,2 gramas por quilo de peso, distribuídos em quatro refeições. Priorize fontes completas: ovos, frango, peixe, carne magra, whey. Combine com carboidrato no pós-treino para acelerar a recuperação. Comer bem é metade do resultado — talvez mais.",
        imagePrompt: `${baseStyle}, grilled chicken breast and boiled eggs on white plate, fresh herbs, overhead`,
      },
      {
        title: "Descanso Estratégico",
        content:
          "Músculo cresce fora da academia, durante o sono e nos dias de pausa. Treinar o mesmo grupo todos os dias não acelera nada: trava. Trabalhe cada grupo duas vezes por semana com 48 horas de intervalo. Durma oito horas. Tire um dia completo de descanso ativo semanal. O corpo agradece e a próxima sessão rende mais.",
        imagePrompt: `${baseStyle}, person stretching calf muscle on white yoga mat, athletic legs, minimalist studio`,
      },
      {
        title: "Técnica Antes de Carga",
        content:
          "Levantar pesado com forma ruim é o caminho mais curto para lesão e estagnação. Filme seus exercícios principais uma vez por mês. Foque em amplitude completa, controle excêntrico e respiração estável. Carga pesada com técnica limpa recruta mais fibras do que carga absurda com balanço. Construa a execução perfeita primeiro; a força vem em seguida.",
        imagePrompt: `${baseStyle}, close-up of strong hands gripping a chalked barbell, white background, dramatic light`,
      },
      {
        title: "Mentalidade de Longo Prazo",
        content:
          "Físico construído em meses se perde em semanas. Físico construído em anos vira identidade. Não meça resultado por semana: meça por trimestre. Tire fotos a cada doze semanas, ajuste o plano, celebre marcos. Pare de pular de programa em programa: escolha um, execute por noventa dias, avalie. A constância vence a intensidade isolada todas as vezes.",
        imagePrompt: `${baseStyle}, mens silhouette muscular back, athletic build, side light, clean studio backdrop`,
      },
    ],
  },
  {
    niche: "Finanças",
    id: "f921abf0-8d2c-4d1e-bda1-6c3bad6b78da",
    slug: "financas",
    title: "Dinheiro no Controle",
    subtitle: "Cinco passos para sair do vermelho e começar a investir",
    coverPrompt: `${coverStyle}, single glass jar with neatly stacked coins inside, soft side light, clean shadow`,
    chapters: [
      {
        title: "Diagnóstico Honesto",
        content:
          "Você não conserta o que não enxerga. Pegue os últimos três extratos e classifique cada gasto em essencial, conforto e supérfluo. A maioria descobre que vinte por cento da renda some em assinaturas esquecidas e delivery. O simples ato de listar muda comportamento. Faça uma vez por mês, sem julgamento, com curiosidade. Esse é o ponto zero de qualquer plano financeiro sério.",
        imagePrompt: `${baseStyle}, minimalist desk with open notebook, pen, calculator, single coffee cup, top down`,
      },
      {
        title: "Orçamento Simples",
        content:
          "Esqueça planilhas com vinte abas. Funciona melhor a regra cinquenta–trinta–vinte: metade da renda para essenciais, trinta por cento para qualidade de vida, vinte por cento para futuro. Automatize a transferência da reserva no dia seguinte ao salário cair. O que sobra na conta corrente é o que você pode gastar livremente. Decisão tomada uma vez, dinheiro organizado o mês inteiro.",
        imagePrompt: `${baseStyle}, three small white envelopes side by side on white desk, minimalist arrangement`,
      },
      {
        title: "Quitar Dívidas",
        content:
          "Dívida com juros altos é incêndio: nenhum investimento bate. Liste todas, do maior para o menor juros. Negocie tudo que puder, mesmo que pareça desconfortável. Direcione os vinte por cento de poupança para quitar a mais cara primeiro, mantendo o mínimo nas outras. Quando ela morre, jogue o mesmo valor na próxima. Em doze a vinte e quatro meses, o quadro muda completamente.",
        imagePrompt: `${baseStyle}, pair of scissors cutting a credit card in half, white background, sharp focus`,
      },
      {
        title: "Reserva de Emergência",
        content:
          "Antes de investir em qualquer outra coisa, monte uma reserva equivalente a seis meses do seu custo essencial mensal. Guarde em renda fixa pós-fixada com liquidez diária. Esse colchão tira o pânico das decisões e impede que você volte a se endividar quando a vida fizer uma curva inesperada. Liberdade financeira começa quando uma emergência deixa de ser uma catástrofe.",
        imagePrompt: `${baseStyle}, neatly folded stack of cash bills on white surface, soft shadow, clean composition`,
      },
      {
        title: "Investir Aos Poucos",
        content:
          "Você não precisa entender derivativos para investir bem. Tesouro Direto, fundos indexados e ETFs cobrem noventa por cento das necessidades de um investidor iniciante. O segredo é começar agora, com pouco, todo mês. Cem reais aportados religiosamente vencem mil reais aportados uma vez ao ano. Juros compostos premiam tempo, não talento. Comece este mês, não o próximo.",
        imagePrompt: `${baseStyle}, single small green plant sprouting from white ceramic pot full of coins, soft light`,
      },
    ],
  },
  {
    niche: "Beleza e autocuidado",
    id: "f2117b13-9531-42ca-85e4-e695c13e4add",
    slug: "beleza",
    title: "Pele Real",
    subtitle: "Cinco passos para uma rotina de beleza que funciona",
    coverPrompt: `${coverStyle}, single elegant glass skincare bottle with dropper, soft pastel highlight, fresh petals`,
    chapters: [
      {
        title: "Limpeza Sem Excesso",
        content:
          "Pele bonita começa em pele limpa, mas limpa demais machuca. Lave o rosto duas vezes ao dia com um sabonete suave compatível com o seu tipo de pele. Água morna, nunca quente. Esfoliação no máximo duas vezes por semana. Excesso de produto rompe a barreira natural e gera vermelhidão. Menos é mais — e essa é uma regra que vale para o resto da rotina.",
        imagePrompt: `${baseStyle}, hands cupping water close to face, soft natural light, fresh skin, minimalist`,
      },
      {
        title: "Hidratação Verdadeira",
        content:
          "Hidratação não vem só do creme: vem da água que você bebe e do sono que você dorme. Some um hidratante leve pela manhã e um mais denso à noite. Procure ingredientes simples como ácido hialurônico, ceramidas e niacinamida. Aplique com a pele ainda úmida para selar a água. Em duas semanas a textura muda visivelmente.",
        imagePrompt: `${baseStyle}, single luxurious face cream jar open with cream texture visible, soft shadow`,
      },
      {
        title: "Proteção Solar Sempre",
        content:
          "Se você fizer uma única coisa por sua pele pelo resto da vida, que seja protetor solar diário. Sol é o maior fator de envelhecimento, manchas e flacidez. Escolha FPS 30 ou maior, reaplique a cada três horas em exposição direta. Use mesmo em dia nublado, mesmo dentro de casa perto de janelas. O resultado de uma década de proteção é impressionante.",
        imagePrompt: `${baseStyle}, sunscreen tube with cream dollop on white background, soft sunlight reflection`,
      },
      {
        title: "Sono e Alimentação",
        content:
          "Nenhum cosmético substitui sete horas de sono e uma dieta com vegetais coloridos. Pele bonita é reflexo de corpo bem cuidado por dentro. Reduza ultraprocessado, açúcar refinado e álcool. Aumente água, fibras e gorduras boas como azeite, abacate e castanhas. Em trinta dias o brilho natural volta sozinho, sem precisar de uma única loção nova.",
        imagePrompt: `${baseStyle}, sliced avocado, walnuts and olive oil bottle on white marble, overhead`,
      },
      {
        title: "Constância Suave",
        content:
          "Rotina de beleza não é um sprint de produtos novos a cada semana. É uma rotina simples mantida por meses. Escolha quatro a cinco produtos certos, aplique todos os dias, deixe seu rosto se acostumar. Mudanças visíveis levam quatro semanas para começar e três meses para estabilizar. Confie no processo e na consistência — é assim que a pele responde de verdade.",
        imagePrompt: `${baseStyle}, neatly arranged skincare bottles in a row on white shelf, minimalist composition`,
      },
    ],
  },
  {
    niche: "Desenvolvimento pessoal",
    id: "5da42a5e-85c5-403b-bf5a-6f5aae7b6739",
    slug: "desenvolvimento-pessoal",
    title: "Versão Maior",
    subtitle: "Cinco passos para destravar seu potencial",
    coverPrompt: `${coverStyle}, single open hardcover book with delicate plant emerging from pages, soft light`,
    chapters: [
      {
        title: "Clareza de Identidade",
        content:
          "Crescer começa por saber quem você é hoje, sem máscaras. Escreva três páginas a mão respondendo: o que valorizo, o que evito, o que invejo nos outros. Inveja revela desejo escondido. Valores revelam direção. Esse exercício leva uma hora e muda mais a vida do que dez livros de motivação. Volte a ele a cada seis meses para recalibrar.",
        imagePrompt: `${baseStyle}, single mirror reflecting morning light on minimalist white wall, soft shadow`,
      },
      {
        title: "Metas Concretas",
        content:
          "Sonho sem prazo é desejo. Sonho com prazo é meta. Pegue uma área da vida — saúde, carreira, relacionamento — e defina o que será verdade em noventa dias. Quebre em três marcos mensais e em ações semanais. Revise toda sexta-feira. O cérebro humano persegue alvos visíveis; alvo abstrato gera ansiedade, não progresso.",
        imagePrompt: `${baseStyle}, single dart hitting bullseye on white target, sharp focus, clean shadow`,
      },
      {
        title: "Hábitos Pequenos",
        content:
          "Você não é o que pensa: você é o que faz todos os dias. Hábitos minúsculos repetidos vencem grandes resoluções. Cinco minutos de leitura, dez de caminhada, três respirações antes de cada reunião. Comece tão pequeno que pareça ridículo não fazer. A continuidade constrói identidade muito mais do que a intensidade pontual.",
        imagePrompt: `${baseStyle}, small dominoes lined up on white surface, first one falling, soft shadow`,
      },
      {
        title: "Ambiente Importa",
        content:
          "Vontade é finita; ambiente é permanente. Se quiser ler mais, deixe o livro na mesa de cabeceira. Se quiser comer melhor, esvazie a despensa do que sabota. Se quiser focar, tire notificação do celular. Seu ambiente decide noventa por cento das suas escolhas — mesmo quando você acha que está decidindo conscientemente. Engenharia de ambiente é poder.",
        imagePrompt: `${baseStyle}, clean minimalist desk with single notebook, plant, soft natural light`,
      },
      {
        title: "Reflexão Semanal",
        content:
          "Cresce quem se observa. Toda semana reserve trinta minutos para revisar: o que funcionou, o que não, o que vou mudar. Não precisa diário, não precisa elaborado. Precisa ser consistente. Quem repete os mesmos erros é quem nunca olha para trás. Olhar para trás com calma é o que permite avançar com direção.",
        imagePrompt: `${baseStyle}, single cup of tea on minimalist white desk with open notebook, morning light`,
      },
    ],
  },
  {
    niche: "Espiritualidade",
    id: "15c7d7aa-946a-4a4d-b27b-19e4b380c8ea",
    slug: "espiritualidade",
    title: "Presença",
    subtitle: "Cinco passos para uma vida espiritual mais profunda",
    coverPrompt: `${coverStyle}, single lit white candle with rising smoke, soft side light, serene composition`,
    chapters: [
      {
        title: "Silêncio Diário",
        content:
          "Espiritualidade não exige doutrina; exige espaço. Reserve dez minutos por dia para silêncio absoluto. Sem celular, sem música, sem agenda. Apenas sentar e respirar. Esse vazio inicial parece desconfortável e depois vira refúgio. É no silêncio que a intuição volta a falar mais alto que o ruído do mundo.",
        imagePrompt: `${baseStyle}, single zen stone balanced on white surface with soft shadow, minimalist composition`,
      },
      {
        title: "Gratidão Real",
        content:
          "Gratidão muda o cérebro mais que qualquer técnica de positividade. Anote três coisas específicas pelas quais é grato a cada noite. Não vale repetir genericamente. Quanto mais detalhado, mais profundo. Em trinta dias o olhar para a própria vida muda. Em noventa, o entorno parece outro. A realidade não mudou: a percepção sim.",
        imagePrompt: `${baseStyle}, open notebook with handwritten page, single white flower on top, soft light`,
      },
      {
        title: "Conexão com a Natureza",
        content:
          "Pés descalços na grama, vento no rosto, sol da manhã. Vinte minutos por dia ao ar livre reduzem ansiedade mais que qualquer aplicativo de meditação. A natureza não tenta resolver seus problemas: ela apenas existe — e essa presença simples ensina mais sobre quietude do que mil livros de filosofia.",
        imagePrompt: `${baseStyle}, single green leaf on white background with morning dew drop, sharp focus`,
      },
      {
        title: "Práticas Simples",
        content:
          "Você não precisa de retiro caro nem mestre famoso. Precisa de prática diária acessível: meditação guiada de cinco minutos, leitura sagrada que faça sentido para você, oração no seu idioma. O caminho espiritual mais poderoso é o mais consistente, não o mais elaborado. Repetição cria profundidade onde novidade cria distração.",
        imagePrompt: `${baseStyle}, single mala beads coiled on white linen, soft natural light, peaceful mood`,
      },
      {
        title: "Serviço aos Outros",
        content:
          "Toda tradição espiritual madura aponta para o mesmo lugar: servir. Doar tempo, escutar com presença, ajudar sem esperar retorno. Isso conecta mais com o sagrado do que qualquer técnica individual. A espiritualidade que termina em si mesma é narcisismo disfarçado; a que termina no outro é transformação real.",
        imagePrompt: `${baseStyle}, two hands gently holding a small white flower, soft light, intimate composition`,
      },
    ],
  },
  {
    niche: "Maternidade",
    id: "56724db2-515c-4fc3-aceb-2974c0d02faf",
    slug: "maternidade",
    title: "Primeiros Meses",
    subtitle: "Cinco passos essenciais para mães de primeira viagem",
    coverPrompt: `${coverStyle}, soft folded white baby blanket with single tiny knitted shoe on top, gentle light`,
    chapters: [
      {
        title: "Sono Possível",
        content:
          "Bebê não dorme a noite toda nos primeiros meses e isso é fisiológico. Esqueça expectativas e crie pequenos rituais: banho morno, luz baixa, voz calma. Aceite ajuda quando oferecerem. Durma quando o bebê dorme, mesmo de tarde. Privação de sono crônica afeta humor e amamentação. Cuidar de você é cuidar do bebê — não é egoísmo, é estratégia.",
        imagePrompt: `${baseStyle}, peaceful newborn baby sleeping in white cotton blanket, soft natural light, close-up`,
      },
      {
        title: "Amamentação Sem Culpa",
        content:
          "A amamentação é natural mas não é automática. Doi, dá dúvida, frustra. Procure uma consultora de amamentação nos primeiros dias se necessário. Posicionamento certo evita rachaduras. Se não der certo por algum motivo, fórmula alimenta bem. Bebê feliz precisa de mãe inteira, não de mãe culpada. O importante é o vínculo, não o método exato.",
        imagePrompt: `${baseStyle}, mother gently cradling baby in soft white wrap, intimate moment, soft light`,
      },
      {
        title: "Rede de Apoio",
        content:
          "Maternidade não foi feita para ser vivida sozinha. Convide quem ama para visitar com tarefa: lavar louça, segurar bebê enquanto você banha, trazer comida pronta. Recusar ajuda por orgulho cobra caro na saúde mental. Aceitar é sabedoria, não fraqueza. A vila inteira ajuda a criar uma criança, mesmo na cidade moderna.",
        imagePrompt: `${baseStyle}, small bouquet of fresh white daisies in glass vase on white windowsill, soft light`,
      },
      {
        title: "Mãe Também é Pessoa",
        content:
          "Você continua sendo você depois do parto. Quinze minutos sozinha no banho, um café morno até o fim, uma chamada com uma amiga — esses pedaços de identidade preservam sua sanidade. Pedir colo no parceiro, chorar quando precisar e procurar ajuda profissional ao primeiro sinal de tristeza prolongada não é fraqueza. É autocuidado essencial.",
        imagePrompt: `${baseStyle}, single ceramic coffee cup steaming on white table, calm morning atmosphere`,
      },
      {
        title: "Vínculo Acima de Tudo",
        content:
          "Esqueça gurus que dizem o jeito certo. Bebê aprende quem é amado pela repetição: colo, voz, olhar, leite, sorriso. Esses gestos pequenos constroem segurança emocional para a vida inteira. Não existe mãe perfeita: existe mãe presente. Estar inteira no momento, mesmo cansada, é o presente mais profundo que você pode oferecer.",
        imagePrompt: `${baseStyle}, tiny baby hand gently holding adult finger, soft white blanket background, intimate`,
      },
    ],
  },
  {
    niche: "Marketing digital",
    id: "1c43ccca-0a23-4888-b6be-184d759c2e74",
    slug: "marketing-digital",
    title: "Primeira Venda Online",
    subtitle: "Cinco passos para começar do zero na internet",
    coverPrompt: `${coverStyle}, modern smartphone on white surface with single shopping bag icon glowing turquoise, soft light`,
    chapters: [
      {
        title: "Escolha o Nicho Certo",
        content:
          "Vender para todo mundo é vender para ninguém. Escolha um nicho específico onde você tenha conhecimento ou interesse real. Cruze três critérios: o que você gosta, o que sabe e o que tem demanda. Esse triângulo decide tudo o que vem depois — produto, copy, anúncio, posicionamento. Quanto mais nichado, mais fácil ser visto.",
        imagePrompt: `${baseStyle}, magnifying glass focusing on small target circle on white paper, soft shadow`,
      },
      {
        title: "Construa Audiência",
        content:
          "Antes de vender, conquiste atenção. Escolha uma única rede social e publique conteúdo útil três vezes por semana durante noventa dias. Não venda nada nesse período. Apenas ensine, mostre bastidor, conte história. Em três meses você terá os primeiros mil seguidores realmente interessados — e mil seguidores certos valem mais que cem mil curiosos.",
        imagePrompt: `${baseStyle}, smartphone displaying minimalist social feed icon, white background, clean composition`,
      },
      {
        title: "Oferta Irresistível",
        content:
          "Produto bom não basta: oferta clara vende. Estruture com três elementos: dor que resolve, transformação que entrega, garantia que reduz medo. Um título direto, três bullets, depoimento real e um botão de ação claro. Página enrolada espanta cliente; página limpa converte. Teste duas versões e siga com a que vende mais.",
        imagePrompt: `${baseStyle}, single neatly wrapped white gift box with turquoise ribbon, soft light, clean shadow`,
      },
      {
        title: "Tráfego Pago Inteligente",
        content:
          "Anúncio é acelerador, não milagre. Comece com vinte reais por dia em uma única campanha, segmentada com precisão. Mensure custo por clique, custo por venda e ROI. Escale só o que dá lucro. A maioria queima orçamento por não medir. Quem mede, escala. Quem escala, lucra. Métrica não mente — sentimento mente.",
        imagePrompt: `${baseStyle}, simple white line chart pointing upward on clean white background, single turquoise line`,
      },
      {
        title: "Atendimento Vence",
        content:
          "Marca não se constrói no anúncio: se constrói no pós-venda. Responda rápido, resolva problema sem burocracia, surpreenda com um detalhe. Clientes encantados voltam e recomendam. Cada cliente bem atendido vale mais que três campanhas. Recorrência e indicação são os pilares de qualquer negócio sustentável online.",
        imagePrompt: `${baseStyle}, single elegant handwritten thank you note on white envelope, soft light`,
      },
    ],
  },
  {
    niche: "Relacionamentos",
    id: "5e95f8a4-ceab-450b-ae00-55da6147d17d",
    slug: "relacionamentos",
    title: "Amor que Dura",
    subtitle: "Cinco passos para relacionamentos saudáveis",
    coverPrompt: `${coverStyle}, two simple silver wedding rings interlocked on white surface, soft light`,
    chapters: [
      {
        title: "Comunicação Clara",
        content:
          "A maior parte das brigas não é sobre o tema da briga: é sobre não se sentir ouvido. Antes de responder, repita o que entendeu com suas palavras. Pergunte se é isso mesmo. Esse simples gesto desarma noventa por cento dos conflitos antes que escalem. Falar é fácil; escutar de verdade é raro — e exatamente por isso, transformador.",
        imagePrompt: `${baseStyle}, two empty white coffee cups facing each other on white table, soft light`,
      },
      {
        title: "Limites Saudáveis",
        content:
          "Amor não é diluir-se no outro. É preservar quem você é enquanto cria algo novo a dois. Mantenha amizades, hobbies, projetos individuais. Diga não com firmeza quando precisar. Limites claros não afastam: aproximam, porque mostram que existem duas pessoas inteiras se escolhendo, em vez de duas metades se fundindo por carência.",
        imagePrompt: `${baseStyle}, two single flowers in separate small vases side by side, white background, soft light`,
      },
      {
        title: "Tempo de Qualidade",
        content:
          "Casal não se mantém em piloto automático. Marque encontros como marcaria reunião: sem celular, sem rotina. Vinte minutos diários conversando sem distração valem mais que um fim de semana inteiro lado a lado em silêncio. Pequenos rituais de presença sustentam o vínculo no longo prazo.",
        imagePrompt: `${baseStyle}, two wine glasses on white linen tablecloth with single rose between them, soft light`,
      },
      {
        title: "Conflito Bem Resolvido",
        content:
          "Conflito não é problema: é informação. Mostra onde precisa ajustar. A regra ouro é nunca atacar a pessoa: critique o comportamento, não o caráter. Use linguagem em primeira pessoa: eu me senti, eu preciso. Faça pausa quando esquentar. Volte calmo. Casais maduros brigam diferente, não menos.",
        imagePrompt: `${baseStyle}, two hands holding each other gently on white table, soft natural light`,
      },
      {
        title: "Gratidão Constante",
        content:
          "Relacionamento que se acomoda morre devagar. Diga obrigado pelos gestos pequenos. Elogie em voz alta. Mande mensagem no meio do dia sem motivo. Surpreenda com um café preparado, uma flor, um abraço sem razão. Pequenas demonstrações repetidas constroem um sentimento de ser visto que nenhuma grande surpresa anual substitui.",
        imagePrompt: `${baseStyle}, single white envelope with handwritten love note partially visible, soft light`,
      },
    ],
  },
  {
    niche: "Receitas e culinária",
    id: "30cfc392-9120-4c3c-99f0-b2318a0f5fd5",
    slug: "receitas",
    title: "Cozinha Fit",
    subtitle: "Cinco refeições rápidas, saudáveis e saborosas",
    coverPrompt: `${coverStyle}, beautiful arranged salad bowl with fresh ingredients, overhead, soft light`,
    chapters: [
      {
        title: "Bowl de Frango Grelhado",
        content:
          "Quinhentos gramas de peito de frango temperado com limão, alho e ervas. Grelhe sete minutos de cada lado. Sirva sobre arroz integral, brócolis no vapor, cenoura ralada e meio abacate. Finalize com azeite e gergelim. Quarenta gramas de proteína, fibras, gordura boa e carboidrato lento. Pronto em vinte e cinco minutos, sustenta por cinco horas.",
        imagePrompt: `${baseStyle}, grilled chicken bowl with rice, broccoli, avocado on white plate, overhead`,
      },
      {
        title: "Omelete Recheada",
        content:
          "Três ovos batidos com pitada de sal e pimenta. Despeje em frigideira antiaderente quente, recheie com espinafre refogado, tomate cereja e queijo cottage. Dobre ao meio e sirva com uma fatia de pão integral. Trinta gramas de proteína, vitaminas, café da manhã ou jantar leve. Pronto em oito minutos do começo ao fim.",
        imagePrompt: `${baseStyle}, folded omelette with spinach filling on white plate, fresh herbs, overhead`,
      },
      {
        title: "Salmão com Legumes",
        content:
          "Filé de salmão temperado com sal, limão e dill, assado a duzentos graus por quinze minutos junto com abobrinha em rodelas, tomate e pimentão. Regue com azeite. Sirva com batata doce assada. Ômega 3, proteína completa, vegetais coloridos. Jantar premium sem complicação. Sobra para o almoço do dia seguinte.",
        imagePrompt: `${baseStyle}, baked salmon fillet with roasted vegetables on white plate, overhead, soft light`,
      },
      {
        title: "Smoothie de Recuperação",
        content:
          "Uma banana congelada, scoop de whey, copo de leite vegetal, colher de pasta de amendoim e canela. Bata até ficar cremoso. Vinte e cinco gramas de proteína, carboidrato rápido e gordura boa. Pós-treino perfeito, ou lanche da tarde rápido. Cinco minutos do começo ao copo. Funcional e delicioso.",
        imagePrompt: `${baseStyle}, vanilla smoothie in tall glass with banana slices and almonds on white background`,
      },
      {
        title: "Salada Completa",
        content:
          "Mix de folhas verdes, grão de bico cozido, tomate cereja, pepino, ovo cozido, sementes de girassol e queijo feta. Tempere com azeite, limão, mostarda dijon e sal. Refeição completa em quinze minutos, vegetariana, com proteína suficiente para almoço. Cabe em uma marmita e aguenta firme na geladeira por dois dias.",
        imagePrompt: `${baseStyle}, colorful salad bowl with chickpeas, vegetables, egg on white plate, overhead`,
      },
    ],
  },
  {
    niche: "Pets",
    id: "27b82d87-9294-4316-8ecd-bfc1d1fd2fc5",
    slug: "pets",
    title: "Tutor Consciente",
    subtitle: "Cinco passos para cuidar do seu cão como ele merece",
    coverPrompt: `${coverStyle}, single friendly golden retriever sitting calmly, studio white background, soft light`,
    chapters: [
      {
        title: "Alimentação Adequada",
        content:
          "Ração de qualidade muda saúde, pelagem e disposição do cão. Leia o rótulo: proteína animal deve ser o primeiro ingrediente. Quantidade varia por peso, idade e raça — consulte um veterinário. Água fresca sempre disponível. Petiscos não passam de dez por cento das calorias diárias. Comida de gente não é prêmio: é fonte de doença.",
        imagePrompt: `${baseStyle}, ceramic dog food bowl filled with quality kibble on white floor, soft light`,
      },
      {
        title: "Adestramento Positivo",
        content:
          "Cão não obedece por medo: aprende por reforço. Use petiscos pequenos, voz alegre e sessões curtas de cinco minutos várias vezes ao dia. Sente, fica e vem são os três comandos essenciais. Punição quebra confiança; recompensa constrói vínculo. Em quatro semanas o comportamento muda de forma visível e duradoura.",
        imagePrompt: `${baseStyle}, single dog treat on outstretched palm, white background, soft natural light`,
      },
      {
        title: "Exercício Diário",
        content:
          "Cão sem energia gastada vira cão destrutivo. Pelo menos quarenta e cinco minutos de caminhada por dia, mais brincadeiras curtas em casa. Raças ativas precisam de duas vezes isso. Cheirar pelo caminho é tão importante quanto andar: o olfato gasta energia mental. Cão cansado é cão feliz e calmo em casa.",
        imagePrompt: `${baseStyle}, dog leash and tennis ball arranged on white floor, soft shadow, clean composition`,
      },
      {
        title: "Saúde Preventiva",
        content:
          "Vacinação em dia, vermifugação a cada três meses, antipulgas mensal e check-up anual. Escovar os dentes três vezes por semana evita tártaro e doença cardíaca futura. Aparar unhas a cada três semanas. Limpeza de ouvido conforme orientação veterinária. Prevenção custa pouco; tratamento de doença evitável custa muito mais.",
        imagePrompt: `${baseStyle}, stethoscope and small dog collar on white surface, soft light, minimalist`,
      },
      {
        title: "Vínculo Real",
        content:
          "Cão não precisa de roupinha cara: precisa de presença. Sentar perto, conversar, escovar com carinho, deixar dormir do seu lado se você quiser. Esses gestos repetidos criam um vínculo que dura uma vida inteira. Você é o universo do seu cão — honre essa responsabilidade com tempo, não só com produto.",
        imagePrompt: `${baseStyle}, person hand gently petting dogs head, intimate moment, white background, soft light`,
      },
    ],
  },
  {
    niche: "Saúde mental",
    id: "a470b5f3-a8d2-4144-b9c6-a887012da5fc",
    slug: "saude-mental",
    title: "Mente em Paz",
    subtitle: "Cinco passos para equilíbrio emocional no dia a dia",
    coverPrompt: `${coverStyle}, single small green plant in white pot beside calm gray stone, soft window light`,
    chapters: [
      {
        title: "Respiração Consciente",
        content:
          "Quando a ansiedade aperta, o corpo precisa de uma intervenção física antes de qualquer análise mental. Inspire por quatro segundos, segure por quatro, expire por seis. Repita seis vezes. Esse ciclo ativa o sistema nervoso parassimpático e reduz o pico em menos de dois minutos. Funciona em fila de banco, antes de reunião, no meio da noite acordado. É grátis, sempre disponível e cientificamente comprovado.",
        imagePrompt: `${baseStyle}, single feather floating in still air against white background, soft light`,
      },
      {
        title: "Movimento Como Remédio",
        content:
          "Trinta minutos de caminhada diária têm efeito clínico comparável a antidepressivos leves em casos brandos. Não é metáfora: é estudo. O corpo libera serotonina, dopamina e endorfina naturalmente. Não precisa ser treino intenso. Saia de casa, vá até a esquina, volte. Repita amanhã. Em duas semanas o humor muda de patamar. É a intervenção mais subestimada da saúde mental.",
        imagePrompt: `${baseStyle}, single pair of white sneakers on wooden floor, soft morning light, minimalist`,
      },
      {
        title: "Limites Digitais",
        content:
          "Notificação constante mantém o cérebro em estado de alerta permanente. Isso esgota. Tire push de redes sociais. Deixe o celular fora do quarto à noite. Escolha duas janelas no dia para responder mensagens. Você não está obrigado a estar disponível vinte e quatro horas. O mundo continua girando enquanto você cuida da sua mente.",
        imagePrompt: `${baseStyle}, smartphone face down on white wooden table beside open book, soft natural light`,
      },
      {
        title: "Conexão Humana",
        content:
          "Solidão crônica adoece tanto quanto fumar quinze cigarros por dia — isso é dado, não dramatização. Marque um café com alguém esta semana. Ligue para uma pessoa querida sem motivo. Aceite o convite mesmo cansado. Vínculo real protege contra ansiedade e depressão melhor que qualquer técnica isolada. Não dá para meditar sozinho a vida inteira.",
        imagePrompt: `${baseStyle}, two ceramic mugs of tea on white table, intimate setting, soft afternoon light`,
      },
      {
        title: "Pedir Ajuda",
        content:
          "Procurar terapia não é fraqueza: é maturidade. Você não tenta arrumar um dente cariado sozinho — não tente reorganizar a mente sem apoio profissional quando a coisa pesar. Existem opções acessíveis, online, em CAPS gratuitos. Pedir ajuda no início economiza anos de sofrimento depois. Sua mente merece o mesmo cuidado que você dá ao corpo.",
        imagePrompt: `${baseStyle}, single white chair beside small plant in bright minimalist room, soft window light`,
      },
    ],
  },
  {
    niche: "Empreendedorismo",
    id: "6cf46fad-7d9d-4514-bd92-c3f56e285278",
    slug: "empreendedorismo",
    title: "Comece Pequeno",
    subtitle: "Cinco passos para tirar seu negócio do papel",
    coverPrompt: `${coverStyle}, single small green plant sprouting from coffee cup on white desk, morning light`,
    chapters: [
      {
        title: "Valide Antes de Investir",
        content:
          "Quase todo negócio que quebra teve uma certeza não validada. Antes de gastar dinheiro, gaste tempo conversando com clientes potenciais. Vinte entrevistas curtas valem mais que qualquer pesquisa de mercado caríssima. Pergunte sobre dor, não sobre interesse. Pessoas dizem que comprariam algo que nunca compram. Só o pagamento real prova demanda.",
        imagePrompt: `${baseStyle}, two people having coffee meeting at white table, hands and notebook visible, soft light`,
      },
      {
        title: "MVP Simples",
        content:
          "Não construa a versão perfeita: construa a menor versão que entrega valor. Site simples, atendimento manual, processo rudimentar. Lance em quatro semanas. O cliente paga, você aprende, ajusta. Empresas que demoram dois anos para lançar geralmente nunca lançam. Imperfeito no ar vale infinitamente mais que perfeito na gaveta.",
        imagePrompt: `${baseStyle}, single paper airplane mid-flight against white background, soft shadow, minimalist`,
      },
      {
        title: "Foco em Uma Coisa",
        content:
          "Iniciante tenta atender dez tipos de cliente com cinco produtos em três canais. Resultado: nada funciona direito. Escolha um cliente ideal, um produto, um canal. Domine antes de expandir. Crescimento sustentável é feito de uma única coisa funcionando muito bem, e não de várias coisas funcionando médio.",
        imagePrompt: `${baseStyle}, single sharpened pencil on blank white paper, soft shadow, minimalist composition`,
      },
      {
        title: "Caixa Acima de Tudo",
        content:
          "Lucro é opinião; caixa é fato. Acompanhe entradas e saídas diariamente. Mantenha reserva de três meses de custos fixos antes de qualquer expansão. Negócio não morre por falta de cliente: morre por falta de caixa. Cobre quem te deve, negocie prazo de fornecedor, evite endividamento desnecessário. Disciplina financeira separa empresa amadora de profissional.",
        imagePrompt: `${baseStyle}, neat stack of bills and small notebook on white desk, soft light`,
      },
      {
        title: "Persistência Inteligente",
        content:
          "A maioria desiste no momento em que ia dar certo. Defina marcos claros e prazo realista: doze a vinte e quatro meses para ver tração. Persistir não é insistir no mesmo plano errado: é manter o objetivo enquanto ajusta o método. Quem persiste com inteligência colhe. Quem persiste por teimosia quebra.",
        imagePrompt: `${baseStyle}, single mountain peak shape made of white paper origami, soft shadow, minimalist`,
      },
    ],
  },
  {
    niche: "Estudos e concursos",
    id: "58ff8975-9150-454c-aef1-1005b40e1618",
    slug: "estudos",
    title: "Aprovação",
    subtitle: "Cinco passos para passar em concurso",
    coverPrompt: `${coverStyle}, single open book with eyeglasses resting on top, soft natural light, study mood`,
    chapters: [
      {
        title: "Estude o Edital",
        content:
          "O edital é o mapa. Imprima, leia três vezes, marque o que é cobrado em maior peso. Pesquise últimas três provas da banca — questões se repetem em padrão. Faça um cronograma de doze a dezoito meses dividindo as matérias por relevância. Quem estuda sem edital estuda no escuro. Esse documento é seu plano de batalha.",
        imagePrompt: `${baseStyle}, highlighted printed document with yellow marker on white desk, soft light`,
      },
      {
        title: "Rotina de Ferro",
        content:
          "Aprovação não é sobre talento: é sobre repetição diária. Defina blocos fixos de quatro a seis horas por dia, mesmo aos fins de semana. Use técnica pomodoro: cinquenta minutos focado, dez de pausa. Estudar todo dia médio vence estudar duas vezes por semana em maratona. O cérebro consolida com regularidade, não com intensidade.",
        imagePrompt: `${baseStyle}, single white wall clock showing study time, beside open notebook, soft light`,
      },
      {
        title: "Resolução de Questões",
        content:
          "Não basta ler resumo: tem que resolver questão. Dedique metade do tempo de estudo a exercícios da banca específica. Erro vira aula: anote em caderno de revisão e revisite semanalmente. Banca pensa de jeito próprio, e quem resolve cem questões certas aprende mais que quem lê dez resumos. Prova mede execução, não conhecimento abstrato.",
        imagePrompt: `${baseStyle}, hand holding pen filling answer sheet, white background, sharp focus`,
      },
      {
        title: "Revisão Espaçada",
        content:
          "Memória esquece em curva exponencial. Para fixar, revise um dia depois, sete dias depois, trinta dias depois. Use flashcards no celular para revisão rápida em fila, ônibus, intervalo. Em um ano, conteúdo revisitado três vezes vira automático. Estudar uma vez e nunca mais voltar é desperdiçar o esforço inicial.",
        imagePrompt: `${baseStyle}, stack of small white flashcards neatly arranged on white desk, soft shadow`,
      },
      {
        title: "Saúde e Disciplina",
        content:
          "Cérebro precisa de sono, exercício e alimentação para render. Sete horas de sono, trinta minutos de caminhada e refeições leves multiplicam capacidade de absorção. Concurseiro que dorme pouco e come mal estuda muito pior. Disciplina inclui descanso. Quem cuida do corpo aprende mais rápido — e aguenta a longa jornada até a aprovação.",
        imagePrompt: `${baseStyle}, single green apple and water glass beside closed book, white desk, soft light`,
      },
    ],
  },
  {
    niche: "Idiomas",
    id: "d45761ad-bc5e-4d6b-9250-8861468e85fa",
    slug: "idiomas",
    title: "Inglês Fluente",
    subtitle: "Cinco passos para aprender inglês sozinho",
    coverPrompt: `${coverStyle}, single open dictionary with reading glasses on top, soft light, study mood`,
    chapters: [
      {
        title: "Imersão Diária",
        content:
          "Sem contato diário, o cérebro não fixa um idioma. Configure celular em inglês, troque legendas, ouça podcast no caminho. Trinta minutos de imersão passiva todos os dias rendem mais que duas horas semanais em sala. O segredo é tornar o idioma parte invisível da rotina, não evento separado da vida.",
        imagePrompt: `${baseStyle}, smartphone on white desk displaying small language icon, headphones beside, soft light`,
      },
      {
        title: "Fale Desde o Início",
        content:
          "Esperar dominar gramática antes de falar é o maior erro do iniciante. Comece a falar no primeiro mês, mesmo errando muito. Aplicativos de conversação, intercâmbio online ou simplesmente falando sozinho em voz alta. Quem trava na hora de falar nunca destrava. Erro é parte do processo, não vergonha a evitar.",
        imagePrompt: `${baseStyle}, single microphone on white background, soft side light, minimalist composition`,
      },
      {
        title: "Vocabulário Útil",
        content:
          "Aprender duas mil palavras corretas dá conta de oitenta por cento das conversas reais. Use método Anki ou flashcards diários. Foque em palavras do seu dia a dia: trabalho, hobby, comida, lugares. Vocabulário sem contexto não cola; vocabulário aplicado vira parte do pensamento em pouco tempo. Mire frequência, não exotismo.",
        imagePrompt: `${baseStyle}, stack of small flashcards with single word visible on top, white desk, soft light`,
      },
      {
        title: "Gramática Como Apoio",
        content:
          "Gramática é estrutura, não objetivo. Estude apenas o suficiente para entender padrões e seguir adiante. Não é necessário decorar todos os tempos verbais antes de falar. Compreenda os cinco mais usados, pratique em frases reais, complemente depois. Quem se apega à gramática perde anos sem nunca conseguir uma conversa fluente.",
        imagePrompt: `${baseStyle}, open notebook with simple handwritten verb conjugation, pen beside, soft light`,
      },
      {
        title: "Consistência por Anos",
        content:
          "Não existe fluência em três meses. Existe progresso real em dois anos com prática diária. Aceite o jogo longo: pequenos avanços invisíveis no dia, gigantes no acumulado. Quem desiste na curva da frustração nunca colhe. Quem persiste passa a sonhar no novo idioma — sinal de que a fluência chegou de verdade.",
        imagePrompt: `${baseStyle}, single bookmark in pages of open book, white background, soft natural light`,
      },
    ],
  },
  {
    niche: "Renda extra",
    id: "2d2ceab6-4478-4291-9500-988011259538",
    slug: "renda-extra",
    title: "Multiplique Sua Renda",
    subtitle: "Cinco caminhos digitais para ganhar mais",
    coverPrompt: `${coverStyle}, single laptop displaying minimalist chart, coffee cup beside, soft morning light`,
    chapters: [
      {
        title: "Freelance Especializado",
        content:
          "Sua habilidade atual já vale dinheiro. Design, redação, edição de vídeo, planilhas, tradução: tudo isso tem demanda em plataformas como Workana, 99Freelas e LinkedIn. Comece cobrando abaixo do mercado para conseguir primeiras avaliações. Em três meses, suba preço. Em seis, escolha cliente. Especialização clara cobra mais que generalista médio.",
        imagePrompt: `${baseStyle}, single open laptop on white desk with hands typing, soft natural light`,
      },
      {
        title: "Venda Conhecimento",
        content:
          "Tudo que você sabe alguém quer aprender. Curso digital, ebook, mentoria: o ativo digital trabalha enquanto você dorme. Comece simples: um PDF de trinta páginas vendido por trinta reais via Hotmart já vale a primeira venda. O importante é entregar transformação real. Conteúdo bom gera depoimento, depoimento gera venda recorrente.",
        imagePrompt: `${baseStyle}, single ebook on tablet displayed on white desk, soft light, minimalist`,
      },
      {
        title: "Afiliados Sem Enganação",
        content:
          "Indicar produto bom para audiência certa gera comissão honesta. Use Hotmart, Amazon, Magalu. Recomende apenas o que você de fato usaria. Confiança é o ativo mais valioso de quem trabalha com afiliação. Truque, exagero e promessa irreal queimam reputação em uma semana e levam anos para reconstruir.",
        imagePrompt: `${baseStyle}, smartphone displaying minimalist shopping bag icon glowing turquoise, soft light`,
      },
      {
        title: "Pequenos Serviços Locais",
        content:
          "Nem toda renda extra precisa ser digital. Lavar carro no bairro, cuidar de pet, organizar casas, montar móveis. Anuncie no grupo do condomínio, no WhatsApp, no Instagram local. Custo zero para começar e demanda real em cidade grande. Quinhentos reais extras por mês mudam o orçamento de muita gente.",
        imagePrompt: `${baseStyle}, single set of car keys beside microfiber cloth on white surface, soft light`,
      },
      {
        title: "Reinvista, Não Gaste",
        content:
          "O segredo da renda extra que vira renda principal é uma decisão: reinvestir. Use os primeiros mil reais para equipamento melhor, curso, anúncio. Não para upgrade de celular. Quem reinveste constrói máquina; quem consome volta ao zero todo mês. Disciplina financeira aplicada a ganhos extras muda o jogo em doze meses.",
        imagePrompt: `${baseStyle}, single green plant growing from glass jar of coins, white background, soft light`,
      },
    ],
  },
  {
    niche: "Viagens",
    id: "390f4db4-786b-489e-bff2-998a9911db02",
    slug: "viagens",
    title: "Viaje Mais",
    subtitle: "Cinco passos para gastar menos e viajar melhor",
    coverPrompt: `${coverStyle}, single small globe beside compass on white desk, soft natural light`,
    chapters: [
      {
        title: "Compre Passagem Com Antecedência",
        content:
          "Preço de passagem cai drasticamente quando comprada entre dois e quatro meses antes da viagem. Use comparadores como Skyscanner, Decolar e Google Flights. Configure alerta de preço. Voos de terça e quarta saem mais baratos. Voar com escala economiza até metade. Flexibilidade de data e horário é seu maior aliado.",
        imagePrompt: `${baseStyle}, single passport with boarding pass on white surface, soft light`,
      },
      {
        title: "Hospedagem Inteligente",
        content:
          "Hotel cinco estrelas nem sempre é o melhor caminho. Airbnb em bairro local custa metade e entrega experiência mais autêntica. Hostel privativo é opção em viagem solo. Reserve direto pelo site do hotel quando possível: muitos oferecem desconto exclusivo. Localização vence luxo — economize em quarto, gaste em experiência.",
        imagePrompt: `${baseStyle}, single key on wooden surface beside small house figurine, white background, soft light`,
      },
      {
        title: "Roteiro Equilibrado",
        content:
          "Tentar ver tudo é a forma mais rápida de não aproveitar nada. Escolha três atrações principais por dia, deixe espaço para descoberta espontânea. Caminhe sem pressa, sente em café local, observe. Viagem boa não é checklist cumprido: é momento absorvido. Velocidade é inimiga da memória de viagem.",
        imagePrompt: `${baseStyle}, single open travel map with red pin marker on white table, soft light`,
      },
      {
        title: "Coma Como Local",
        content:
          "Restaurante turístico cobra três vezes mais e serve pior. Ande dois quarteirões para fora da área principal e encontre comida local de verdade pela metade do preço. Pergunte ao garçom o que ele come fora do trabalho. Mercados municipais são tesouros gastronômicos baratos. Sua memória de viagem mais marcante geralmente vem da mesa.",
        imagePrompt: `${baseStyle}, beautifully plated local dish on white plate, fresh ingredients, overhead, soft light`,
      },
      {
        title: "Documentos em Ordem",
        content:
          "Passaporte válido por seis meses além da data de retorno. Cópia digital no celular. Seguro viagem obrigatório em destino internacional — emergência médica fora pode custar mais que toda a viagem. Cartão de crédito internacional sem IOF economiza muito. Pequenos cuidados antes de embarcar evitam grandes problemas no destino.",
        imagePrompt: `${baseStyle}, open passport with travel documents arranged on white surface, soft light`,
      },
    ],
  },
  {
    niche: "Tecnologia e programação",
    id: "7d1a76ee-266a-4da5-87b8-4a7802321316",
    slug: "tecnologia",
    title: "Comece a Programar",
    subtitle: "Cinco passos para se tornar desenvolvedor",
    coverPrompt: `${coverStyle}, single sleek laptop displaying clean code on white desk, soft side light`,
    chapters: [
      {
        title: "Escolha Uma Linguagem",
        content:
          "Programar começa por escolher uma porta de entrada e fechar as outras. Para iniciante, Python ou JavaScript são as melhores opções: comunidade enorme, demanda alta, sintaxe acessível. Comprometa-se com uma por seis meses sem trocar. Trocar de linguagem é o jeito mais rápido de não aprender nenhuma. Profundidade vence variedade no começo.",
        imagePrompt: `${baseStyle}, single computer keyboard on white desk, soft light, minimalist composition`,
      },
      {
        title: "Pratique Todo Dia",
        content:
          "Quem programa uma hora todos os dias supera quem programa dez horas no sábado. Crie projetinhos pequenos: calculadora, lista de tarefas, jogo simples. Aprender por curso é metade; aprender colocando a mão é o resto. Errar muito é parte essencial do processo. Cada bug resolvido é uma lição que cola.",
        imagePrompt: `${baseStyle}, hands typing on white mechanical keyboard, soft light, sharp focus, top down`,
      },
      {
        title: "Construa Portfólio",
        content:
          "Diploma não abre porta no mercado de tecnologia: portfólio abre. Coloque três a cinco projetos próprios no GitHub, mesmo simples. Documente bem cada um. Mostre processo, não só resultado. Recrutador olha código real, não certificado. Um projeto bem feito vale mais que dez bootcamps na lista.",
        imagePrompt: `${baseStyle}, single open laptop with code editor visible on screen, white desk, soft light`,
      },
      {
        title: "Estude Inglês Técnico",
        content:
          "Noventa por cento da documentação relevante está em inglês. Não precisa ser fluente para começar: precisa ler. Leia documentação oficial das ferramentas que usa, mesmo devagar. Em três meses, leitura técnica vira automática. Esse pequeno hábito multiplica oportunidades e acesso a conteúdo de qualidade.",
        imagePrompt: `${baseStyle}, single open programming book with bookmark on white desk, soft light`,
      },
      {
        title: "Comunidade Faz Diferença",
        content:
          "Aprender programação sozinho é caminho lento. Entre em comunidades no Discord, participe de meetups locais, contribua em projeto open source. Pergunta boba não existe quando você está começando. Conexões nessa fase abrem primeiras vagas e indicações. Carreira em tecnologia se constrói tanto por código quanto por rede de contatos.",
        imagePrompt: `${baseStyle}, two laptops facing each other on white table with coffee cups, soft light`,
      },
    ],
  },
  {
    niche: "Arquitetura e Decoração",
    id: "23dd1aa6-d61a-44ad-9d94-9514f25c12aa",
    slug: "decoracao",
    title: "Ambiente dos Sonhos",
    subtitle: "Cinco passos para transformar qualquer espaço",
    coverPrompt: `${coverStyle}, single minimalist white armchair with green plant beside, soft light, clean room`,
    chapters: [
      {
        title: "Defina o Estilo",
        content:
          "Antes de comprar qualquer coisa, defina o estilo do ambiente. Minimalista, escandinavo, industrial, rústico, contemporâneo. Crie um painel de referência no Pinterest com cinquenta imagens, deixe descansar uma semana, volte e mantenha só as dez que ainda ressoam. Esse painel vira guia para todas as decisões futuras de móveis, cores e texturas.",
        imagePrompt: `${baseStyle}, mood board with fabric swatches and color samples on white surface, soft light`,
      },
      {
        title: "Iluminação Transforma",
        content:
          "Luz muda mais um ambiente do que qualquer móvel novo. Use três camadas: geral, tarefa e ambiente. Lâmpadas quentes de três mil Kelvin para sala e quarto. Spots focais valorizam quadros e plantas. Abajures criam aconchego à noite. Iluminação ruim destrói o melhor projeto; iluminação certa eleva o mais simples.",
        imagePrompt: `${baseStyle}, single white pendant lamp glowing softly above empty table, clean composition`,
      },
      {
        title: "Cores e Texturas",
        content:
          "Use a regra sessenta–trinta–dez: sessenta por cento de cor principal neutra, trinta por cento de secundária complementar, dez por cento de acento marcante. Texturas variadas — madeira, linho, metal, cerâmica — criam profundidade visual. Ambiente monocromático sem textura cansa; mistura inteligente envolve sem cansar.",
        imagePrompt: `${baseStyle}, three small color swatches arranged on white surface, soft natural light`,
      },
      {
        title: "Menos é Mais",
        content:
          "Espaço bonito não é espaço cheio: é espaço respirado. Antes de comprar um móvel novo, retire dois antigos que não são essenciais. Mesa vazia, parede com um único quadro centralizado, prateleira com três objetos selecionados. Vazio bem desenhado vale mais que cheio bem organizado. O olhar precisa de pausa.",
        imagePrompt: `${baseStyle}, single beautiful vase with one flower on minimalist white shelf, soft light`,
      },
      {
        title: "Plantas e Vida",
        content:
          "Nenhum projeto de decoração se completa sem plantas. Elas trazem cor viva, umidificam o ar e melhoram humor comprovadamente. Comece com três fáceis: zamioculca, espada-de-são-jorge, jiboia. Vasos brancos ou cerâmica natural valorizam qualquer ambiente. Vida verde é o detalhe que separa ambiente bonito de ambiente que parece habitado.",
        imagePrompt: `${baseStyle}, single green leafy plant in white ceramic pot on minimalist shelf, soft light`,
      },
    ],
  },
  {
    niche: "Moda e Estilo",
    id: "ca43835a-630d-4412-ab4e-c9fb816c2125",
    slug: "moda",
    title: "Estilo Próprio",
    subtitle: "Cinco passos para construir um guarda-roupa que funciona",
    coverPrompt: `${coverStyle}, single neatly folded white t-shirt and watch on white surface, soft light`,
    chapters: [
      {
        title: "Conheça Seu Corpo",
        content:
          "Não existe roupa feia: existe roupa errada para o corpo. Identifique seu biotipo, comprimento de tronco e proporção de pernas. Tecidos que caem bem em um corpo aparecem mal em outro. Esse autoconhecimento básico evita compra ruim e acelera a montagem de looks que funcionam de verdade no espelho — e na vida real.",
        imagePrompt: `${baseStyle}, single mirror reflecting minimalist outfit on white wall, soft natural light`,
      },
      {
        title: "Cápsula Inteligente",
        content:
          "Guarda-roupa cápsula é a libertação do excesso. Trinta peças versáteis combinando entre si geram mais looks do que duzentas peças aleatórias. Base neutra — branco, preto, bege, jeans — e três pontos de cor por estação. Em três meses você nunca mais sente que não tem o que vestir. Menos peças escolhidas com cuidado mudam tudo.",
        imagePrompt: `${baseStyle}, capsule wardrobe items neatly hung on white rack, minimalist composition, soft light`,
      },
      {
        title: "Tecidos de Qualidade",
        content:
          "Roupa barata custa caro a longo prazo. Tecido natural — algodão, linho, lã, seda — dura anos, envelhece bem e veste melhor. Prefira comprar uma peça boa por trimestre que cinco ruins por mês. Etiqueta da composição é o que importa, não logo na frente. Qualidade aparece na primeira lavagem.",
        imagePrompt: `${baseStyle}, single neatly folded linen shirt close-up on white surface, soft natural light`,
      },
      {
        title: "Acessórios Marcantes",
        content:
          "O acessório certo eleva o look mais básico. Um bom relógio, um cinto de couro, óculos com personalidade, perfume marcante. Escolha poucos e use sempre. Esses pequenos elementos viram sua assinatura. Acessório certo conta história sobre você sem precisar dizer uma palavra.",
        imagePrompt: `${baseStyle}, single classic watch beside leather wallet on white surface, soft light`,
      },
      {
        title: "Atitude Acima da Roupa",
        content:
          "Roupa cara em corpo curvado vale menos que roupa simples em pessoa segura. Postura, olhar firme e sorriso natural transformam qualquer figurino. Estilo verdadeiro não está no preço do tecido: está em quem o veste. Use o que combina com sua história e ande como se realmente fosse seu.",
        imagePrompt: `${baseStyle}, person silhouette walking confidently in minimalist outfit, white background, soft light`,
      },
    ],
  },
];
