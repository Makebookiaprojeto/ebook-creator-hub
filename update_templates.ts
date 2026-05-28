
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
  
  if (!resp.ok) return null;
  const data = await resp.json();
  if (!data.photos || data.photos.length === 0) return null;
  
  const photo = data.photos[0];
  return photo.src.large2x || photo.src.original;
}

// These will be replaced by the sub-agent's output
const SEARCH_TERMS = {}; 

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
    
    // Get search terms for this niche (fallback to niche name if not found)
    const terms = SEARCH_TERMS[tpl.niche] || {
      cover_search_term: `professional ${tpl.niche} ebook cover`,
      chapters: tpl.chapters.map(c => `${c.title} ${tpl.niche}`)
    };

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
  }
}

// main();
