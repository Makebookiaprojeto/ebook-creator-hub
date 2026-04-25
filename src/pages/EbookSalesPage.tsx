import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import {
  ArrowRight,
  BookOpen,
  Check,
  Download,
  Loader2,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Ebook = Tables<"ebooks">;
type Chapter = Tables<"chapters">;

function formatPrice(cents?: number | null) {
  if (!cents || cents <= 0) return "Grátis";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export default function EbookSalesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Handle return from Stripe
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const paid = searchParams.get("paid");
    const canceled = searchParams.get("canceled");
    if (canceled) {
      toast.error("Pagamento cancelado.");
      setSearchParams({}, { replace: true });
      return;
    }
    if (paid && sessionId) {
      (async () => {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { session_id: sessionId },
        });
        if (error || !data?.paid) {
          toast.error("Não foi possível confirmar o pagamento.");
        } else {
          toast.success("Pagamento confirmado! Obrigado pela compra 🎉");
        }
        setSearchParams({}, { replace: true });
      })();
    }
  }, [searchParams, setSearchParams]);

  const handleCheckout = async () => {
    if (!ebook) return;
    if (!ebook.price_cents || ebook.price_cents < 50) {
      toast.error("Este eBook não está disponível para compra.");
      return;
    }
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { ebook_id: ebook.id },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não recebida");
      }
    } catch (e: any) {
      toast.error(e?.message || "Erro ao iniciar checkout");
      setCheckoutLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      if (!slug) return;
      setLoading(true);
      const { data: ebookData, error: ebookErr } = await supabase
        .from("ebooks")
        .select("*")
        .eq("slug", slug)
        .eq("is_public", true)
        .maybeSingle();

      if (!active) return;
      if (ebookErr || !ebookData) {
        setError("Este eBook não está disponível.");
        setLoading(false);
        return;
      }

      const { data: chData } = await supabase
        .from("chapters")
        .select("*")
        .eq("ebook_id", ebookData.id)
        .order("order_index", { ascending: true });

      if (!active) return;
      setEbook(ebookData);
      setChapters(chData ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  // SEO
  useEffect(() => {
    if (!ebook) return;
    document.title = `${ebook.title} — eBook`;
    const desc =
      ebook.sales_pitch?.slice(0, 155) ??
      ebook.description?.slice(0, 155) ??
      `Adquira o eBook ${ebook.title}.`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);
  }, [ebook]);

  const benefits = useMemo(
    () => [
      "Conteúdo aprofundado e prático",
      "Acesso imediato após a compra",
      "Formato PDF para qualquer dispositivo",
      "Linguagem clara e direta ao ponto",
    ],
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground/50" />
        <h1 className="font-display text-2xl font-bold">eBook não encontrado</h1>
        <p className="text-muted-foreground">{error ?? "Verifique o link e tente novamente."}</p>
        <Link to="/">
          <Button variant="secondary">Voltar à página inicial</Button>
        </Link>
      </div>
    );
  }

  const price = formatPrice(ebook.price_cents);

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative gradient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/30 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[600px] rounded-full bg-accent/20 blur-[140px]" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-bold">EbookAI</span>
          </Link>
          <Button
            size="sm"
            className="gradient-primary text-primary-foreground"
            onClick={handleCheckout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <>Comprar agora <ArrowRight className="h-3.5 w-3.5" /></>}
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6 animate-fade-in">
            {ebook.category && (
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-wider">
                {ebook.category}
              </Badge>
            )}
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                {ebook.title}
              </span>
            </h1>
            {ebook.subtitle && (
              <p className="text-lg text-muted-foreground sm:text-xl">{ebook.subtitle}</p>
            )}
            {ebook.sales_pitch && (
              <p className="text-base text-foreground/80 leading-relaxed">{ebook.sales_pitch}</p>
            )}

            <div className="flex items-center gap-4 pt-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">Aprovado por leitores</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button
                size="lg"
                className="gradient-primary text-primary-foreground shadow-glow"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Quero meu exemplar <ArrowRight className="h-4 w-4" /></>}
              </Button>
              <div className="text-sm">
                <span className="font-display text-2xl font-bold">{price}</span>
                <span className="ml-2 text-muted-foreground">acesso imediato</span>
              </div>
            </div>
          </div>

          {/* Cover mockup */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-tr from-primary/40 via-accent/20 to-transparent blur-3xl" />
            <div className="relative aspect-[2/3] rotate-[-3deg] transform-gpu rounded-2xl shadow-2xl ring-1 ring-border/40 transition hover:rotate-0">
              {ebook.cover_url ? (
                <img
                  src={ebook.cover_url}
                  alt={`Capa do eBook ${ebook.title}`}
                  className="h-full w-full rounded-2xl object-cover"
                  loading="eager"
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                  <BookOpen className="h-20 w-20 text-primary-foreground/50" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-3 rounded-l-2xl bg-gradient-to-r from-black/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-y border-border/40 bg-card/30 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              O que você vai receber
            </h2>
            <p className="mt-3 text-muted-foreground">
              Um material denso, construído para gerar resultado real.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="rounded-2xl border bg-card p-5 shadow-soft transition hover:shadow-glow"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
                <p className="mt-4 text-sm font-medium leading-snug">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAPTERS */}
      {chapters.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Sumário do eBook
            </h2>
            <p className="mt-3 text-muted-foreground">
              {chapters.length} capítulos pensados para te levar do zero ao resultado.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {chapters.map((c, i) => (
              <li
                key={c.id}
                className="group flex items-start gap-4 rounded-2xl border bg-card p-5 transition hover:border-primary/40 hover:shadow-glow"
              >
                <span className="font-display text-2xl font-bold text-primary tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold leading-snug">{c.title}</h3>
                  {c.content && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {c.content.replace(/##\s+/g, "").slice(0, 220)}…
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* AUTHOR / DESCRIPTION */}
      {(ebook.description || ebook.author_name) && (
        <section className="border-t border-border/40 bg-card/30 py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            {ebook.author_name && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-primary-foreground shadow-glow">
                  {ebook.author_name[0]?.toUpperCase()}
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{ebook.author_name}</h3>
                <p className="text-sm text-muted-foreground">Autor</p>
              </>
            )}
            {ebook.description && (
              <p className="mt-6 text-lg leading-relaxed text-foreground/80">
                {ebook.description}
              </p>
            )}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
          Perguntas frequentes
        </h2>
        <div className="mt-10 space-y-4">
          {[
            {
              q: "Como recebo o eBook?",
              a: "Logo após a compra você recebe o link de download em PDF, podendo acessar de qualquer dispositivo.",
            },
            {
              q: "O acesso é vitalício?",
              a: "Sim, o arquivo fica seu para sempre — leia quando e onde quiser.",
            },
            {
              q: "Posso pedir reembolso?",
              a: "Sim, você tem 7 dias de garantia incondicional. Se não gostar, devolvemos seu dinheiro.",
            },
          ].map((f, i) => (
            <details
              key={i}
              className="group rounded-2xl border bg-card p-5 transition hover:border-primary/40"
            >
              <summary className="flex cursor-pointer items-center justify-between font-medium">
                {f.q}
                <ArrowRight className="h-4 w-4 transition group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="comprar" className="px-6 pb-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/20 via-card to-accent/20 p-10 text-center shadow-glow sm:p-16">
          <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative">
            <Badge className="gradient-primary text-primary-foreground">Oferta especial</Badge>
            <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-5xl">
              Pronto para mergulhar em <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {ebook.title}
              </span>
              ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Garanta agora seu acesso imediato. Pagamento único, sem mensalidade.
            </p>
            <div className="mt-8 flex flex-col items-center gap-2">
              <span className="font-display text-5xl font-extrabold">{price}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Pagamento seguro
              </span>
            </div>
            <Button
              size="lg"
              className="mt-8 gradient-primary text-primary-foreground shadow-glow"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><Download className="h-4 w-4" /> Comprar e baixar agora</>
              )}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Garantia de 7 dias · Acesso imediato
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} EbookAI Builder · Todos os direitos reservados
      </footer>
    </div>
  );
}
