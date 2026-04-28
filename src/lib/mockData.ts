export const recentEbooks = [
  { id: 1, title: "Emagreça em 30 dias", niche: "Emagrecimento", price: 47, sales: 124, status: "Publicado" },
  { id: 2, title: "Renda Extra com Afiliados", niche: "Renda extra", price: 67, sales: 89, status: "Publicado" },
  { id: 3, title: "Marketing no Instagram", niche: "Marketing digital", price: 97, sales: 56, status: "Rascunho" },
  { id: 4, title: "Reconquiste seu Amor", niche: "Relacionamentos", price: 37, sales: 203, status: "Publicado" },
  { id: 5, title: "Dieta Low Carb Definitiva", niche: "Emagrecimento", price: 27, sales: 41, status: "Publicado" },
];

export const salesChartData = [
  { month: "Jan", vendas: 12, visualizacoes: 240 },
  { month: "Fev", vendas: 19, visualizacoes: 320 },
  { month: "Mar", vendas: 28, visualizacoes: 480 },
  { month: "Abr", vendas: 41, visualizacoes: 620 },
  { month: "Mai", vendas: 55, visualizacoes: 890 },
  { month: "Jun", vendas: 72, visualizacoes: 1240 },
];

export const niches = [
  { name: "Emagrecimento", emoji: "🔥", desc: "Alta demanda, ticket médio R$47" },
  { name: "Renda extra", emoji: "💰", desc: "Público engajado, conversão alta" },
  { name: "Marketing digital", emoji: "📈", desc: "Ticket alto, R$97-197" },
  { name: "Relacionamentos", emoji: "💕", desc: "Mercado emocional forte" },
  { name: "Desenvolvimento pessoal", emoji: "🧠", desc: "Crescimento constante" },
  { name: "Finanças", emoji: "💵", desc: "Profissional, ticket alto" },
  { name: "Saúde mental", emoji: "🧘", desc: "Ansiedade, sono, foco" },
  { name: "Fitness e musculação", emoji: "💪", desc: "Hipertrofia, treinos" },
  { name: "Receitas e culinária", emoji: "🍳", desc: "Low carb, fit, doces" },
  { name: "Maternidade", emoji: "👶", desc: "Gestação, sono do bebê" },
  { name: "Pets", emoji: "🐶", desc: "Adestramento, cuidados" },
  { name: "Espiritualidade", emoji: "✨", desc: "Tarô, astrologia, fé" },
  { name: "Estudos e concursos", emoji: "📚", desc: "ENEM, OAB, vestibular" },
  { name: "Tecnologia e programação", emoji: "💻", desc: "Dev, IA, no-code" },
  { name: "Beleza e autocuidado", emoji: "💄", desc: "Skincare, cabelo, makeup" },
  { name: "Empreendedorismo", emoji: "🚀", desc: "Negócios, gestão, vendas" },
  { name: "Idiomas", emoji: "🌍", desc: "Inglês, espanhol fluente" },
  { name: "Viagens", emoji: "✈️", desc: "Roteiros, mochilão, dicas" },
];

// Pool of group name templates and engagement levels — used to generate
// topic-specific Facebook group results dynamically in the marketing step.
export const groupTemplates = [
  { suffix: "Brasil", base: 245000, engagement: "Alto" },
  { suffix: "Oficial", base: 189000, engagement: "Alto" },
  { suffix: "para Iniciantes", base: 156000, engagement: "Médio" },
  { suffix: "Avançado", base: 98000, engagement: "Alto" },
  { suffix: "Comunidade", base: 312000, engagement: "Alto" },
  { suffix: "Dicas e Estratégias", base: 134000, engagement: "Médio" },
  { suffix: "Networking BR", base: 76000, engagement: "Alto" },
  { suffix: "Resultados Reais", base: 54000, engagement: "Médio" },
  { suffix: "Mastermind", base: 42000, engagement: "Alto" },
  { suffix: "Grupo Aberto", base: 188000, engagement: "Médio" },
];

// Kept for backwards compatibility (not used in new search flow)
export const facebookGroups = [
  { name: "Empreendedores Digitais Brasil", members: 245000, engagement: "Alto" },
  { name: "Renda Extra Online", members: 189000, engagement: "Alto" },
];

