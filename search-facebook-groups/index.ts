const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type FbGroup = { name: string; url: string; description: string };

const decodeEntities = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');

const stripTags = (s: string) => decodeEntities(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

const normalizeGroupUrl = (raw: string): string | null => {
  try {
    // DuckDuckGo wraps results in /l/?uddg=<encoded>
    let url = raw;
    if (url.startsWith('//')) url = 'https:' + url;
    if (url.includes('duckduckgo.com/l/')) {
      const u = new URL(url, 'https://duckduckgo.com');
      const real = u.searchParams.get('uddg');
      if (real) url = decodeURIComponent(real);
    }
    const u = new URL(url);
    if (!u.hostname.replace(/^www\./, '').endsWith('facebook.com')) return null;
    const m = u.pathname.match(/^\/groups\/([^/?#]+)/i);
    if (!m?.[1]) return null;
    const slug = m[1].toLowerCase();
    if (['search', 'discover', 'feed', 'browse', 'category'].includes(slug)) return null;
    return `https://www.facebook.com/groups/${m[1]}`;
  } catch {
    return null;
  }
};

async function searchDuckDuckGo(query: string): Promise<FbGroup[]> {
  const q = `site:facebook.com/groups ${query}`;
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`DuckDuckGo HTTP ${res.status}`);
  const html = await res.text();

  const groups = new Map<string, FbGroup>();
  const resultRegex = /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>|<div[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/div>)/gi;

  let m: RegExpExecArray | null;
  while ((m = resultRegex.exec(html)) && groups.size < 12) {
    const url = normalizeGroupUrl(m[1]);
    if (!url || groups.has(url)) continue;
    const name = stripTags(m[2]).replace(/\s*\|\s*Facebook.*$/i, '').slice(0, 100) || 'Grupo do Facebook';
    const description = stripTags(m[3] || m[4] || '').slice(0, 200);
    groups.set(url, { name, url, description });
  }
  return Array.from(groups.values());
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { query } = await req.json().catch(() => ({ query: '' }));
    const q = typeof query === 'string' ? query.trim() : '';
    if (!q || q.length < 2 || q.length > 100) {
      return new Response(JSON.stringify({ error: 'Informe um nicho válido (2-100 caracteres).' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const groups = await searchDuckDuckGo(q);
    return new Response(JSON.stringify({ groups }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('search-facebook-groups error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message ?? 'Erro inesperado' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
