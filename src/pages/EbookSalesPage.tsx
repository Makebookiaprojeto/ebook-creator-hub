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
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white p-6 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground/30" />
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
    <div className="min-h-screen bg-white text-gray-900 selection:bg-primary selection:text-white font-sans">
      {/* SUCCESS MESSAGE AFTER PURCHASE */}
      {isPaid && (
        <div className="bg-green-50 py-8 px-4 border-b border-green-100">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-900">Pagamento Confirmado!</h2>
            <p className="text-gray-600">Seu acesso ao <strong>{ebook.title}</strong> foi liberado com sucesso.</p>
            {downloadUrl ? (
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold px-8" asChild>
                <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-5 w-5" /> BAIXAR EBOOK AGORA
                </a>
              </Button>
            ) : (
              <p className="text-sm italic text-gray-500">O link de download também foi enviado para seu e-mail.</p>
            )}
          </div>
        </div>
      )}

      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="container mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1 space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-100 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  Conteúdo Exclusivo e Digital
                </Badge>
                <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                  {ebook.title}
                </h1>
                {ebook.subtitle && (
                  <p className="text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                    {ebook.subtitle}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <div className="flex flex-col">
                  <span className="text-gray-400 line-through text-sm">{fromPrice}</span>
                  <span className="text-4xl font-black text-blue-600">{price}</span>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleCheckout} 
                  disabled={checkoutLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-16 px-10 text-lg rounded-2xl shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                >
                  {checkoutLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><MousePointer2 className="mr-2 h-5 w-5" /> QUERO COMEÇAR AGORA</>}
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 text-xs font-medium text-gray-400">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> COMPRA 100% SEGURA</span>
                <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-yellow-500" /> ACESSO IMEDIATO</span>
              </div>
            </div>

            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-blue-100/50 rounded-3xl blur-2xl group-hover:bg-blue-200/50 transition-colors" />
                <div className="relative aspect-[3/4] w-72 sm:w-80 lg:w-96 rounded-2xl shadow-2xl overflow-hidden bg-gray-100 ring-1 ring-gray-200 transition-transform hover:scale-[1.02] duration-500">
                  {ebook.cover_url ? (
                    <img 
                      src={ebook.cover_url} 
                      alt={ebook.title} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                      <BookOpen className="h-20 w-20 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — BENEFÍCIOS */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">Por que este material é para você?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Desenvolvido com foco absoluto em clareza e resultados práticos.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Target, t: "Resultados Reais", d: "Método testado e validado para você aplicar hoje mesmo." },
              { icon: Layout, t: "Conteúdo Organizado", d: "Estrutura lógica que facilita o aprendizado do início ao fim." },
              { icon: Zap, t: "Aplicação Prática", d: "Sem enrolação. Focado no que realmente traz transformação." },
              { icon: Award, t: "Qualidade Premium", d: "Material de alto nível, diagramado para uma leitura agradável." },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <item.icon className="h-6 w-6 text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.t}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — O QUE VOCÊ VAI APRENDER */}
      {chapters.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">O que você vai encontrar lá dentro</h2>
              <p className="text-gray-500">Um guia completo dividido em capítulos estratégicos.</p>
            </div>
            <div className="grid gap-4">
              {chapters.map((chapter, i) => (
                <div key={chapter.id} className="flex items-center gap-6 p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg font-black text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{chapter.title}</h3>
                    {chapter.content && (
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                        {chapter.content.replace(/[#*]/g, '').slice(0, 100)}...
                      </p>
                    )}
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4 — SOBRE O MATERIAL */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full" />
        <div className="container mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-10 bg-blue-600/20 blur-3xl rounded-full" />
                <div className="relative w-64 sm:w-72 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 rotate-[-2deg]">
                  {ebook.cover_url ? (
                    <img src={ebook.cover_url} alt={ebook.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-blue-600 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-3xl font-black sm:text-4xl">Especificações Técnicas</h2>
                <p className="text-gray-400">Tudo o que você precisa saber sobre o formato e entrega do conteúdo.</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  { icon: Download, t: "Acesso Imediato", d: "Download liberado após confirmação." },
                  { icon: Layout, t: "Formato PDF", d: "Leitura perfeita em qualquer tela." },
                  { icon: Rocket, t: "Multi-dispositivo", d: "Leia no PC, Tablet ou Celular." },
                  { icon: Lock, t: "Acesso Vitalício", d: "O conteúdo é seu para sempre." },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{item.t}</h4>
                      <p className="text-gray-400 text-sm">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — MOTIVOS PARA COMPRAR AGORA */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-3">
            {[
              { t: "Pagamento 100% Seguro", d: "Utilizamos as tecnologias mais avançadas de segurança para proteger seus dados.", icon: CreditCard },
              { t: "Satisfação Garantida", d: "Se por qualquer motivo você não gostar, tem 7 dias para solicitar reembolso.", icon: ShieldCheck },
              { t: "Suporte Dedicado", d: "Dúvidas sobre o material? Nossa equipe está pronta para te auxiliar.", icon: Users },
            ].map((item, idx) => (
              <div key={idx} className="text-center space-y-4 p-8 rounded-3xl border border-gray-100 hover:border-blue-100 transition-colors">
                <div className="mx-auto bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center">
                  <item.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{item.t}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — GARANTIA E SEGURANÇA */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="bg-white rounded-[3rem] p-10 sm:p-16 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="w-40 h-40 shrink-0 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-200">
              <ShieldCheck className="h-20 w-20 text-white" />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-gray-900">7 Dias de Garantia Incondicional</h2>
              <p className="text-gray-600 leading-relaxed">
                Você tem 7 dias inteiros para analisar o material. Se por qualquer motivo sentir que o conteúdo não é para você, basta solicitar o reembolso e devolveremos 100% do seu investimento. Sem perguntas, sem burocracia.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Badge variant="outline" className="border-gray-200 text-gray-500 py-1.5 px-4 rounded-full font-medium">Selo de Qualidade</Badge>
                <Badge variant="outline" className="border-gray-200 text-gray-500 py-1.5 px-4 rounded-full font-medium">Compra Protegida</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — CTA FINAL */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto max-w-4xl px-6 relative z-10 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">Tudo o que você precisa está a um clique de distância.</h2>
            <p className="text-xl text-gray-500">Aproveite o preço promocional antes que ele saia do ar.</p>
          </div>
          
          <div className="inline-flex flex-col items-center bg-blue-50/50 p-10 rounded-[3rem] border border-blue-100 space-y-8 w-full max-w-md">
            <div className="text-center">
              <span className="text-gray-400 line-through text-lg">{fromPrice}</span>
              <div className="text-6xl font-black text-blue-600">{price}</div>
              <p className="text-sm text-gray-500 mt-2">Pagamento único · Acesso imediato</p>
            </div>
            <Button 
              size="lg" 
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-20 w-full text-xl rounded-2xl shadow-2xl shadow-blue-200 transition-all hover:scale-[1.03]"
            >
              {checkoutLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <><Rocket className="mr-2 h-6 w-6" /> GARANTIR MEU ACESSO</>}
            </Button>
            <div className="flex items-center gap-4 text-xs font-bold text-gray-400 grayscale opacity-50">
              <span>MASTERCARD</span>
              <span>VISA</span>
              <span>PIX</span>
              <span>BOLETO</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-white border-t border-gray-100 text-center">
        <div className="container mx-auto px-6">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} EbookAI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

