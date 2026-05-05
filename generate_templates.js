const niches = [
  { name: "Emagrecimento", title: "Guia Definitivo do Emagrecimento Saudável", subtitle: "Perca peso com saúde e mantenha os resultados para sempre", keywords: "health, weight loss, healthy food" },
  { name: "Renda extra", title: "Domine a Renda Extra em 2024", subtitle: "Estratégias comprovadas para faturar sem sair de casa", keywords: "money, cash, home office" },
  { name: "Marketing digital", title: "Marketing Digital de Elite", subtitle: "O passo a passo para vender todos os dias na internet", keywords: "marketing, digital, growth" },
  { name: "Relacionamentos", title: "Segredos dos Relacionamentos Saudáveis", subtitle: "Como construir conexões profundas e duradouras", keywords: "couple, love, relationship" },
  { name: "Desenvolvimento pessoal", title: "O Despertar do Potencial Máximo", subtitle: "Transforme sua mentalidade e alcance o sucesso", keywords: "mindset, growth, success" },
  { name: "Finanças", title: "Liberdade Financeira Passo a Passo", subtitle: "Aprenda a investir e organize sua vida financeira", keywords: "finance, investment, saving" },
  { name: "Saúde mental", title: "Paz Interior e Equilíbrio Emocional", subtitle: "Vença a ansiedade e viva com mais leveza", keywords: "meditation, mental health, calm" },
  { name: "Fitness e musculação", title: "Corpo Blindado: O Guia do Treino", subtitle: "Maximize seus ganhos com técnicas profissionais", keywords: "fitness, gym, muscle" },
  { name: "Receitas e culinária", title: "Culinária Criativa e Saudável", subtitle: "Pratos deliciosos que cabem na sua rotina", keywords: "cooking, food, healthy" },
  { name: "Maternidade", title: "Maternidade com Leveza", subtitle: "O guia prático para os desafios do dia a dia", keywords: "motherhood, baby, family" },
  { name: "Pets", title: "Manual do Pet Feliz", subtitle: "Adestramento, saúde e bem-estar para seu melhor amigo", keywords: "dog, cat, pet" },
  { name: "Espiritualidade", title: "Jornada Espiritual e Propósito", subtitle: "Conecte-se com sua essência e encontre paz", keywords: "spiritual, soul, light" },
  { name: "Estudos e concursos", title: "A Arte da Aprovação", subtitle: "Métodos de estudo de alto rendimento para concursos", keywords: "study, books, education" },
  { name: "Tecnologia e programação", title: "Código de Sucesso: Iniciando na Programação", subtitle: "Do zero ao primeiro projeto no mundo da tecnologia", keywords: "code, computer, technology" },
  { name: "Beleza e autocuidado", title: "Beleza Real e Skincare", subtitle: "Rotinas práticas para realçar sua melhor versão", keywords: "beauty, skincare, care" },
  { name: "Empreendedorismo", title: "Mente Empreendedora", subtitle: "Como criar e escalar negócios lucrativos hoje", keywords: "business, startup, leadership" },
  { name: "Idiomas", title: "Fluência sem Fronteiras", subtitle: "O método prático para aprender qualquer idioma rápido", keywords: "language, world, travel" },
  { name: "Viagens", title: "O Viajante Inteligente", subtitle: "Como viajar mais gastando muito menos", keywords: "travel, plane, beach" }
];

const chapterTitles = [
  "Introdução e Fundamentos",
  "O Primeiro Passo Prático",
  "Estratégias Avançadas",
  "Superando Obstáculos",
  "Consolidando Resultados",
  "O Próximo Nível"
];

function generateContent(niche, chapterNum) {
  return `Neste capítulo focado em ${niche}, exploramos ${chapterTitles[chapterNum-1].toLowerCase()}. O segredo para o sucesso nesta área reside na consistência e na aplicação correta das técnicas abordadas aqui. Através de exemplos práticos e uma metodologia passo a passo, você aprenderá a dominar este aspecto fundamental do seu ebook.`;
}

let sql = "";

niches.forEach(n => {
  const content_json = [];
  for (let i = 1; i <= 6; i++) {
    content_json.push({
      title: chapterTitles[i - 1],
      content: generateContent(n.name, i),
      image_url: `https://images.unsplash.com/photo-${1500000000000 + (Math.floor(Math.random() * 1000000000))}?q=80&w=800&auto=format&fit=crop&sig=${n.name.replace(/ /g, '_')}_${i}`
    });
  }
  
  sql += `UPDATE ebooks SET 
    title = '${n.title.replace(/'/g, "''")}', 
    subtitle = '${n.subtitle.replace(/'/g, "''")}', 
    content_json = '${JSON.stringify(content_json).replace(/'/g, "''")}',
    status = 'published',
    is_public = true
    WHERE niche = '${n.name}' AND is_template = true;\n`;
});

console.log(sql);
