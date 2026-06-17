import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import {
  Rocket,
  ShieldCheck,
  Lock as LockIcon,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Award,
  Sparkles,
  Zap,
  Target,
  MousePointer2,
  Clock,
  Layout,
  Star,
  Flame,
  Check,
  ArrowRight,
  BookOpen,
  Search,
  Users,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

type Ebook = Tables<"ebooks">;
type Chapter = Tables<"chapters">;

function formatPrice(cents?: number | null) {
  if (!cents || cents <= 0) return "Grátis";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

// Convert "#RRGGBB" to "H S% L%" triplet for Tailwind/shadcn hsl(var(--token)) tokens.
function hexToHslTriplet(hex: string): string | null {
  if (!hex) return null;
  const cleaned = hex.replace("#", "").trim();
  if (cleaned.length !== 6) return null;
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hexLuminance(hex: string): number {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return 0;
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function buildSalesPageStyle(
  primaryHex?: string | null,
  secondaryHex?: string | null
): React.CSSProperties | undefined {
  if (!primaryHex && !secondaryHex) return undefined;
  const style: Record<string, string> = {};
  if (secondaryHex) {
    const bg = hexToHslTriplet(secondaryHex);
    if (bg) {
      const isLight = hexLuminance(secondaryHex) > 0.55;
      const fg = isLight ? "0 0% 7%" : "0 0% 100%";
      const muted = isLight ? "0 0% 30%" : "0 0% 80%";
      const card = isLight ? "0 0% 96%" : "0 0% 7%";
      const border = isLight ? "0 0% 85%" : "0 0% 18%";
      const secondaryTok = isLight ? "0 0% 92%" : "0 0% 12%";
      style["--background"] = bg;
      style["--foreground"] = fg;
      style["--card"] = card;
      style["--card-foreground"] = fg;
      style["--popover"] = card;
      style["--popover-foreground"] = fg;
      style["--muted"] = secondaryTok;
      style["--muted-foreground"] = muted;
      style["--secondary"] = secondaryTok;
      style["--secondary-foreground"] = fg;
      style["--border"] = border;
      style["--input"] = border;
    }
  }
  if (primaryHex) {
    const pr = hexToHslTriplet(primaryHex);
    if (pr) {
      const prFg = hexLuminance(primaryHex) > 0.55 ? "0 0% 7%" : "0 0% 100%";
      style["--primary"] = pr;
      style["--primary-foreground"] = prFg;
      style["--primary-glow"] = pr;
      style["--ring"] = pr;
      style["--accent"] = pr;
      style["--accent-foreground"] = prFg;
    }
  }
  return style as React.CSSProperties;
}

export default function EbookSalesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [ebook, setEbook] = useState<any | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [searchTopic, setSearchTopic] = useState("");

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
    toast.error("Link de pagamento não configurado.");
  };

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data: ebookData, error } = await supabase.from("ebooks").select("*").eq("slug", slug).maybeSingle();
      if (error) {
        console.error("Error fetching ebook:", error);
      }
      if (!ebookData) { setLoading(false); return; }
      const { data: chData } = await supabase.from("chapters").select("*").eq("ebook_id", ebookData.id).order("order_index", { ascending: true });
      setEbook(ebookData);
      setChapters(chData || []);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!ebook) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">eBook não encontrado.</div>;

  const price = formatPrice(ebook.price_cents);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary selection:text-background">
      {/* 1. HERO PREMIUM */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1 space-y-10 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-[0.2em] border border-primary/20">
                <Sparkles size={14} /> Lançamento 2026
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] text-foreground">
                {ebook.title}
              </h1>
              <p className="text-2xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                {ebook.subtitle || "Aprenda de forma prática e rápida com este guia definitivo desenvolvido por especialistas."}
              </p>
              <div className="flex flex-wrap items-center gap-8 pt-4">
                <Button 
                  size="lg" 
                  onClick={handleCheckout} 
                  disabled={checkoutLoading}
                  className="h-20 px-12 text-xl font-black bg-primary hover:bg-primary/90 text-background rounded-full shadow-[0_20px_40px_-10px_rgba(0,255,102,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border-none"
                >
                  {checkoutLoading ? <Loader2 className="animate-spin" /> : <>OBTER ACESSO AGORA <ArrowRight /></>}
                </Button>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-70">Oferta Exclusiva</p>
                  <p className="text-4xl font-black text-foreground">{price}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 pt-4 text-muted-foreground font-bold text-sm">
                <span className="flex items-center gap-2 uppercase tracking-tighter"><ShieldCheck size={18} className="text-primary"/> Compra 100% Segura</span>
                <span className="flex items-center gap-2 uppercase tracking-tighter"><Zap size={18} className="text-primary"/> Acesso Vitalício</span>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="flex-1 w-full max-w-[500px] relative z-10">
              <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-[3rem] -z-10" />
              <div className="relative group perspective-1000">
                <div className="relative transform-gpu transition-all duration-700 lg:hover:rotate-y-12 lg:hover:rotate-x-6 hover:-translate-y-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] rounded-[2.5rem] overflow-hidden aspect-[3/4.2] border border-border">
                  <img src={ebook.cover_url || ""} alt={ebook.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/5" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. APRESENTAÇÃO */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-black leading-tight">Um produto desenhado para encantar.</h2>
            <p className="text-xl text-muted-foreground leading-relaxed font-medium mx-auto max-w-2xl">Cada página foi estruturada para garantir a melhor experiência de aprendizado, com visual moderno e conteúdo de fácil absorção.</p>
            <div className="flex flex-wrap justify-center gap-8 pt-4">
              {["Design Ultra-Moderno", "Diagramação Profissional", "Visualização em Qualquer Dispositivo"].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-lg font-bold">
                   <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0"><Check size={14} className="text-background" /></div>
                   {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. BENEFÍCIOS (8-12 CARDS) */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-5xl font-black tracking-tight">Vantagens Exclusivas</h2>
            <p className="text-xl text-muted-foreground font-medium">O que você ganha ao garantir este guia profissional hoje.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Rocket, title: "Aceleração Real", desc: "Resultados que aparecem já nas primeiras semanas de aplicação." },
              { icon: Target, title: "Foco no Resultado", desc: "Direto ao ponto, sem enrolação. Conteúdo 100% prático." },
              { icon: TrendingUp, title: "Escalabilidade", desc: "Aprenda métodos que podem ser replicados em larga escala." },
              { icon: Award, title: "Certificado de Valor", desc: "Conhecimento que se traduz em autoridade no mercado." },
              { icon: MousePointer2, title: "Implementação", desc: "Passo a passo visual para você não se perder no caminho." },
              { icon: Clock, title: "Economia de Tempo", desc: "Meses de estudo resumidos em poucas horas de leitura." },
              { icon: Layout, title: "Estrutura Sólida", desc: "Uma base robusta para você construir seu futuro profissional." },
              { icon: Star, title: "Suporte VIP", desc: "Acesso a atualizações e materiais complementares exclusivos." }
            ].map((benefit, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10 }} 
                className="p-8 bg-card rounded-3xl border border-border/50 shadow-[0_10px_30px_-15px_rgba(0,255,102,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(0,255,102,0.2)] transition-all"
              >
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. O QUE VOCÊ VAI APRENDER */}
      <section className="py-32 bg-card/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-5xl font-black text-center mb-20 tracking-tight">O que você vai aprender</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(() => {
              const content = ebook?.content_json as any;
              const learningTopics = content?.learning_topics || [];
              const chaptersList = Array.isArray(content) ? content : (content?.chapters || []);
              
              if (learningTopics.length > 0) {
                return learningTopics.map((topic: any, i: number) => (
                  <div key={i} className="group p-8 bg-card rounded-[2rem] border border-border shadow-sm hover:border-primary/20 transition-all">
                    <div className="flex items-start justify-between mb-8">
                       <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center font-black text-muted-foreground opacity-40 group-hover:bg-primary group-hover:text-background transition-colors">
                         {String(i + 1).padStart(2, '0')}
                       </div>
                       <div className="px-3 py-1 bg-secondary rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aprendizado</div>
                    </div>
                    <h3 className="text-xl font-black mb-4 group-hover:text-primary transition-colors">{topic.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{topic.description}</p>
                  </div>
                ));
              }

              // Fallback to chapters from content_json or DB if no explicit learning topics
              const displayChapters = chaptersList.length > 0 ? chaptersList : chapters;
              if (displayChapters.length > 0) {
                return displayChapters.map((chapter: any, i: number) => (
                  <div key={chapter.id || i} className="group p-8 bg-card rounded-[2rem] border border-border shadow-sm hover:border-primary/20 transition-all">
                    <div className="flex items-start justify-between mb-8">
                       <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center font-black text-muted-foreground opacity-40 group-hover:bg-primary group-hover:text-background transition-colors">
                         {String(i + 1).padStart(2, '0')}
                       </div>
                       <div className="px-3 py-1 bg-secondary rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">Capítulo</div>
                    </div>
                    <h3 className="text-xl font-black mb-4 group-hover:text-primary transition-colors">{chapter.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">Conteúdo detalhado sobre este tópico essencial para sua evolução.</p>
                  </div>
                ));
              }

              // Fallback to placeholders
              return [...Array(6)].map((_, i) => (
                <div key={i} className="p-8 bg-card rounded-[2rem] border border-border shadow-sm">
                  <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center font-black text-muted-foreground opacity-40 mb-8">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-black mb-4">Tópico de Aprendizado {i + 1}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">Estrutura completa e detalhada sobre os fundamentos deste ebook.</p>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* 7. TRANSFORMAÇÃO */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4">A Sua Transformação</h2>
            <p className="text-xl text-muted-foreground font-medium">O caminho exato que você vai percorrer.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-border rounded-[3rem] overflow-hidden shadow-2xl border border-border">
             <div className="bg-card p-16 space-y-8">
                <div className="inline-block px-4 py-1 bg-destructive/10 text-destructive font-black text-[10px] uppercase tracking-[0.2em] rounded-full">Situação Atual</div>
                <h3 className="text-3xl font-black text-muted-foreground opacity-40 italic">Antes do eBook</h3>
                <ul className="space-y-6">
                   {["Insegurança nos processos", "Perda de tempo e energia", "Resultados estagnados", "Falta de metodologia"].map((item, i) => (
                     <li key={i} className="flex items-center gap-4 text-muted-foreground font-medium">
                        <div className="h-5 w-5 bg-secondary rounded-full flex items-center justify-center text-[10px]">✕</div> {item}
                     </li>
                   ))}
                </ul>
             </div>
             <div className="bg-primary/5 p-16 space-y-8">
                <div className="inline-block px-4 py-1 bg-primary/20 text-primary font-black text-[10px] uppercase tracking-[0.2em] rounded-full">Nova Realidade</div>
                <h3 className="text-3xl font-black text-foreground">Depois do eBook</h3>
                <ul className="space-y-6">
                   {["Domínio total das ferramentas", "Alta performance constante", "Crescimento acelerado", "Estratégia comprovada"].map((item, i) => (
                     <li key={i} className="flex items-center gap-4 text-foreground font-medium">
                        <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center"><Check size={10} className="text-background"/></div> {item}
                     </li>
                   ))}
                </ul>
             </div>
          </div>
        </div>
      </section>

      {/* 9. OFERTA & CTA FINAL */}
      <section className="py-40 relative">
        <div className="absolute inset-0 bg-card/20 -z-10" />
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-12">
            <h2 className="text-6xl lg:text-8xl font-black tracking-tight leading-none">Pronto para a sua nova fase?</h2>
            <div className="relative p-12 lg:p-20 bg-card rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,255,102,0.1)] border border-border">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-3 bg-primary text-background rounded-full text-xs font-black uppercase tracking-[0.3em]">Acesso Imediato</div>
              <p className="text-2xl font-bold mb-8 text-muted-foreground">Invista no seu futuro profissional hoje</p>
              <div className="flex flex-col items-center gap-2 mb-12">
                <span className="text-muted-foreground line-through text-2xl font-black opacity-30">R$ {ebook.price_cents ? (ebook.price_cents * 2.5 / 100).toFixed(2) : "0,00"}</span>
                <p className="text-8xl lg:text-9xl font-black text-primary tracking-tighter leading-none">{price}</p>
                <span className="text-muted-foreground font-bold uppercase tracking-widest text-sm opacity-60">Preço único • Sem mensalidade</span>
              </div>
              <Button 
                size="lg" 
                onClick={handleCheckout} 
                disabled={checkoutLoading}
                className="h-24 w-full max-w-2xl text-2xl lg:text-3xl font-black bg-primary hover:bg-primary/90 text-background rounded-full shadow-[0_25px_50px_-12px_rgba(0,255,102,0.4)] transition-all hover:scale-105 border-none"
              >
                {checkoutLoading ? <Loader2 className="animate-spin" /> : "QUERO GARANTIR MINHA VAGA"}
              </Button>
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { icon: ShieldCheck, text: "Seguro" },
                   { icon: LockIcon, text: "Protegido" },
                   { icon: Flame, text: "Vitalício" },
                   { icon: Star, text: "Exclusivo" }
                 ].map((badge, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                       <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center border border-border"><badge.icon size={18} className="text-primary" /></div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">{badge.text}</span>
                    </div>
                 ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      <footer className="py-20 bg-background border-t border-border">
        <div className="container mx-auto px-6 text-center space-y-8">
           <div className="flex items-center justify-center gap-2 text-xl font-black tracking-tighter">
             <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center"><BookOpen size={16} className="text-background" /></div>
             PREMIUM EBOOKS
           </div>
           <p className="text-muted-foreground text-sm max-w-md mx-auto opacity-80">Desenvolvido para impulsionar sua carreira com o melhor conteúdo digital do mercado.</p>
           <div className="pt-8 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">
             © {new Date().getFullYear()} • Todos os direitos reservados
           </div>
        </div>
      </footer>
    </div>
  );
}
