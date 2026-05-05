
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const pexelsKey = process.env.PEXELS_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getPexelsImage(query) {
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: { 'Authorization': pexelsKey }
    });
    const data = await response.json();
    return data.photos && data.photos.length > 0 ? data.photos[0].src.large : 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  } catch (e) {
    console.error('Pexels error:', e);
    return 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  }
}

const niches = [
  { name: "Emagrecimento", theme: "saúde, dieta, perda de peso, foco" },
  { name: "Renda extra", theme: "dinheiro, negócios, finanças, liberdade" },
  { name: "Marketing digital", theme: "estratégia, vendas, internet, tráfego" },
  { name: "Relacionamentos", theme: "amor, casal, conversa, psicologia" },
  { name: "Desenvolvimento pessoal", theme: "mente, sucesso, hábito, evolução" },
  { name: "Finanças", theme: "investimento, economia, banco, planejamento" },
  { name: "Saúde mental", theme: "calma, meditação, mente, paz" },
  { name: "Fitness e musculação", theme: "treino, academia, força, resultado" },
  { name: "Receitas e culinária", theme: "cozinha, sabor, tempero, gourmet" },
  { name: "Maternidade", theme: "bebê, carinho, família, cuidado" },
  { name: "Pets", theme: "cachorro, gato, animal, cuidado" },
  { name: "Espiritualidade", theme: "energia, fé, universo, conexão" },
  { name: "Estudos e concursos", theme: "livros, prova, aprovação, foco" },
  { name: "Tecnologia e programação", theme: "código, futuro, computador, ia" },
  { name: "Beleza e autocuidado", theme: "skincare, maquiagem, espelho, brilho" },
  { name: "Empreendedorismo", theme: "empresa, liderança, startup, ideia" },
  { name: "Idiomas", theme: "mundo, bandeira, conversa, dicionário" },
  { name: "Viagens", theme: "mala, avião, mapa, descoberta" }
];

const chapterTopics = [
  "Introdução e Mentalidade: O ponto de partida para o sucesso.",
  "Fundamentos Essenciais: O que você precisa saber antes de começar.",
  "Estratégias Avançadas: Técnicas que os profissionais não contam.",
  "Estudos de Caso: Exemplos reais de quem chegou lá.",
  "Erros Comuns: O que evitar para não perder tempo e dinheiro.",
  "Conclusão e Próximos Passos: Seu plano de ação para os próximos 30 dias."
];

async function updateEbooks() {
  for (const niche of niches) {
    console.log(`Processing ${niche.name}...`);
    
    const { data: template } = await supabase
      .from('ebooks')
      .select('id, title, subtitle')
      .eq('niche', niche.name)
      .eq('is_template', true)
      .maybeSingle();

    if (!template) {
      console.log(`No template for ${niche.name}`);
      continue;
    }

    const chapters = [];
    const coverUrl = await getPexelsImage(niche.name + " " + niche.theme.split(',')[0]);

    for (let i = 0; i < 6; i++) {
      const title = chapterTopics[i].split(':')[0];
      const subtitle = chapterTopics[i].split(':')[1].trim();
      const content = `Neste capítulo sobre ${niche.name}, mergulharemos fundo no tema "${subtitle}". Você aprenderá como aplicar estratégias de ${niche.theme} para transformar seus resultados. \n\nA importância de dominar este pilar é fundamental para quem busca excelência. Ao longo destas páginas, detalhamos o passo a passo necessário para que você não apenas entenda a teoria, mas saiba exatamente como agir na prática. \n\nEstratégias-chave abordadas: \n1. Análise detalhada do cenário atual.\n2. Implementação de ferramentas específicas de ${niche.name}.\n3. Métricas para acompanhar sua evolução constante.`;
      
      const imageUrl = await getPexelsImage(niche.name + " " + (niche.theme.split(',')[i % niche.theme.split(',').length].trim()));
      
      chapters.push({
        title: title,
        content: content,
        image_url: imageUrl
      });
    }

    const { error } = await supabase
      .from('ebooks')
      .update({
        cover_url: coverUrl,
        content_json: chapters,
        updated_at: new Date()
      })
      .eq('id', template.id);

    if (error) console.error(`Error updating ${niche.name}:`, error);
    else console.log(`Successfully updated ${niche.name}`);
  }
}

updateEbooks().then(() => console.log('All templates updated!'));
