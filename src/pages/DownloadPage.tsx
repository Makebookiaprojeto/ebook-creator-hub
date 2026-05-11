import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileWarning } from "lucide-react";

const DownloadPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ebook, setEbook] = useState<{ title: string; pdf_url: string } | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Token não fornecido");
        setLoading(false);
        return;
      }

      try {
        // Chamar a edge function para processar o download e obter a URL real
        const { data, error: funcError } = await supabase.functions.invoke("download-ebook", {
          method: "GET",
          headers: {
            // A function espera o token via query param
          },
          // Como invoke não aceita query params diretamente de forma fácil em todos os wrappers,
          // vamos ajustar a chamada ou garantir que a function trate o corpo se necessário.
          // Mas como já temos a function definida, vamos chamá-la via fetch direto se necessário,
          // ou ajustar a function para aceitar corpo POST também.
        });

        // Buscar informações básicas via consulta direta
        const { data: access, error: accessError } = await supabase
          .from("download_access" as any)
          .select("*, ebook:ebooks(title, pdf_url)")
          .eq("token", token)
          .single();

        if (accessError || !access) {
          throw new Error("Link de download inválido ou expirado");
        }

        const accessData = access as any;
        setEbook({
          title: accessData.ebook?.title || "E-book",
          pdf_url: accessData.ebook?.pdf_url || ""
        });
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleDownload = () => {
    if (token) {
      window.location.href = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-ebook?token=${token}`;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Validando seu acesso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <FileWarning className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Ops! Algo deu errado</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => navigate("/")}>Voltar para o início</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border text-center">
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Download className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Seu E-book está pronto!</h1>
        <p className="text-muted-foreground mb-8">
          Você já pode baixar <strong>{ebook?.title}</strong> clicando no botão abaixo.
        </p>
        <Button size="lg" className="w-full gap-2" onClick={handleDownload}>
          <Download className="w-5 h-5" />
          Baixar E-book (PDF)
        </Button>
        <p className="text-xs text-muted-foreground mt-6">
          Este link é pessoal e intransferível.
        </p>
      </div>
    </div>
  );
};

export default DownloadPage;
