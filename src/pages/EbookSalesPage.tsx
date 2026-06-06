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
  CheckCircle2,
  Layout,
  Award,
  CreditCard,
  Target,
  Rocket,
  MousePointer2,
  ChevronRight,
  TrendingUp,
  CheckSquare
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
  const [isPaid, setIsPaid] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
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
    setCheckoutLoading(true);

    let checkoutUrl = (ebook as any).cakto_checkout_url || (ebook as any).checkout_url;
    
    if (checkoutUrl) {
      try {
        const url = new URL(checkoutUrl);
        url.searchParams.set("ebook_id", ebook.id);
        url.searchParams.set("seller_user_id", ebook.user_id);
        window.location.href = url.toString();
      } catch (e) {
        window.location.href = checkoutUrl;
      }
      return;
    }

    setCheckoutLoading(false);
    toast.error("Este eBook ainda não tem link de pagamento configurado.");
  };

  useEffect(() => {
    let active = true;
    (async () => {
      if (!slug) return;
      setLoading(true);
      
      if (slug === "preview") {
        const storedData = sessionStorage.getItem('ebook_preview_data');
        if (storedData) {
          try {
            const data = JSON.parse(storedData);
            setEbook({
              title: data.title,
              subtitle: data.subtitle,
              price_cents: data.price ? data.price * 100 : 0,
              id: 'preview',
              user_id: '',
              slug: 'preview',
              status: 'published'
            } as any);
            setChapters(data.chapters || []);
            setLoading(false);
            return;
          } catch (e) {
            console.error("Error parsing preview data", e);
          }
        }
      }

      const { data: ebookData, error: ebookErr } = await (supabase
        .from("public_ebooks" as any)
        .select("*")
        .eq("slug", slug)
        .maybeSingle() as any);

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
      
      if (chData && chData.length > 0) {
        setChapters(chData);
      } else if (ebookData.content_json && Array.isArray(ebookData.content_json)) {
        setChapters(ebookData.content_json.map((c: any, index: number) => ({
          ...c,
          order_index: c.order_index ?? index,
          id: c.id ?? `json-${index}`
        })));
      } else {
        setChapters([]);
      }

      setLoading(false);
      
      if (ebookData && slug !== "preview") {
        supabase
          .from("ebook_views")
          .insert({ ebook_id: ebookData.id })
          .then(({ error }) => {
            if (error) console.error("Error registering view:", error);
          });
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!ebook) return;
    document.title = `${ebook.title} — ACESSO IMEDIATO`;
  }, [ebook]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white p-6 text-center">
        <BookOpen className="h-12 w-12 text-blue-600/30" />
        <h1 className="text-2xl font-bold text-gray-900">eBook não encontrado</h1>
        <p className="text-gray-500">{error ?? "Verifique o link e tente novamente."}</p>
        <Link to="/">
          <Button variant="outline">Voltar à página inicial</Button>
        </Link>
      </div>
    );
  }

  const price = formatPrice(ebook.price_cents);
  const fromPrice = formatPrice(ebook.price_cents ? Math.round(ebook.price_cents * 2.5) : 0);

  return (
    <div className="min-h-screen bg-white text-[#111111] selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* SUCCESS MESSAGE */}
      {isPaid && (
        <div className="bg-green-50 py-12 px-6 border-b border-green-100">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
            <h2 className="text-4xl font-black">Pagamento Confirmado!</h2>
            <p className="text-xl text-gray-700">Seu acesso ao <strong>{ebook.title}</strong> foi liberado.</p>
            {downloadUrl ? (
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold h-16 px-10 text-lg rounded-full" asChild>
                <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-6 w-6" /> BAIXAR EBOOK AGORA
                </a>
              </Button>
            ) : (
              <p className="text-gray-500">O link de download foi enviado para seu e-mail.</p>
            )}
          </div>
        </div>
      )}

      {/* SECTION 1 — HERO PREMIUM */}
      <section className="relative pt-24 pb-32">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge className="bg-blue-100/50 text-[#1E3A5F] hover:bg-blue-100 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest border border-blue-200">
                Conteúdo Premium
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                {ebook.title}
              </h1>
              {ebook.subtitle && (
                <p className="text-xl lg:text-2xl text-[#234B75] leading-relaxed max-w-2xl font-medium">
                  {ebook.subtitle}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-6 items-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={handleCheckout} 
                  disabled={checkoutLoading}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold h-20 px-12 text-xl rounded-full shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                >
                  {checkoutLoading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : "COMPRAR AGORA"}
                </Button>
                <div className="text-center sm:text-left">
                  <p className="text-gray-400 line-through text-lg">{fromPrice}</p>
                  <p className="text-4xl font-black text-[#2563EB]">{price}</p>
                </div>
              </div>
              <div className="flex gap-8 text-[#1E3A5F] font-bold">
                <span className="flex items-center gap-2"><ShieldCheck className="h-6 w-6" /> Compra Segura</span>
                <span className="flex items-center gap-2"><Zap className="h-6 w-6" /> Acesso Imediato</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-10 bg-gradient-to-tr from-blue-500/10 to-transparent blur-3xl" />
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                {ebook.cover_url ? (
                  <img src={ebook.cover_url} alt={ebook.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-50">
                    <BookOpen className="h-24 w-24 text-gray-300" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — O QUE VOCÊ VAI APRENDER */}
      <section className="py-24">
        <div className="container mx-auto max-w-7xl px-6">
          <h2 className="text-4xl font-black mb-16 text-center">O que você vai aprender</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all">
                <CheckSquare className="h-10 w-10 text-[#2563EB] mb-6" />
                <h3 className="text-xl font-bold mb-3">Tópico de Aprendizado {i}</h3>
                <p className="text-[#315F91]">Descrição detalhada sobre o que será abordado neste tópico essencial do seu eBook.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — VISUALIZAÇÃO DO CONTEÚDO */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-black">Visualização do conteúdo</h2>
            <p className="text-xl text-[#315F91]">Entenda a profundidade do material com prévias visuais que demonstram a qualidade da diagramação.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="aspect-[3/4] bg-white rounded-2xl shadow-lg border border-gray-100" />
             <div className="aspect-[3/4] bg-white rounded-2xl shadow-lg border border-gray-100 mt-12" />
          </div>
        </div>
      </section>

      {/* SECTION 4 — BENEFÍCIOS */}
      <section className="py-24">
        <div className="container mx-auto max-w-7xl px-6">
          <h2 className="text-4xl font-black mb-16 text-center">Benefícios do material</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Star className="h-6 w-6 text-[#2563EB]" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Benefício {i}</h4>
                  <p className="text-[#315F91]">Uma descrição curta de como este benefício ajuda no seu resultado.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — POR QUE DIFERENTE */}
      <section className="py-24 bg-[#111111] text-white">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-4xl font-black mb-16 text-center">Por que este eBook é diferente?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1E1E1E] p-10 rounded-3xl">
              <h3 className="font-bold text-xl mb-6">Outros materiais</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-center gap-3">❌ Conteúdo superficial</li>
                <li className="flex items-center gap-3">❌ Informações desorganizadas</li>
                <li className="flex items-center gap-3">❌ Difícil aplicação</li>
              </ul>
            </div>
            <div className="bg-[#2563EB] p-10 rounded-3xl">
              <h3 className="font-bold text-xl mb-6">Este eBook</h3>
              <ul className="space-y-4 text-white font-medium">
                <li className="flex items-center gap-3">✅ Conteúdo estruturado</li>
                <li className="flex items-center gap-3">✅ Aplicação prática</li>
                <li className="flex items-center gap-3">✅ Fácil implementação</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — RESULTADOS E TRANSFORMAÇÃO */}
      <section className="py-24">
        <div className="container mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-4xl font-black mb-16">Resultados e Transformação</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="p-10 rounded-3xl border-2 border-dashed border-gray-200">
              <h3 className="text-2xl font-black mb-6">ANTES</h3>
              <p className="text-[#315F91]">Dificuldades, desorganização e falta de clareza nos processos.</p>
            </div>
            <div className="p-10 rounded-3xl bg-[#2563EB] text-white">
              <h3 className="text-2xl font-black mb-6">DEPOIS</h3>
              <p>Clareza total, processos otimizados e resultados mensuráveis rapidamente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — GARANTIA E SEGURANÇA */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto max-w-4xl px-6 text-center space-y-8">
          <ShieldCheck className="h-20 w-20 text-[#2563EB] mx-auto" />
          <h2 className="text-4xl font-black">7 Dias de Garantia</h2>
          <p className="text-xl text-[#315F91] max-w-2xl mx-auto">Se não ficar satisfeito, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.</p>
        </div>
      </section>

      {/* SECTION 8 & 9 — OFERTA E CTA FINAL */}
      <section className="py-32">
        <div className="container mx-auto max-w-4xl px-6 text-center space-y-12">
          <h2 className="text-5xl font-black tracking-tight">Pronto para começar?</h2>
          <div className="p-12 bg-white border-2 border-blue-100 rounded-[3rem] shadow-2xl">
            <p className="text-2xl font-bold mb-6">Tenha acesso a todo este conteúdo agora mesmo</p>
            <p className="text-6xl font-black text-[#2563EB] mb-10">{price}</p>
            <Button 
              size="lg" 
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold h-20 w-full max-w-lg text-xl rounded-full shadow-lg"
            >
              {checkoutLoading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : "GARANTIR MEU ACESSO"}
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t text-center text-gray-500">
        © {new Date().getFullYear()} Ebook Premium. Todos os direitos reservados.
      </footer>
    </div>
  );
}
