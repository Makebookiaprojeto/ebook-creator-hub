
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!PEXELS_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing env vars");
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function searchPexels(query, orientation = "landscape") {
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", orientation);
  
  const resp = await fetch(url.toString(), {
    headers: { Authorization: PEXELS_API_KEY }
  });
  
  if (!resp.ok) {
    const text = await resp.text();
    console.error(`Pexels API error for query "${query}": ${resp.status} - ${text}`);
    return null;
  }
  const data = await resp.json();
  if (!data.photos || data.photos.length === 0) {
    console.warn(`No photos found for query: ${query}`);
    return null;
  }
  
  const photo = data.photos[0];
  return photo.src.large2x || photo.src.original;
}

const SEARCH_TERMS = {
  "Beleza e autocuidado": {
    "cover_search_term": "aesthetic skincare products portrait luxury",
    "chapters": [
      "minimalist beauty routine morning bathroom",
      "natural skincare ingredients flatlay organic",
      "woman applying face mask spa aesthetic",
      "organic makeup products minimalist aesthetic",
      "glowing skin close up professional beauty",
      "peaceful self care atmosphere bedroom cozy"
    ]
  },
  "Desenvolvimento pessoal": {
    "cover_search_term": "minimalist notebook pen plant portrait professional",
    "chapters": [
      "morning routine meditation sunrise peaceful",
      "person writing in journal aesthetic minimalist",
      "mountain climber silhouette success motivation",
      "professional books stacked wooden table library",
      "person looking at sunset inspiration landscape",
      "bright workspace minimalist office productivity"
    ]
  },
  "Emagrecimento": {
    "cover_search_term": "healthy colorful salad bowl portrait professional",
    "chapters": [
      "fresh vegetables fruit market vibrant",
      "person preparing healthy meal kitchen aesthetic",
      "glass of water lemon lifestyle fresh",
      "workout gear flatlay aesthetic minimalist",
      "happy person measuring waist tape success",
      "outdoor jogging track park morning sun"
    ]
  },
  "Empreendedorismo": {
    "cover_search_term": "modern laptop minimalist desk portrait professional",
    "chapters": [
      "startup office brainstorming session creative",
      "entrepreneur working on laptop cafe lifestyle",
      "business strategy meeting whiteboard professional",
      "professional handshake close up partnership",
      "financial charts growth laptop screen",
      "modern city skyline sunset corporate"
    ]
  },
  "Espiritualidade": {
    "cover_search_term": "peaceful zen garden pebbles portrait aesthetic",
    "chapters": [
      "morning meditation forest sunlight serene",
      "incense burning smoke aesthetic peaceful",
      "crystals and candles spiritual setup aesthetic",
      "yoga pose outdoors nature tranquility",
      "star sky night landscape universe",
      "person hands open gratitude sunset"
    ]
  },
  "Estudos e concursos": {
    "cover_search_term": "organized study desk books portrait professional",
    "chapters": [
      "library bookshelf blurred background academic",
      "focused student writing notes aesthetic",
      "coffee cup books study session minimalist",
      "laptop screen online learning education",
      "highlighting text in book close up study",
      "successful student celebrating achievement happy"
    ]
  },
  "Finanças": {
    "cover_search_term": "professional leather wallet coins portrait luxury",
    "chapters": [
      "counting money bills flatlay professional",
      "piggy bank savings concept minimalist",
      "stock market charts screen finance",
      "calculator and documents desk professional",
      "luxury credit card aesthetic premium",
      "golden coins stacks growth financial"
    ]
  },
  "Fitness e musculação": {
    "cover_search_term": "muscular athlete training gym portrait professional",
    "chapters": [
      "gym equipment dumbbells floor aesthetic",
      "person lifting weights workout motivation",
      "protein shake bottle gym lifestyle",
      "intense training motivation sweat athlete",
      "running shoes on asphalt closeup",
      "fit body silhouette sunset fitness"
    ]
  },
  "Idiomas": {
    "cover_search_term": "vintage world map book portrait aesthetic",
    "chapters": [
      "flag of united kingdom aesthetic london",
      "person speaking into microphone podcast",
      "vocabulary cards notebook desk study",
      "london street aesthetic red bus travel",
      "learning online laptop headphones focus",
      "airplane window view travel clouds"
    ]
  },
  "Marketing digital": {
    "cover_search_term": "smartphone showing social media portrait professional",
    "chapters": [
      "modern office digital workspace creative",
      "content creator recording video studio",
      "data analytics dashboard screen professional",
      "social media icons flatlay aesthetic",
      "typing on laptop keyboard aesthetic",
      "networking event professional people talking"
    ]
  },
  "Maternidade": {
    "cover_search_term": "mother holding baby hand portrait soft",
    "chapters": [
      "newborn baby sleeping aesthetic cozy",
      "pregnant woman nature sunset beautiful",
      "baby toys wooden minimalist aesthetic",
      "mother breastfeeding baby cozy home",
      "family playing living room happiness",
      "child first steps floor parents"
    ]
  },
  "Pets": {
    "cover_search_term": "cute golden retriever puppy portrait professional",
    "chapters": [
      "cat playing with yarn ball aesthetic",
      "dog walking in park sunny lifestyle",
      "grooming pet brush cat dog care",
      "healthy pet food bowl minimalist",
      "person hugging dog love relationship",
      "sleeping cat cozy blanket aesthetic"
    ]
  },
  "Receitas e culinária": {
    "cover_search_term": "professional chef plating food portrait gourmet",
    "chapters": [
      "fresh herbs spices chopping board aesthetic",
      "ingredients for baking flour eggs minimalist",
      "pan on stove cooking steam kitchen",
      "dinner party table setting aesthetic",
      "dessert cake gourmet aesthetic luxury",
      "rustic kitchen interior design minimalist"
    ]
  },
  "Relacionamentos": {
    "cover_search_term": "couple holding hands walking portrait romantic",
    "chapters": [
      "romantic dinner date night aesthetic",
      "couple talking on couch cozy home",
      "wedding rings aesthetic close up",
      "friends laughing outdoor cafe lifestyle",
      "elderly couple walking park love",
      "hearts and flowers gift aesthetic"
    ]
  },
  "Renda extra": {
    "cover_search_term": "person working from home laptop portrait professional",
    "chapters": [
      "side hustle craft materials creative",
      "delivery person package bike city",
      "selling online products camera setup",
      "passive income coins growth concept",
      "freelancer desk minimalist setup office",
      "piggy bank with money bills savings"
    ]
  },
  "Saúde mental": {
    "cover_search_term": "peaceful lake reflection nature portrait serene",
    "chapters": [
      "person breathing deeply beach sunset",
      "therapy session two chairs professional",
      "brain health concept minimalist aesthetic",
      "relaxing bath self care aesthetic",
      "walking in nature forest tranquility",
      "positive affirmations journal aesthetic"
    ]
  },
  "Tecnologia e programação": {
    "cover_search_term": "glowing code on computer screen portrait tech",
    "chapters": [
      "mechanical keyboard rgb lighting aesthetic",
      "developer working dual monitors professional",
      "motherboard circuit board tech close up",
      "artificial intelligence robot hand technology",
      "server room data center professional",
      "cyber security lock digital concept"
    ]
  },
  "Viagens": {
    "cover_search_term": "backpacker looking at mountains portrait adventure",
    "chapters": [
      "airplane wing above clouds sunset",
      "passport and tickets flatlay aesthetic",
      "exotic tropical beach turquoise water",
      "historical city street europe aesthetic",
      "luxury hotel room view beach",
      "camping fire forest night adventure"
    ]
  }
}; 

