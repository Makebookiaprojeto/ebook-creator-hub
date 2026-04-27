import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Download, Loader2, ShoppingBag } from "lucide-react";

type Purchase = {
  id: string;
  ebook_id: string | null;
  amount_paid_cents: number | null;
  status: string | null;
  created_at: string | null;
  ebook?: {
    title: string;
    cover_url: string | null;
    pdf_url: string | null;
    slug: string | null;
  } | null;
};

export default function MyPurchases() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    document.title = "Minhas compras — EbookAI";
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("ebook_sales")
        .select("id, ebook_id, amount_paid_cents, status, created_at, ebooks(title, cover_url, slug)")
        .eq("status", "paid")
        .order("created_at", { ascending: false });
      if (error) {
        console.error(error);
      }
      const rows = (data ?? []).map((r: any) => ({
        ...r,
        ebook: r.ebooks ? { ...r.ebooks, pdf_url: null as string | null } : null,
      }));

      // Busca pdf_url via RPC (só retorna pra compradores autorizados)
      await Promise.all(
        rows.map(async (r) => {
          if (!r.ebook_id || !r.ebook) return;
          const { data: pdf } = await supabase.rpc("get_public_ebook_pdf_url", {
            _ebook_id: r.ebook_id,
          });
          if (pdf) r.ebook.pdf_url = pdf as string;
        }),
      );

      setPurchases(rows);
      setLoading(false);
    })();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
        <h1 className="font-display text-2xl font-bold">Faça login para ver suas compras</h1>
        <p className="text-muted-foreground max-w-md">
          Use o mesmo e-mail que você usou no checkout para acessar seus eBooks.
        </p>
        <Link to="/auth">
          <Button className="gradient-primary text-primary-foreground">Entrar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <h1 className="font-display text-lg font-bold">Minhas compras</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {purchases.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card/40 p-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 font-display text-lg font-semibold">Você ainda não tem compras</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quando comprar um eBook usando este e-mail, ele aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {purchases.map((p) => (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/30 to-primary/70">
                  {p.ebook?.cover_url ? (
                    <img
                      src={p.ebook.cover_url}
                      alt={p.ebook.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="line-clamp-2 font-display font-bold leading-tight">
                    {p.ebook?.title ?? "eBook"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Comprado em {p.created_at ? new Date(p.created_at).toLocaleDateString("pt-BR") : "-"}
                  </p>
                  {p.ebook?.pdf_url ? (
                    <Button
                      asChild
                      size="sm"
                      className="mt-auto gradient-primary text-primary-foreground"
                    >
                      <a href={p.ebook.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5" /> Baixar PDF
                      </a>
                    </Button>
                  ) : (
                    <p className="mt-auto text-[11px] italic text-muted-foreground">
                      O autor ainda não disponibilizou o PDF.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
