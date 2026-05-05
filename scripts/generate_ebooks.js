
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
    return 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  }
}

const chapterTopics = [
  "Introdução e Mentalidade: O ponto de partida para o sucesso.",
  "Fundamentos Essenciais: O que você precisa saber antes de começar.",
  "Estratégias Avançadas: Técnicas que os profissionais não contam.",
  "Estudos de Caso: Exemplos reais de quem chegou lá.",
  "Erros Comuns: O que evitar para não perder tempo e dinheiro.",
  "Conclusão e Próximos Passos: Seu plano de ação para os próximos 30 dias."
];

async function updateEbooks() {
  const { data: templates } = await supabase
    .from('ebooks')
    .select('*')
    .eq('is_template', true);

  if (!templates) return;

  for (const template of templates) {
    const niche = template.niche || "Geral";
    console.log(`Processing template ${template.id} for niche: ${niche}...`);
    
    const chapters = [];
    const coverUrl = await getPexelsImage(niche + " cover");

    for (let i = 0; i < 6; i++) {
      const title = chapterTopics[i].split(':')[0];
      const subtitle = chapterTopics[i].split(':')[1].trim();
      const content = `Este capítulo de alta qualidade explora "${subtitle}" no contexto de ${niche}. \n\nAqui, fornecemos insights profundos e estratégias práticas que foram validadas pelo mercado. O objetivo é permitir que você implemente estas mudanças imediatamente para ver resultados reais. \n\nAbaixo, os pontos principais cobertos:\n\n• Análise técnica e prática do tema.\n• Checklist de implementação imediata.\n• Dicas de especialistas no nicho de ${niche}.\n• Como evitar os obstáculos mais comuns nesta etapa.`;
      
      const imageUrl = await getPexelsImage(niche + " " + (i % 2 === 0 ? "minimalist" : "professional"));
      
      chapters.push({
        title: title,
        content: content,
        image_url: imageUrl
      });
    }

    await supabase
      .from('ebooks')
      .update({
        cover_url: coverUrl,
        content_json: chapters,
        updated_at: new Date()
      })
      .eq('id', template.id);
      
    console.log(`Updated ${niche} (ID: ${template.id})`);
  }
}

updateEbooks().then(() => console.log('All templates updated!'));