async function main() {
  const { data: templates, error } = await supabase
    .from('ebook_templates')
    .select('id, niche, title, chapters');
    
  if (error) {
    console.error("Error fetching templates:", error);
    return;
  }

  for (const tpl of templates) {
    console.log(`Processing niche: ${tpl.niche}...`);
    
    const terms = SEARCH_TERMS[tpl.niche];
    if (!terms) {
       console.warn(`  No search terms found for niche: ${tpl.niche}`);
       continue;
    }

    const coverUrl = await searchPexels(terms.cover_search_term, "portrait");
    
    const updatedChapters = [];
    for (let i = 0; i < tpl.chapters.length; i++) {
      const chapter = tpl.chapters[i];
      const searchTerm = terms.chapters[i] || `${chapter.title} ${tpl.niche}`;
      console.log(`  Searching for chapter ${i+1}: ${searchTerm}`);
      const imageUrl = await searchPexels(searchTerm, "landscape");
      updatedChapters.push({
        ...chapter,
        image_url: imageUrl
      });
    }

    const { error: updateError } = await supabase
      .from('ebook_templates')
      .update({
        cover_url: coverUrl,
        chapters: updatedChapters
      })
      .eq('id', tpl.id);

    if (updateError) {
      console.error(`  Error updating ${tpl.niche}:`, updateError);
    } else {
      console.log(`  Successfully updated ${tpl.niche}`);
    }
    
    // Sleep a bit to avoid rate limits
    await new Promise(r => setTimeout(r, 200));
  }
}

main();