export const promoMessages = [
  "🔥 Acabei de lançar um material que mudou minha vida! Aprenda passo a passo como [BENEFÍCIO]. Acesse: [LINK]",
  "✨ Você sabia que dá pra [RESULTADO] em apenas 30 dias? Eu testei e funciona! Confira: [LINK]",
  "💡 Ebook novo na área! Tudo o que você precisa saber sobre [TEMA] em um só lugar. [LINK]",
];

export const tools = [
  { id: 1, name: "Gerador de Títulos", desc: "Crie títulos magnéticos com IA", icon: "Sparkles", color: "from-violet-500 to-purple-500" },
  { id: 2, name: "Gerador de Copy", desc: "Textos persuasivos para vendas", icon: "PenLine", color: "from-pink-500 to-rose-500" },
  { id: 3, name: "Ideias de Nicho", desc: "Descubra nichos lucrativos", icon: "Lightbulb", color: "from-amber-500 to-orange-500" },
  { id: 4, name: "Analisador de Concorrência", desc: "Estude o mercado em segundos", icon: "Search", color: "from-blue-500 to-cyan-500" },
  { id: 5, name: "Gerador de Capas", desc: "Capas profissionais com IA", icon: "Image", color: "from-emerald-500 to-teal-500" },
  { id: 6, name: "Otimizador SEO", desc: "Melhore seu posicionamento", icon: "TrendingUp", color: "from-indigo-500 to-violet-500" },
];

export const faqs = [
  { q: "Como funciona a geração de ebooks com IA?", a: "Nossa IA cria estrutura, capítulos e conteúdo a partir do seu nicho. Você edita tudo livremente antes de publicar." },
  { q: "Posso editar o conteúdo gerado?", a: "Sim! Todo o conteúdo é 100% editável. A IA é seu ponto de partida, não o limite." },
  { q: "Como recebo os pagamentos das vendas?", a: "Os pagamentos são processados via Stripe, ou algum checkout da sua preferência (Hotmart, Kiwify, Mercado Pago, Stripe Payment Link, etc), garantindo segurança e rapidez." },
  { q: "Existe limite de ebooks?", a: "Sim, para manter a qualidade e o custo acessível para todos, cada usuário pode gerar até 20 novos eBooks por mês." },
  { q: "Posso cancelar quando quiser?", a: "Sim, no plano mensal você pode cancelar a qualquer momento sem fidelidade ou multas." },
];

export const plans = [
  {
    id: "monthly",
    name: "Plano Mensal",
    price: 149.90,
    period: "/mês",
    highlight: false,
    features: ["Ebooks ilimitados", "IA premium GPT-4o", "Páginas de vendas inclusas", "Analytics avançado", "Suporte prioritário"],
  },
  {
    id: "lifetime",
    name: "Acesso Vitalício",
    price: 249.90,
    period: "pagamento único",
    highlight: true,
    features: ["Tudo do plano Mensal", "Acesso para sempre", "Sem mensalidade", "Bônus: Gerador de Criativos", "Suporte VIP vitalício"],
  },
];

export const user = {
  name: "Lucas Andrade",
  email: "lucas@ebookai.com",
  plan: "PRO" as "PRO",
  ebooksCreated: 5,
  totalSales: 513,
  totalRevenue: 24890,
};

// Mocked chapter content for preview
export const chapterPreviews: Record<string, string> = {
  default: `Neste capítulo você vai descobrir os fundamentos essenciais do tema. Vamos abordar os conceitos centrais com exemplos práticos, estudos de caso reais e exercícios aplicáveis no seu dia a dia.\n\nAo final, você terá clareza sobre os próximos passos e estará pronto para colocar em prática tudo o que aprendeu.\n\n• Conceito 1 explicado em detalhes\n• Aplicação prática com exemplos\n• Erros comuns e como evitar\n• Checklist final do capítulo`,
};

export const testimonials = [
  {
    name: "Mariana Costa",
    role: "Mãe e empreendedora",
    text: "Comprei o ebook e em 2 semanas já tinha resultados visíveis. Mudou minha rotina!",
    rating: 5,
    avatar: "M",
  },
  {
    name: "Rafael Lima",
    role: "Estudante",
    text: "Conteúdo direto ao ponto, sem enrolação. Vale cada centavo. Recomendo demais!",
    rating: 5,
    avatar: "R",
  },
  {
    name: "Juliana Souza",
    role: "Designer",
    text: "Achei que seria mais um ebook genérico, mas me surpreendeu. Material excelente!",
    rating: 5,
    avatar: "J",
  },
];
