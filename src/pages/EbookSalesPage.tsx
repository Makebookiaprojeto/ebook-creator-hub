import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Download,
  Flame,
  
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
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

function useCountdown(targetMs: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, targetMs - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
    done: diff === 0,
  };
}

export default function EbookSalesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Countdown: 24h a partir do primeiro acesso (persistido por slug)
  const deadline = useMemo(() => {
    if (!slug) return Date.now() + 24 * 3600 * 1000;
    const key = `ebook_deadline_${slug}`;
    const stored = localStorage.getItem(key);
    if (stored) return Number(stored);
    const target = Date.now() + 24 * 3600 * 1000;
    localStorage.setItem(key, String(target));
    return target;
  }, [slug]);
  const countdown = useCountdown(deadline);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

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
          setIsPaid(true);
          toast.success("Pagamento confirmado! Obrigado pela compra 🎉");
          if (data?.pdf_url) {
            setDownloadUrl(data.pdf_url);
          }
        }
        setSearchParams({}, { replace: true });
      })();
    }
  }, [searchParams, setSearchParams]);

  const handleCheckout = async () => {
    if (!ebook) return;

    // 1) Link específico do eBook
    const specificUrl = (ebook as any).cakto_checkout_url;
    if (specificUrl) {
      window.location.href = specificUrl;
      return;
    }

    // 2) Fallback para o Link Global do perfil do autor
    setCheckoutLoading(true);
    try {
      const { data: globalCfg } = await supabase
        .from("user_payment_configs" as any)
        .select("checkout_url")
        .eq("user_id", ebook.user_id)
        .maybeSingle();

      if (globalCfg?.checkout_url) {
        window.location.href = globalCfg.checkout_url;
        return;
      }

      toast.error("Este eBook ainda não tem link de pagamento configurado.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao redirecionar para o checkout.");
    } finally {
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

  useEffect(() => {
    if (!ebook) return;
    document.title = `${ebook.title} — OFERTA POR TEMPO LIMITADO`;
    const desc =
      ebook.sales_pitch?.slice(0, 155) ??
      ebook.description?.slice(0, 155) ??
      `Adquira o eBook ${ebook.title} com desconto especial.`;
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
      { icon: Zap, t: "Resultado em dias", d: "Aplicação prática que destrava ganhos imediatos." },
      { icon: BookOpen, t: "Conteúdo direto ao ponto", d: "Sem enrolação. Só o que funciona de verdade." },
      { icon: Download, t: "Acesso imediato", d: "Receba o PDF na hora. Leia em qualquer dispositivo." },
      { icon: ShieldCheck, t: "Garantia de 7 dias", d: "Não gostou? Devolvemos 100% do seu dinheiro." },
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      { n: "Mariana S.", r: "Esse material mudou minha forma de pensar. Vale 10x o preço.", s: 5 },
      { n: "Ricardo P.", r: "Comprei meio na dúvida e me surpreendi. Conteúdo de altíssimo nível.", s: 5 },
      { n: "Juliana A.", r: "Rápido, prático e direto. Já estou aplicando e vendo resultado.", s: 5 },
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
  // Preço "de" simulado (2.5x o atual) para criar âncora de desconto
  const fromCents = ebook.price_cents ? Math.round(ebook.price_cents * 2.5) : 0;
  const fromPrice = formatPrice(fromCents);
  const discountPct = ebook.price_cents && fromCents
    ? Math.round((1 - ebook.price_cents / fromCents) * 100)
    : 60;
  const installments = ebook.price_cents ? (ebook.price_cents / 100 / 12) : 0;
  const installmentsLabel = installments
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(installments)
    : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative gradient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/30 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[600px] rounded-full bg-accent/20 blur-[140px]" />
      </div>

      {/* SUCCESS MESSAGE AFTER PURCHASE */}
      {isPaid && (
        <div className="bg-success text-success-foreground py-6 px-4 border-b">
          <div className="mx-auto max-w-4xl text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-white rounded-full p-3 shadow-glow">
                <Check className="h-8 w-8 text-success" />
              </div>
            </div>
            <h2 className="text-3xl font-bold font-display">Pagamento Confirmado!</h2>
            <p className="text-lg opacity-90">Obrigado por adquirir <strong>{ebook?.title}</strong>. Seu acesso está liberado.</p>
            <div className="flex justify-center gap-4">
              {downloadUrl ? (
                <Button size="lg" className="bg-white text-success hover:bg-gray-100 font-bold" asChild>
                  <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-5 w-5" /> BAIXAR EBOOK AGORA
                  </a>
                </Button>
              ) : (
                <div className="bg-white/20 p-4 rounded-xl text-sm italic">
                  O link de download será enviado para seu e-mail em instantes.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* URGENCY BAR */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-xs font-bold uppercase tracking-wider sm:text-sm">
          <Flame className="h-4 w-4 animate-pulse" />
          <span>Oferta relâmpago — {discountPct}% OFF acaba em</span>
          <span className="flex items-center gap-1 font-mono">
            <span className="rounded bg-black/30 px-1.5 py-0.5">{countdown.h}h</span>
            <span className="rounded bg-black/30 px-1.5 py-0.5">{countdown.m}m</span>
            <span className="rounded bg-black/30 px-1.5 py-0.5">{countdown.s}s</span>
          </span>
        </div>
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
            {checkoutLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <>QUERO AGORA <ArrowRight className="h-3.5 w-3.5" /></>}
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-red-500/15 text-red-400 border-red-500/30 rounded-full px-3 py-1 text-xs font-bold uppercase">
                🔥 Mais vendido
              </Badge>
              {ebook.category && (
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-wider">
                  {ebook.category}
                </Badge>
              )}
            </div>

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

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-bold">4.9/5</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-4 w-4" />
                <span><strong className="text-foreground">+2.847</strong> leitores satisfeitos</span>
              </div>
            </div>

            {/* PRICE BOX */}
            <div className="rounded-2xl border-2 border-primary/40 bg-card/80 p-5 backdrop-blur shadow-glow">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                <Flame className="h-3.5 w-3.5" />
                Promoção válida por 24h
              </div>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-base text-muted-foreground line-through">{fromPrice}</span>
                <span className="font-display text-4xl font-extrabold text-primary sm:text-5xl">{price}</span>
                <span className="mb-1.5 rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  -{discountPct}%
                </span>
              </div>
              {installmentsLabel && (
                <p className="mt-1 text-sm text-muted-foreground">
                  ou <strong className="text-foreground">12x de {installmentsLabel}</strong> no cartão
                </p>
              )}

              <Button
                size="lg"
                className="mt-4 w-full gradient-primary text-primary-foreground shadow-glow text-base font-bold h-14"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>QUERO GARANTIR MEU DESCONTO <ArrowRight className="h-5 w-5" /></>}
              </Button>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Pagamento 100% seguro</span>
                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> 7 dias de garantia</span>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Acesso imediato</span>
              </div>
            </div>
          </div>

          {/* Cover mockup */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-tr from-primary/40 via-accent/20 to-transparent blur-3xl" />
            <div className="absolute -top-2 -right-2 z-10 rotate-12 rounded-full bg-red-500 px-4 py-2 text-sm font-extrabold text-white shadow-xl ring-4 ring-red-500/30">
              -{discountPct}%
            </div>
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

      {/* SOCIAL PROOF STRIP */}
      <section className="border-y border-border/40 bg-card/40 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 text-sm">
          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> <strong>+2.847</strong> alunos</div>
          <div className="flex items-center gap-2"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> <strong>4.9/5</strong> avaliação média</div>
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> Garantia 7 dias</div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-orange-400" /> Acesso vitalício</div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">Por que comprar</Badge>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="mt-3 text-muted-foreground">
              Material denso, construído para gerar resultado real — não mais um PDF perdido.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border bg-card p-6 shadow-soft transition hover:shadow-glow hover:-translate-y-1"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 font-display text-base font-bold leading-snug">{b.t}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{b.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-border/40 bg-card/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <Badge className="mb-3 bg-amber-500/15 text-amber-400 border-amber-500/30">Depoimentos reais</Badge>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Quem leu, recomenda
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl border bg-card p-6 shadow-soft">
                <div className="flex">
                  {Array.from({ length: t.s }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">"{t.r}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                    {t.n[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.n}</p>
                    <p className="text-xs text-muted-foreground">Leitor verificado</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAPTERS */}
      {chapters.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="text-center">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">O que você vai aprender</Badge>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Sumário completo
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
                <Check className="h-5 w-5 shrink-0 text-green-500" />
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* GUARANTEE */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-3xl border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent p-8 sm:p-12">
          <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-glow">
              <ShieldCheck className="h-14 w-14 text-white" />
            </div>
            <div>
              <Badge className="bg-green-500/15 text-green-400 border-green-500/30">Garantia incondicional</Badge>
              <h3 className="mt-3 font-display text-2xl font-bold sm:text-3xl">7 dias de garantia. Risco zero.</h3>
              <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
                Leia, aplique e teste à vontade por 7 dias. Se por qualquer motivo você não gostar, basta enviar um e-mail e devolvemos <strong>100% do seu dinheiro</strong> — sem perguntas, sem burocracia.
              </p>
            </div>
          </div>
        </div>
      </section>

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
            { q: "Como recebo o eBook?", a: "Logo após a confirmação do pagamento, você recebe o link de download em PDF por e-mail e também direto na tela. Acessa de qualquer dispositivo." },
            { q: "Por quanto tempo tenho acesso?", a: "Acesso vitalício. O arquivo é seu para sempre — leia quando e onde quiser, sem mensalidades." },
            { q: "Posso pedir reembolso?", a: "Sim! Você tem 7 dias de garantia incondicional. Não gostou? Devolvemos 100% do seu dinheiro, sem perguntas." },
            { q: "Quais formas de pagamento são aceitas?", a: "Cartão de crédito (até 12x), PIX e boleto — pelo checkout 100% seguro." },
            { q: "A promoção volta depois?", a: "Não. Esse desconto é exclusivo desta janela. Quando o contador zerar, o preço volta ao normal." },
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
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/20 via-card to-accent/20 p-10 text-center shadow-glow sm:p-16">
          <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative">
            <Badge className="bg-red-500 text-white border-0 font-bold uppercase">
              <Flame className="mr-1 h-3 w-3" /> Última chamada
            </Badge>
            <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-5xl">
              Não deixe essa oferta passar
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Quando o contador zerar, o preço volta de <strong>{fromPrice}</strong>. Garanta agora e economize {discountPct}%.
            </p>

            {/* Countdown big */}
            <div className="mt-8 flex justify-center gap-3">
              {[
                { v: countdown.h, l: "Horas" },
                { v: countdown.m, l: "Min" },
                { v: countdown.s, l: "Seg" },
              ].map((c, i) => (
                <div key={i} className="rounded-xl border-2 border-primary/40 bg-background/60 px-4 py-3 backdrop-blur min-w-[72px]">
                  <div className="font-mono text-3xl font-extrabold text-primary sm:text-4xl">{c.v}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.l}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-1">
              <span className="text-base text-muted-foreground line-through">{fromPrice}</span>
              <span className="font-display text-5xl font-extrabold text-primary sm:text-6xl">{price}</span>
              {installmentsLabel && (
                <span className="text-sm text-muted-foreground">ou 12x de <strong className="text-foreground">{installmentsLabel}</strong></span>
              )}
            </div>

            <Button
              size="lg"
              className="mt-8 h-14 px-8 gradient-primary text-primary-foreground shadow-glow text-base font-bold"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <><Download className="h-5 w-5" /> COMPRAR COM {discountPct}% DE DESCONTO</>
              )}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              ✓ Garantia de 7 dias · ✓ Acesso imediato · ✓ Pagamento seguro
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
