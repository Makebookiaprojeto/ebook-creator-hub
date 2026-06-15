import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type GroupResult = {
  name: string;
  url: string;
  description: string;
};

const cleanText = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const normalizeFacebookGroupUrl = (rawUrl: string) => {
  try {
    const decoded = decodeURIComponent(rawUrl);
    const parsed = new URL(decoded);
    const candidate = parsed.hostname.includes("google") && parsed.searchParams.get("url")
      ? new URL(parsed.searchParams.get("url") as string)
      : parsed;

    if (!candidate.hostname.includes("facebook.com")) return null;
    const match = candidate.pathname.match(/^\/groups\/([^/?#]+)/i);
    if (!match?.[1] || ["search", "discover", "feed"].includes(match[1].toLowerCase())) return null;

    return `https://www.facebook.com/groups/${match[1]}`;
  } catch {
    return null;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche } = await req.json();
    const query = typeof niche === "string" ? niche.trim() : "";

    if (!query || query.length > 80) {
      return new Response(JSON.stringify({ error: "Informe um nicho válido." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:facebook.com/groups "${query}"`)}&num=10&hl=pt-BR`;
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) throw new Error("Não foi possível consultar resultados públicos agora.");

    const html = await response.text();
    const groups = new Map<string, GroupResult>();
    const resultRegex = /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:<div[^>]*class="[^"]*(?:VwiC3b|IsZvec)[^"]*"[^>]*>([\s\S]*?)<\/div>)?/gi;
    let match: RegExpExecArray | null;

    while ((match = resultRegex.exec(html)) && groups.size < 8) {
      const url = normalizeFacebookGroupUrl(match[1]);
      if (!url || groups.has(url)) continue;

      const name = cleanText(match[2]).replace(/^Facebook\s*-\s*/i, "").slice(0, 90) || "Grupo do Facebook";
      const description = cleanText(match[3] || "Grupo público encontrado nos resultados do Google.").slice(0, 180);
      groups.set(url, { name, url, description });
    }

    return new Response(JSON.stringify({ groups: Array.from(groups.values()) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao buscar grupos." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});