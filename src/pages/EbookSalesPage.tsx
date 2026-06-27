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
  Quote,
  Gift,
  Infinity as InfinityIcon,
  Crown,
  HelpCircle,
  PlayCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type Chapter = Tables<"chapters">;

function formatPrice(cents?: number | null) {
  if (!cents || cents <= 0) return "Grátis";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

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
      const card = isLight ? "0 0% 98%" : "0 0% 9%";
      const border = isLight ? "0 0% 88%" : "0 0% 18%";
      const secondaryTok = isLight ? "0 0% 94%" : "0 0% 13%";
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCheckout = async () => {
    if (!ebook) return;
    setCheckoutLoading(true);
    const checkoutUrl = (ebook as any).cakto_checkout_url || (ebook as any).checkout_url;
    if (checkoutUrl) {
      try {
        const url = new URL(checkoutUrl);
        url.searchParams.set("ebook_id", ebook.id);
        url.searchParams.set("seller_user_id", ebook.user_id);
        window.location.href = url.toString();
      } catch {
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
      const { data: ebookData } = await supabase.from("ebooks").select("*").eq("slug", slug).maybeSingle();
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
  const oldPrice = ebook.price_cents ? formatPrice(Math.round(ebook.price_cents * 2.7)) : "";
  const salesPageConfig = (ebook?.generation_input as any)?.sales_page || {};
  const salesPageStyle = buildSalesPageStyle(
    salesPageConfig.primary_color,
    salesPageConfig.secondary_color
  );

  const content = ebook?.content_json as any;
  const learningTopics = content?.learning_topics || [];
  const chaptersList = Array.isArray(content) ? content : (content?.chapters || []);
  const displayChapters = chaptersList.length > 0 ? chaptersList : chapters;

  const testimonials = [
    { name: "Mariana Costa", role: "Empreendedora Digital", text: "Esse material mudou completamente minha forma de enxergar o mercado. Recomendo de olhos fechados!", rating: 5 },
    { name: "Rafael Mendes", role: "Consultor", text: "Conteúdo direto, prático e aplicável. Em 30 dias já estava colhendo resultados reais.", rating: 5 },
    { name: "Juliana Alves", role: "Iniciante", text: "Linguagem simples, exemplos claros. Mesmo sem experiência consegui aplicar tudo.", rating: 5 },
  ];

  const faqs = [
    { q: "Como recebo o ebook após a compra?", a: "Imediatamente após a confirmação do pagamento, você recebe o acesso por email e pode baixar o PDF na hora." },
    { q: "Funciona em qualquer dispositivo?", a: "Sim! O ebook é em PDF e funciona em celular, tablet, computador e leitores digitais." },
    { q: "Tenho quanto tempo de acesso?", a: "Acesso vitalício. Uma vez seu, sempre seu, com todas as atualizações futuras incluídas." },
    { q: "E se eu não gostar?", a: "Você tem 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do seu investimento." },
    { q: "Preciso de conhecimento prévio?", a: "Não. O material foi feito para iniciantes e também aprofunda em pontos avançados." },
  ];

  const bonuses = [
    { title: "Checklist Imprimível", desc: "Acompanhe seu progresso com clareza", value: "R$ 97" },
    { title: "Templates Prontos", desc: "Modelos para aplicar imediatamente", value: "R$ 197" },
    { title: "Grupo VIP no Telegram", desc: "Comunidade exclusiva de leitores", value: "R$ 297" },
    { title: "Atualizações Vitalícias", desc: "Receba todas as novas versões grátis", value: "R$ 497" },
  ];

  return (
    <div
      className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary selection:text-primary-foreground"
      style={salesPageStyle}
    >
      {/* TOP BAR */}
      <div className="bg-primary text-primary-foreground py-2.5 text-center text-xs sm:text-sm font-bold tracking-wide">
        <span className="inline-flex items-center gap-2"><Flame size={14} /> OFERTA POR TEMPO LIMITADO • DESCONTO DE LANÇAMENTO ATIVO</span>
      </div>

      {/* HERO */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        <div className="absolute top-10 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute inset-0 -z-10 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-[0.18em] border border-primary/30">
                <Sparkles size={14} /> Edição Premium 2026
              </div>

              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.95]">
                {ebook.title}
              </h1>

              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed font-medium">
                {ebook.subtitle || "O guia definitivo, direto ao ponto, para quem quer resultados reais sem perder tempo com teoria."}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold">
                <div className="flex items-center gap-1.5 text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                  <span className="text-foreground ml-1">4.9/5</span>
                </div>
                <span className="text-muted-foreground">+ de 12.000 leitores</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
                <Button
                  size="lg"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="h-16 px-10 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.6)] hover:scale-[1.02] transition-all"
                >
                  {checkoutLoading ? <Loader2 className="animate-spin" /> : <>QUERO MEU ACESSO <ArrowRight className="ml-1" /></>}
                </Button>
                <div>
                  <div className="text-xs text-muted-foreground line-through font-bold">{oldPrice}</div>
                  <div className="text-3xl font-black text-primary leading-none">{price}</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Pagamento único</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-primary" /> Compra Segura</span>
                <span className="flex items-center gap-1.5"><InfinityIcon size={14} className="text-primary" /> Acesso Vitalício</span>
                <span className="flex items-center gap-1.5"><Gift size={14} className="text-primary" /> Garantia 7 dias</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative">
              <div className="absolute -inset-8 bg-gradient-to-tr from-primary/30 via-primary/5 to-transparent blur-3xl -z-10" />
              <div className="relative mx-auto max-w-md">
                <div className="absolute -top-6 -right-6 z-20 bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-xl rotate-6 font-black text-center">
                  <div className="text-[10px] uppercase tracking-widest opacity-80">Edição</div>
                  <div className="text-2xl">2026</div>
                </div>
                <div className="relative aspect-[3/4.2] rounded-3xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border border-border transition-transform duration-700 hover:-translate-y-2 hover:rotate-1">
                  <img src={ebook.cover_url || ""} alt={ebook.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"><CheckCircle2 className="text-primary" size={20} /></div>
                  <div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">Aprovação</div>
                    <div className="text-lg font-black">98% positiva</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-card/40 py-8">
        <div className="container mx-auto px-6 max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "12k+", label: "Leitores ativos" },
            { value: "4.9★", label: "Avaliação média" },
            { value: "98%", label: "Recomendam" },
            { value: "7 dias", label: "Garantia total" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl lg:text-4xl font-black text-primary">{s.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PARA QUEM É */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">Para quem é</div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Este ebook foi feito para você que…</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Quer resultados reais", desc: "Cansou de promessas vazias e busca um método testado e validado." },
              { icon: Zap, title: "Não tem tempo a perder", desc: "Quer conteúdo direto, prático, sem enrolação ou teoria desnecessária." },
              { icon: Crown, title: "Busca se destacar", desc: "Deseja dominar o assunto e construir autoridade no seu mercado." },
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ y: -6 }} className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <item.icon className="text-primary" size={26} />
                </div>
                <h3 className="text-xl font-black mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-24 bg-card/40 border-y border-border">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">O que você ganha</div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">8 vantagens que fazem a diferença</h2>
            <p className="text-lg text-muted-foreground">Tudo pensado para gerar transformação real desde o primeiro capítulo.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Rocket, title: "Aceleração Real", desc: "Resultados nas primeiras semanas." },
              { icon: Target, title: "Foco no Resultado", desc: "100% prático, sem enrolação." },
              { icon: TrendingUp, title: "Escalabilidade", desc: "Métodos replicáveis em larga escala." },
              { icon: Award, title: "Autoridade", desc: "Conhecimento que vira credibilidade." },
              { icon: MousePointer2, title: "Passo a Passo", desc: "Implementação clara e guiada." },
              { icon: Clock, title: "Economia de Tempo", desc: "Meses condensados em horas." },
              { icon: Layout, title: "Base Sólida", desc: "Estrutura robusta para crescer." },
              { icon: Star, title: "Suporte VIP", desc: "Atualizações e bônus contínuos." },
            ].map((b, i) => (
              <motion.div key={i} whileHover={{ y: -6 }} className="group p-7 rounded-2xl bg-background border border-border hover:border-primary/40 hover:shadow-[0_15px_40px_-15px_hsl(var(--primary)/0.3)] transition-all">
                <div className="h-12 w-12 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center mb-5 transition-colors">
                  <b.icon size={22} className="text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-black mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* O QUE VOCÊ VAI APRENDER */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">Conteúdo</div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">O que você vai aprender</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6">
            {(() => {
              const items = learningTopics.length > 0 ? learningTopics : displayChapters;
              const total = items.length || 6;
              const lastRowCount = total % 3 === 0 ? 3 : total % 3;
              const firstInLastRow = total - lastRowCount;
              const cardClass = (i: number) => {
                const base = "lg:col-span-2";
                if (i < firstInLastRow) return base;
                // center last row
                if (lastRowCount === 1) return `${base} lg:col-start-3`;
                if (lastRowCount === 2) {
                  return i === firstInLastRow ? `${base} lg:col-start-2` : base;
                }
                return base;
              };
              if (items.length === 0) {
                return [...Array(6)].map((_, i) => (
                  <div key={i} className={`p-7 rounded-2xl bg-card border border-border shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.35)] ${cardClass(i)}`}>
                    <div className="text-5xl font-black text-primary/20 mb-4">{String(i + 1).padStart(2, "0")}</div>
                    <h3 className="text-lg font-black mb-2">Módulo {i + 1}</h3>
                    <p className="text-sm text-muted-foreground">Conteúdo essencial para sua evolução.</p>
                  </div>
                ));
              }
              return items.map((item: any, i: number) => (
                <motion.div key={i} whileHover={{ y: -4 }} className={`group relative p-7 rounded-2xl bg-card border border-border shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.35)] hover:border-primary/40 hover:shadow-[0_30px_70px_-15px_hsl(var(--primary)/0.55)] transition-all overflow-hidden ${cardClass(i)}`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                  <div className="relative">
                    <div className="text-5xl font-black text-primary/20 group-hover:text-primary/40 mb-4 transition-colors leading-none">{String(i + 1).padStart(2, "0")}</div>
                    <h3 className="text-lg font-black mb-2">{item.title || `Capítulo ${i + 1}`}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {item.description || "Tópico essencial trabalhado em profundidade com exemplos práticos."}
                    </p>
                  </div>
                </motion.div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* TRANSFORMAÇÃO */}
      <section className="py-24 bg-card/40 border-y border-border">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-14 space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">Sua transformação</div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Antes vs Depois</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-border bg-background p-10 space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest">Situação Atual</div>
              <h3 className="text-2xl font-black text-muted-foreground italic">Antes</h3>
              <ul className="space-y-4">
                {["Insegurança e dúvidas constantes", "Perda de tempo e energia", "Resultados estagnados", "Falta de metodologia clara", "Tentativa e erro caro"].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground"><span className="h-5 w-5 rounded-full bg-destructive/15 text-destructive flex items-center justify-center text-xs font-black">✕</span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border-2 border-primary/40 bg-primary/5 p-10 space-y-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">Nova Realidade</div>
              <h3 className="relative text-2xl font-black">Depois</h3>
              <ul className="relative space-y-4">
                {["Domínio total das ferramentas", "Alta performance constante", "Crescimento acelerado", "Estratégia comprovada e clara", "Resultados previsíveis"].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium"><span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Check size={12} /></span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-14 space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">Depoimentos</div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Quem aplicou, recomenda</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} whileHover={{ y: -6 }} className="p-8 rounded-3xl bg-card border border-border shadow-sm relative">
                <Quote className="absolute top-6 right-6 text-primary/20" size={40} />
                <div className="flex gap-1 mb-4 text-amber-500">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                </div>
                <p className="text-foreground leading-relaxed mb-6 font-medium">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-black">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-black text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground font-medium">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BÔNUS */}
      <section className="py-24 bg-card/40 border-y border-border">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-14 space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">Bônus exclusivos</div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Ganhe 4 bônus comprando hoje</h2>
            <p className="text-lg text-muted-foreground">Valor total dos bônus: <span className="text-primary font-black">R$ 1.088</span></p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bonuses.map((b, i) => (
              <motion.div key={i} whileHover={{ y: -6 }} className="relative p-7 rounded-2xl bg-background border-2 border-dashed border-primary/30 hover:border-primary transition-all">
                <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Bônus #{i + 1}</div>
                <Gift className="text-primary mb-4" size={28} />
                <h3 className="text-lg font-black mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{b.desc}</p>
                <div className="text-xs font-black text-primary">Valor: <span className="line-through opacity-60">{b.value}</span></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="rounded-[2.5rem] border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-transparent p-10 lg:p-14 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-primary text-primary-foreground mb-6 shadow-xl">
                <ShieldCheck size={48} />
              </div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-background border border-border text-xs font-black uppercase tracking-widest mb-4">Garantia incondicional</div>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">7 dias de garantia total</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Compre, leia, aplique. Se em 7 dias você não sentir que vale cada centavo, devolvemos 100% do seu investimento. Sem perguntas, sem burocracia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OFERTA FINAL */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent -z-10" />
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">Última chamada</div>
            <h2 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1] mb-10">
              Pronto para começar<br/>sua transformação?
            </h2>

            <div className="relative p-10 lg:p-14 rounded-[3rem] bg-card border-2 border-primary/30 shadow-[0_40px_80px_-20px_hsl(var(--primary)/0.3)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-black uppercase tracking-[0.25em] shadow-lg">
                Acesso imediato
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left max-w-md mx-auto">
                {["Ebook completo em PDF", "4 bônus exclusivos", "Acesso vitalício", "7 dias de garantia"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-bold">
                    <CheckCircle2 className="text-primary flex-shrink-0" size={18} /> {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-1 mb-8">
                <span className="text-muted-foreground line-through font-bold opacity-60">De {oldPrice} por</span>
                <p className="text-7xl lg:text-8xl font-black text-primary tracking-tighter leading-none">{price}</p>
                <span className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-2">Pagamento único • Sem mensalidade</span>
              </div>

              <Button
                size="lg"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="h-20 w-full max-w-xl text-xl lg:text-2xl font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_25px_60px_-15px_hsl(var(--primary)/0.6)] hover:scale-[1.02] transition-all"
              >
                {checkoutLoading ? <Loader2 className="animate-spin" /> : <>GARANTIR MEU ACESSO AGORA <ArrowRight className="ml-2" /></>}
              </Button>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-1.5"><LockIcon size={12} className="text-primary" /> SSL Seguro</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-primary" /> 7 dias garantia</span>
                <span className="flex items-center gap-1.5"><InfinityIcon size={12} className="text-primary" /> Vitalício</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-card/40 border-y border-border">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">FAQ</div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Dúvidas frequentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-2xl border border-border bg-background overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left font-black hover:bg-card/60 transition-colors"
                >
                  <span className="flex items-center gap-3"><HelpCircle size={18} className="text-primary flex-shrink-0" /> {f.q}</span>
                  <ChevronDown size={20} className={`flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed pl-[3.75rem]">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 bg-background">
        <div className="container mx-auto px-6 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-lg font-black tracking-tight">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center"><BookOpen size={16} className="text-primary-foreground" /></div>
            PREMIUM EBOOKS
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto opacity-80">Conteúdo digital pensado para gerar transformação real na sua vida e carreira.</p>
          <div className="pt-6 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-50">
            © {new Date().getFullYear()} • Todos os direitos reservados
          </div>
        </div>
      </footer>
    </div>
  );
}
