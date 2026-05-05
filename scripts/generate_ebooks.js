
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

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
    return data.photos && data.photos.length > 0 ? data.photos[0].src.large : null;
  } catch (e) {
    console.error('Pexels error:', e);
    return null;
  }
}

const niches = [
  "Emagrecimento", "Renda extra", "Marketing digital", "Relacionamentos", "Desenvolvimento pessoal",
  "Finanças", "Saúde mental", "Fitness e musculação", "Receitas e culinária", "Maternidade",
  "Pets", "Espiritualidade", "Estudos e concursos", "Tecnologia e programação", "Beleza e autocuidado",
  "Empreendedorismo", "Idiomas", "Viagens"
];

async function updateEbooks() {
  for (const niche of niches) {
    console.log(`Processing ${niche}...`);
    
    // Find template
    const { data: template } = await supabase
      .from('ebooks')
      .select('id')
      .eq('niche', niche)
      .eq('is_template', true)
      .single();

    if (!template) continue;

    const chapters = [];
    const keywords = ["landscape", "portrait", "nature", "minimalist", "business", "city", "technology", "food", "people", "abstract", "success", "office", "travel", "book", "writing", "health", "lifestyle", "growth"];
    
    // Cover
    const coverUrl = await getPexelsImage(niche + " cover concept");

    // 6 Chapters
    for (let i = 1; i <= 6; i++) {
      const chapterTitle = `Capítulo ${i}: A base do ${niche}`;
      const chapterContent = `Conteúdo detalhado e de alta qualidade sobre ${niche} no capítulo ${i}. Este capítulo explora estratégias práticas para ${niche.toLowerCase()} e como implementar mudanças reais na sua vida.`;
      const imageUrl = await getPexelsImage(niche + " " + keywords[i % keywords.length]);
      chapters.push({ title: chapterTitle, content: chapterContent, image_url: imageUrl });
    }

    await supabase
      .from('ebooks')
      .update({
        cover_url: coverUrl,
        content_json: chapters
      })
      .eq('id', template.id);
      
    console.log(`Updated ${niche}`);
  }
}

updateEbooks().then(() => console.log('Done'));
