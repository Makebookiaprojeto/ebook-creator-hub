// Configuração das 3 novas variantes para cada nicho.
// Cada variante tem um "ângulo" diferente para garantir conteúdo único entre templates do mesmo nicho.
// O conteúdo final dos capítulos é gerado pela IA no momento do seed usando esses ângulos.

export type NicheVariant = {
  angle: string; // foco editorial específico desta variante
  toneHint: string; // palavra que orienta o tom
};

export type NicheConfig = {
  templateId: string; // id existente do template 1 (apenas referência, NÃO é alterado)
  niche: string; // nome exato do nicho na tabela
  slug: string;
  variants: [NicheVariant, NicheVariant, NicheVariant]; // variantes 2, 3 e 4
};

export const NICHES: NicheConfig[] = [
  {
    templateId: "8562c1c2-6259-4321-988f-157c992a1db0",
    niche: "Emagrecimento",
    slug: "emagrecimento",
    variants: [
      { angle: "jejum intermitente e janelas alimentares", toneHint: "científico-acessível" },
      { angle: "exercícios em casa sem equipamento para queima de gordura", toneHint: "motivador-prático" },
      { angle: "mindful eating e gestão de fome emocional", toneHint: "empático" },
    ],
  },
  {
    templateId: "c343dfaa-2862-4798-af99-af2bdcd2bfbe",
    niche: "Fitness e musculação",
    slug: "fitness",
    variants: [
      { angle: "treino de força para iniciantes com foco em técnica perfeita", toneHint: "didático" },
      { angle: "periodização avançada para platôs de hipertrofia", toneHint: "técnico" },
      { angle: "mobilidade, prevenção de lesão e longevidade no treino", toneHint: "preventivo" },
    ],
  },
  {
    templateId: "1c43ccca-0a23-4888-b6be-184d759c2e74",
    niche: "Marketing digital",
    slug: "marketing-digital",
    variants: [
      { angle: "tráfego pago no Meta Ads do zero ao primeiro ROI positivo", toneHint: "estratégico" },
      { angle: "criação de conteúdo orgânico viral em Reels e TikTok", toneHint: "criativo" },
      { angle: "funis de e-mail marketing e automação para infoprodutos", toneHint: "técnico-comercial" },
    ],
  },
  {
    templateId: "f921abf0-8d2c-4d1e-bda1-6c3bad6b78da",
    niche: "Finanças",
    slug: "financas",
    variants: [
      { angle: "primeiros investimentos em renda fixa e Tesouro Direto", toneHint: "educacional" },
      { angle: "estratégia agressiva para sair de dívidas em 12 meses", toneHint: "direto" },
      { angle: "construção de renda passiva com dividendos e FIIs", toneHint: "patrimonialista" },
    ],
  },
  {
    templateId: "6cf46fad-7d9d-4514-bd92-c3f56e285278",
    niche: "Empreendedorismo",
    slug: "empreendedorismo",
    variants: [
      { angle: "validação de ideias de negócio em até 30 dias", toneHint: "lean-startup" },
      { angle: "estruturação jurídica, fiscal e operacional do MEI ao Simples", toneHint: "prático" },
      { angle: "gestão de equipe, cultura e primeiros funcionários", toneHint: "liderança" },
    ],
  },
  {
    templateId: "5da42a5e-85c5-403b-bf5a-6f5aae7b6739",
    niche: "Desenvolvimento pessoal",
    slug: "desenvolvimento-pessoal",
    variants: [
      { angle: "construção de hábitos atômicos e rotina matinal de alta performance", toneHint: "prático" },
      { angle: "produtividade profunda e gestão de foco em mundo distraído", toneHint: "analítico" },
      { angle: "inteligência emocional e autoconhecimento aplicado ao dia a dia", toneHint: "reflexivo" },
    ],
  },
  {
    templateId: "a470b5f3-a8d2-4144-b9c6-a887012da5fc",
    niche: "Saúde mental",
    slug: "saude-mental",
    variants: [
      { angle: "manejo de ansiedade com técnicas baseadas em TCC", toneHint: "clínico-acessível" },
      { angle: "prevenção de burnout e equilíbrio entre trabalho e descanso", toneHint: "empático" },
      { angle: "meditação, respiração e regulação do sistema nervoso", toneHint: "contemplativo" },
    ],
  },
  {
    templateId: "15c7d7aa-946a-4a4d-b27b-19e4b380c8ea",
    niche: "Espiritualidade",
    slug: "espiritualidade",
    variants: [
      { angle: "práticas diárias de oração, gratidão e fé cristã", toneHint: "devocional" },
      { angle: "energias sutis, chakras e meditação oriental", toneHint: "esotérico-acessível" },
      { angle: "propósito de vida, missão e conexão com algo maior", toneHint: "filosófico" },
    ],
  },
  {
    templateId: "5e95f8a4-ceab-450b-ae00-55da6147d17d",
    niche: "Relacionamentos",
    slug: "relacionamentos",
    variants: [
      { angle: "comunicação não violenta em casais", toneHint: "empático" },
      { angle: "reconquista de relação após crise ou separação", toneHint: "estratégico-emocional" },
      { angle: "linguagens do amor e intimidade duradoura", toneHint: "afetuoso" },
    ],
  },
  {
    templateId: "56724db2-515c-4fc3-aceb-2974c0d02faf",
    niche: "Maternidade",
    slug: "maternidade",
    variants: [
      { angle: "amamentação, sono do bebê e primeiras semanas em casa", toneHint: "acolhedor" },
      { angle: "disciplina positiva e educação consciente de 0 a 6 anos", toneHint: "didático" },
      { angle: "saúde mental materna e equilíbrio entre mãe, mulher e profissional", toneHint: "empático" },
    ],
  },
  {
    templateId: "27b82d87-9294-4316-8ecd-bfc1d1fd2fc5",
    niche: "Pets",
    slug: "pets",
    variants: [
      { angle: "adestramento positivo de filhotes nos primeiros 6 meses", toneHint: "didático" },
      { angle: "nutrição natural e cuidados preventivos de saúde do cão adulto", toneHint: "informativo" },
      { angle: "comportamento, ansiedade de separação e enriquecimento ambiental", toneHint: "comportamental" },
    ],
  },
  {
    templateId: "30cfc392-9120-4c3c-99f0-b2318a0f5fd5",
    niche: "Receitas e culinária",
    slug: "receitas",
    variants: [
      { angle: "marmitas fitness para a semana toda em 2 horas", toneHint: "prático" },
      { angle: "confeitaria saudável sem açúcar refinado", toneHint: "criativo" },
      { angle: "cozinha mediterrânea acessível com ingredientes brasileiros", toneHint: "saboroso-cultural" },
    ],
  },
  {
    templateId: "f2117b13-9531-42ca-85e4-e695c13e4add",
    niche: "Beleza e autocuidado",
    slug: "beleza",
    variants: [
      { angle: "skincare anti-idade científico para mulheres 30+", toneHint: "técnico-elegante" },
      { angle: "make natural para o dia a dia em até 10 minutos", toneHint: "prático-leve" },
      { angle: "cuidados capilares, fortalecimento e crescimento dos fios", toneHint: "informativo" },
    ],
  },
  {
    templateId: "ca43835a-630d-4412-ab4e-c9fb816c2125",
    niche: "Moda e Estilo",
    slug: "moda",
    variants: [
      { angle: "guarda-roupa cápsula minimalista com 30 peças versáteis", toneHint: "minimalista" },
      { angle: "descobrindo o estilo pessoal através de arquétipos de moda", toneHint: "consultivo" },
      { angle: "moda consciente, sustentável e brechó com curadoria", toneHint: "sustentável" },
    ],
  },
  {
    templateId: "23dd1aa6-d61a-44ad-9d94-9514f25c12aa",
    niche: "Arquitetura e Decoração",
    slug: "arquitetura",
    variants: [
      { angle: "decoração escandinava acessível para apartamentos pequenos", toneHint: "minimalista" },
      { angle: "iluminação residencial em camadas para transformar ambientes", toneHint: "técnico-estético" },
      { angle: "biofilia, plantas e bem-estar dentro de casa", toneHint: "natural" },
    ],
  },
  {
    templateId: "390f4db4-786b-489e-bff2-998a9911db02",
    niche: "Viagens",
    slug: "viagens",
    variants: [
      { angle: "mochilão internacional com orçamento enxuto pela Europa", toneHint: "aventureiro" },
      { angle: "viagens em família com crianças pequenas sem estresse", toneHint: "organizado-empático" },
      { angle: "milhas, programas de fidelidade e passagens quase de graça", toneHint: "estratégico" },
    ],
  },
  {
    templateId: "d45761ad-bc5e-4d6b-9250-8861468e85fa",
    niche: "Idiomas",
    slug: "idiomas",
    variants: [
      { angle: "inglês conversacional fluente em 6 meses estudando 30 minutos por dia", toneHint: "prático" },
      { angle: "espanhol do zero ao intermediário com método imersivo", toneHint: "didático" },
      { angle: "preparação para certificações TOEFL e IELTS com estratégias de prova", toneHint: "técnico" },
    ],
  },
  {
    templateId: "58ff8975-9150-454c-aef1-1005b40e1618",
    niche: "Estudos e concursos",
    slug: "concursos",
    variants: [
      { angle: "técnicas de memorização e revisão espaçada para concursos federais", toneHint: "técnico" },
      { angle: "redação dissertativa-argumentativa nota mil para Enem e concursos", toneHint: "didático" },
      { angle: "rotina de estudos de alta performance trabalhando em tempo integral", toneHint: "estratégico" },
    ],
  },
  {
    templateId: "7d1a76ee-266a-4da5-87b8-4a7802321316",
    niche: "Tecnologia e programação",
    slug: "tecnologia",
    variants: [
      { angle: "JavaScript moderno do zero ao primeiro projeto front-end", toneHint: "didático" },
      { angle: "carreira em desenvolvimento: portfólio, GitHub e primeira vaga", toneHint: "estratégico" },
      { angle: "Python para automação de tarefas e produtividade pessoal", toneHint: "prático" },
    ],
  },
  {
    templateId: "2d2ceab6-4478-4291-9500-988011259538",
    niche: "Renda extra",
    slug: "renda-extra",
    variants: [
      { angle: "freelance de design e copywriting nas plataformas internacionais", toneHint: "prático-comercial" },
      { angle: "venda de produtos digitais em marketplaces brasileiros", toneHint: "estratégico" },
      { angle: "delivery, motorista de app e serviços locais com gestão profissional", toneHint: "operacional" },
    ],
  },
];
