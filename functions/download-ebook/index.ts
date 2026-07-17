import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response("Token não fornecido", { status: 400 });
    }

    // Buscar acesso pelo token
    const { data: access, error: accessError } = await supabase
      .from("download_access")
      .select("*, ebooks(pdf_url, title)")
      .eq("token", token)
      .single();

    if (accessError || !access) {
      console.warn(`Tentativa de download com token inválido: ${token}`);
      return new Response("Link de download inválido ou expirado", { status: 404 });
    }

    // Incrementar contador de downloads
    await supabase
      .from("download_access")
      .update({ download_count: (access.download_count || 0) + 1 })
      .eq("id", access.id);

    const pdfUrl = access.ebooks?.pdf_url;

    if (!pdfUrl) {
      return new Response("Arquivo não encontrado", { status: 404 });
    }

    console.info(`Download realizado: ${access.ebooks.title} por ${access.buyer_email}`);

    // Redirecionar para o arquivo real
    return Response.redirect(pdfUrl, 302);

  } catch (e) {
    console.error("download-ebook error:", e);
    return new Response("Erro interno", { status: 500 });
  }
});
