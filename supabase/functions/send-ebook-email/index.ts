import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  customerEmail: string;
  ebookTitle: string;
  pdfUrl: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { customerEmail, ebookTitle, pdfUrl } = await req.json() as EmailRequest;

    if (!customerEmail || !pdfUrl) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Enviar e-mail usando a API do Resend diretamente
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      throw new Error("RESEND_API_KEY não configurado");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "EbookAI <onboarding@resend.dev>",
        to: [customerEmail],
        subject: `Seu eBook chegou: ${ebookTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #333;">Obrigado pela sua compra! 🎉</h1>
            <p style="font-size: 16px; color: #555;">Aqui está o link para você baixar seu eBook: <strong>${ebookTitle}</strong></p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${pdfUrl}" style="background-color: #007bff; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">BAIXAR MEU EBOOK</a>
            </div>
            <p style="font-size: 14px; color: #888;">Se o botão acima não funcionar, copie e cole este link no seu navegador:</p>
            <p style="font-size: 12px; color: #007bff; word-break: break-all;">${pdfUrl}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">Enviado por EbookAI</p>
          </div>
        `,
      }),
    });

    const resData = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(resData));


    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-ebook-email error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
