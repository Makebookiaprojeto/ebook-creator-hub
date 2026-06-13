import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Sparkles, Loader2, Copy, Users, Rocket,
  Search, ChevronDown, Star, Flame, ShieldCheck, Clock, Zap, Quote, Download, FileText, Eye,
  BookOpen, MousePointer2, Target, Layout, Award, Lock as LockIcon, ArrowRight as ArrowRightIcon,
  TrendingUp, ExternalLink, Video,
  Dumbbell, Utensils, Baby, Dog, Sparkle, GraduationCap, Laptop, Palette, Briefcase, Languages, Map, Home, Shirt,
  Heart, Wallet, Brain, HeartPulse
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const niches = [
  { name: "Emagrecimento", emoji: "🔥", icon: Flame, desc: "Alta demanda, ticket médio R$47" },
  { name: "Renda extra", emoji: "💰", icon: Wallet, desc: "Público engajado, conversão alta" },
  { name: "Marketing digital", icon: Rocket, emoji: "📈", desc: "Ticket alto, R$97-197" },
  { name: "Relacionamentos", emoji: "💕", icon: Heart, desc: "Mercado emocional forte" },
  { name: "Desenvolvimento pessoal", emoji: "🧠", icon: Brain, desc: "Crescimento constante" },
  { name: "Finanças", emoji: "💵", icon: Wallet, desc: "Profissional, ticket alto" },
  { name: "Saúde mental", emoji: "🧘", icon: HeartPulse, desc: "Ansiedade, sono, foco" },
  { name: "Fitness e musculação", emoji: "💪", icon: Dumbbell, desc: "Hipertrofia, treinos" },
  { name: "Receitas e culinária", emoji: "🍳", icon: Utensils, desc: "Low carb, fit, doces" },
  { name: "Maternidade", emoji: "👶", icon: Baby, desc: "Gestação, sono do bebê" },
  { name: "Pets", emoji: "🐶", icon: Dog, desc: "Adestramento, cuidados" },
  { name: "Espiritualidade", emoji: "✨", icon: Sparkle, desc: "Tarô, astrologia, fe" },
  { name: "Estudos e concursos", emoji: "📚", icon: GraduationCap, desc: "ENEM, OAB, vestibular" },
  { name: "Tecnologia e programação", emoji: "💻", icon: Laptop, desc: "Dev, IA, no-code" },
  { name: "Beleza e autocuidado", emoji: "💄", icon: Palette, desc: "Skincare, cabelo, makeup" },
  { name: "Empreendedorismo", emoji: "🚀", icon: Briefcase, desc: "Negócios, gestão, vendas" },
  { name: "Idiomas", emoji: "🌍", icon: Languages, desc: "Inglês, espanhol fluente" },
  { name: "Viagens", emoji: "✈️", icon: Map, desc: "Roteiros, mochilão, dicas" },
  { name: "Arquitetura e Decoração", emoji: "🏠", icon: Home, desc: "Design de interiores, organização" },
  { name: "Moda e Estilo", emoji: "👗", icon: Shirt, desc: "Consultoria de imagem, tendências" },
];

const testimonials = [
  { name: "Mariana Costa", role: "Mãe e empreendedora", text: "Comprei o ebook e em 2 semanas já tinha resultados visíveis. Mudou minha rotina!", rating: 5, avatar: "M" },
  { name: "Rafael Lima", role: "Estudante", text: "Conteúdo direto ao ponto, sem enrolação. Vale cada centavo. Recomendo demais!", rating: 5, avatar: "R" },
  { name: "Juliana Souza", role: "Designer", text: "Achei que seria mais um ebook genérico, mas me surpreendeu. Material excelente!", rating: 5, avatar: "J" },
];

import { toast } from "sonner";
import { useEbooks } from "@/hooks/useEbooks";
import { supabase } from "@/integrations/supabase/client";
import { EbookPreview } from "@/components/EbookPreview";
import { EbookPreviewCarousel } from "@/components/EbookPreviewCarousel";
import videoDivulgacao from "@/assets/video-divulgacao-v3.mp4.asset.json";
import videoDivulgacaoPoster from "@/assets/video-divulgacao-poster-v3.jpg.asset.json";

const steps = ["Nicho", "Preço", "Ebook", "Página de Vendas", "Divulgação"];
const pricePresets = [19.9, 29.9, 39.9, 49.9];

const colorOptions = [
  { name: "Laranja", value: "#F97316" },
  { name: "Azul", value: "#3B82F6" },
  { name: "Verde", value: "#10B981" },
  { name: "Roxo", value: "#8B5CF6" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Preto", value: "#000000" },
  { name: "Branco", value: "#FFFFFF" },
  { name: "Cinza escuro", value: "#121212" }
];

type FbGroup = { name: string; members: number; engagement: string };
type ChapterDraft = {
  title: string;
  subtitle: string;
  content: string;
  image_url: string | null;
};

export function CreateEbookView() {
  const { createEbookWithChapters } = useEbooks();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [price, setPrice] = useState<number>(29.9);
  const [priceInput, setPriceInput] = useState<string>("29,90");
  const [generating, setGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<string>("");
  const [generated, setGenerated] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [chapters, setChapters] = useState<ChapterDraft[]>([]);
  const [generatedEbookId, setGeneratedEbookId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{ done: number; total: number } | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [searchTopic, setSearchTopic] = useState("");
  const [divulgacaoNiche, setDivulgacaoNiche] = useState("");
  const [generatedDivulgacaoLink, setGeneratedDivulgacaoLink] = useState("");
  const [ebookLink, setEbookLink] = useState("");
  const [createdEbookSlug, setCreatedEbookSlug] = useState<string | null>(null);
  const [searchedGroups, setSearchedGroups] = useState<FbGroup[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Sales page simulation states
  const [generatingSalesPage, setGeneratingSalesPage] = useState(false);
  const [salesPageGenerated, setSalesPageGenerated] = useState(false);
  const [salesPageStage, setSalesPageStage] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#F97316");
  const [secondaryColor, setSecondaryColor] = useState("#121212");

  const resetForm = () => {
    setStep(0);
    setNiche("");
    setAudience("");
    setPrice(29.9);
    setPriceInput("29,90");
    setGenerating(false);
    setGenerated(false);
    setGenerationStage("");
    setTitle("");
    setSubtitle("");
    setCoverUrl(null);
    setChapters([]);
    setGeneratedEbookId(null);
    setGenerationProgress(null);
    setIsPublished(false);
    setSearchTopic("");
    setEbookLink("");
    setCreatedEbookSlug(null);
    setSearchedGroups([]);
    setPdfUrl(null);
    setGeneratingSalesPage(false);
    setSalesPageGenerated(false);
    setSalesPageStage("");
  };

  useEffect(() => {
    const checkOngoing = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: eb } = await supabase
        .from("ebooks")
        .select("id, niche, audience, generation_status, title, subtitle, cover_url, content_json, status, slug, pdf_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (eb && eb.status !== "published") {
        setNiche(eb.niche || "");
        setAudience(eb.audience || "");
        setGeneratedEbookId(eb.id);
        if (eb.pdf_url) setPdfUrl(eb.pdf_url);
        if (eb.slug) {
          setCreatedEbookSlug(eb.slug);
          setEbookLink(`${window.location.origin}/e/${eb.slug}`);
        }
        
        if (eb.generation_status === "processing") {
          setStep(2);
          startPolling(eb.id);
        } else if (eb.generation_status === "done") {
          setTitle(eb.title || "");
          setSubtitle(eb.subtitle || "");
          setCoverUrl(eb.cover_url);
          const content = eb.content_json as any;
          const chs = Array.isArray(content) ? content : (content?.chapters || []);
          if (chs.length > 0) {
            setChapters(chs.map((c: any) => ({
              title: c.title,
              subtitle: "",
              content: c.content || "",
              image_url: c.image_url
            })));
            setGenerated(true);
            setStep(2);
          }
        }
      }
    };
    checkOngoing();
  }, []);

  const startPolling = async (ebookId: string) => {
    setGenerating(true);
    setGeneratedEbookId(ebookId);
    const POLL_MS = 2500;
    const MAX_TRIES = 240; 
    let tries = 0;

    const poll = async (): Promise<void> => {
      tries += 1;
      const { data: eb } = await supabase
        .from("ebooks")
        .select("title, subtitle, cover_url, generation_status, generation_progress, generation_error, content_json, slug, pdf_url")
        .eq("id", ebookId)
        .maybeSingle();

      if (!eb) {
        if (tries < MAX_TRIES) {
          setTimeout(poll, POLL_MS);
          return;
        }
        setGenerating(false);
        return;
      }

      if (eb.title && eb.title !== "Gerando...") setTitle(eb.title);
      if (eb.subtitle) setSubtitle(eb.subtitle);
      if (eb.cover_url) setCoverUrl(eb.cover_url);
      if (eb.pdf_url) setPdfUrl(eb.pdf_url);
      if (eb.slug) {
        setCreatedEbookSlug(eb.slug);
        setEbookLink(`${window.location.origin}/e/${eb.slug}`);
      }

      const prog: any = eb.generation_progress ?? {};
      if (prog.message) setGenerationStage(prog.message);
      
      const content = eb.content_json as any;
      const chs = Array.isArray(content) ? content : (content?.chapters || []);
      if (chs.length > 0) {
        setChapters(chs.map((c: any) => ({
          title: c.title,
          subtitle: "",
          content: c.content ?? "",
          image_url: c.image_url ?? null,
        })));
      }
      
      if (prog.total > 0) {
        setGenerationProgress({ done: prog.done || 0, total: prog.total });
      }

      if (eb.generation_status === "done") {
        setGenerated(true);
        setGenerating(false);
        setGenerationStage("");
        try {
          await supabase.from("ebooks").update({ status: "published", is_public: true }).eq("id", ebookId);
        } catch (pubErr) {
          console.error("Auto publish failed:", pubErr);
        }
        return;
      }
      
      if (eb.generation_status === "failed") {
        setGenerating(false);
        toast.error(eb.generation_error || "Falha na geração");
        return;
      }
      
      if (tries < MAX_TRIES) {
        setTimeout(poll, POLL_MS);
      } else {
        setGenerating(false);
        toast.error("Tempo esgotado aguardando a geração.");
      }
    };
    poll();
  };

  const generate = async () => {
    if (!niche.trim()) {
      toast.error("Escolha um nicho primeiro");
      return;
    }
    setGenerating(true);
    setGenerated(false);
    setGenerationStage("Buscando e personalizando o melhor modelo...");
    setGenerationProgress(null);
    setTitle("");
    setSubtitle("");
    setCoverUrl(null);
    setChapters([]);

    try {
      const { data, error: funcError } = await supabase.functions.invoke("personalize-template", {
        body: { niche, audience }
      });

      if (funcError || !data?.template) {
        throw new Error(data?.error || "Ebook ainda não disponível para este nicho");
      }

      const template = data.template;
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGenerationStage("Clonando modelo exclusivo...");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: newEbook, error: cloneErr } = await supabase
        .from("ebooks")
        .insert({
          user_id: user.id,
          title: template.title,
          subtitle: template.subtitle,
          niche: niche,
          audience: audience || template.audience,
          cover_url: template.cover_url,
          status: "published",
          is_public: true,
          is_template: false,
          content_json: { chapters: template.chapters, learning_topics: template.learning_topics },
          price: price || 29.9,
          price_cents: Math.round((price || 29.9) * 100),
          slug: `ebook-${Math.random().toString(36).substring(2, 7)}`,
          generation_status: "done",
          payment_platform: "cakto"
        })
        .select()
        .single();

      if (cloneErr) throw cloneErr;

      setGeneratedEbookId(newEbook.id);
      setTitle(newEbook.title || "");
      setSubtitle(newEbook.subtitle || "");
      setCoverUrl(newEbook.cover_url);
      setPdfUrl(newEbook.pdf_url);
      
      if (newEbook.slug) {
        setCreatedEbookSlug(newEbook.slug);
        setEbookLink(`${window.location.origin}/e/${newEbook.slug}`);
      }

      const content = newEbook.content_json as any;
      const chs = Array.isArray(content) ? content : (content?.chapters || []);
      setChapters(chs.map((c: any) => ({
        title: c.title,
        subtitle: c.subtitle || "",
        content: c.content || "",
        image_url: c.image_url
      })));

      setGenerated(true);
      setGenerating(false);
      setGenerationStage("");
      toast.success("Ebook pronto!");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Erro ao buscar ebook");
      setGenerating(false);
    }
  };

  const generateSalesPage = async () => {
    if (!title || !price) {
      toast.error("Preencha o título e o preço antes de gerar a página");
      return;
    }

    setGeneratingSalesPage(true);
    setSalesPageGenerated(false);
    
    // Simulate publication/generation
    const stages = [
      "Analisando a estrutura do ebook...",
      "Extraindo gatilhos mentais...",
      "Redigindo copy de alta conversão...",
      "Otimizando layout para mobile...",
      "Finalizando estrutura da página..."
    ];
    
    for (const stage of stages) {
      setSalesPageStage(stage);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      if (!generatedEbookId) {
        throw new Error("Ebook ainda não foi gerado");
      }

      await supabase.from("ebooks").update({
        title,
        price,
        price_cents: Math.round(price * 100),
        status: "published",
        is_public: true,
      }).eq("id", generatedEbookId);

      // Re-fetch the canonical slug from DB to guarantee a valid public URL
      const { data: ebRow, error: fetchErr } = await supabase
        .from("ebooks")
        .select("slug, is_public")
        .eq("id", generatedEbookId)
        .maybeSingle();

      if (fetchErr || !ebRow?.slug) {
        throw new Error("Não foi possível obter o link público do ebook");
      }

      setCreatedEbookSlug(ebRow.slug);
      setEbookLink(`${window.location.origin}/e/${ebRow.slug}`);

      setGeneratingSalesPage(false);
      setSalesPageGenerated(true);
      setIsPublished(true);
      toast.success("Página de vendas gerada e publicada com sucesso!");
    } catch (error: any) {
      console.error("generateSalesPage error:", error);
      setGeneratingSalesPage(false);
      toast.error(error?.message || "Erro ao publicar a página de vendas");
    }
  };

  const handleGenerateEbook = async () => {
    await generate();
    setStep(2);
  };


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    setStep((s) => Math.min(s + 1, steps.length - 1));
    scrollToTop();
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    scrollToTop();
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Progress */}
      <div className="rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition ${
                    i < step
                      ? "bg-success text-success-foreground"
                      : i === step
                      ? "gradient-primary text-primary-foreground shadow-glow"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`hidden sm:block text-xs font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-2 h-0.5 flex-1 rounded-full bg-muted">
                  <div className={`h-full rounded-full transition-all duration-500 ${i < step ? "bg-success w-full" : "w-0"}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-soft min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold">Selecione um nicho</h2>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {niches.map((n) => {
                    const Icon = n.icon;
                    return (
                      <button
                        key={n.name}
                        onClick={() => setNiche(n.name)}
                        className={`group rounded-lg border px-3 py-3 text-center transition-all hover:shadow-sm hover:-translate-y-0.5 min-h-[64px] flex flex-col items-center justify-center gap-2 ${
                          niche === n.name 
                            ? "border-primary bg-primary text-primary-foreground shadow-glow" 
                            : "bg-card border-border hover:border-primary/50"
                        }`}
                      >
                        {Icon && <Icon className={`h-5 w-5 ${niche === n.name ? "text-primary-foreground" : "text-primary"}`} />}
                        <p className={`font-medium text-xs sm:text-sm leading-tight ${
                          niche === n.name ? "text-primary-foreground" : "text-foreground"
                        }`}>
                          {n.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-8">
                  <label className="text-sm font-semibold">Quem é o público-alvo do seu ebook?</label>
                  <Textarea
                    className="mt-3 min-h-[110px]"
                    placeholder="Ex: Mulheres de 30-45 anos, mães, que querem perder peso após a gravidez sem dietas restritivas e com pouco tempo para se exercitar..."
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="max-w-xl mx-auto">
                <h2 className="font-display text-xl font-semibold">Defina o preço</h2>
                <div className="mt-6">
                  <label className="text-xs font-medium uppercase text-muted-foreground">Preço de venda (R$)</label>
                  <div className="mt-2 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">R$</span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={priceInput}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9,.]/g, "").replace(".", ",");
                        const parts = raw.split(",");
                        let next = parts[0].replace(/^0+(?=\d)/, "");
                        if (parts.length > 1) next += "," + parts[1].slice(0, 2);
                        setPriceInput(next);
                        const num = parseFloat(next.replace(",", ".")) || 0;
                        setPrice(num);
                      }}
                      onBlur={() => {
                        if (!priceInput) return;
                        setPriceInput(price.toFixed(2).replace(".", ","));
                      }}
                      className="pl-12 h-14 text-2xl font-bold font-display"
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <p className="text-xs text-muted-foreground mb-2">Sugestões rápidas</p>
                  <div className="flex flex-wrap gap-2">
                    {pricePresets.map((p) => (
                      <button
                        key={p}
                        onClick={() => { setPrice(p); setPriceInput(p.toFixed(2).replace(".", ",")); }}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition hover:border-primary ${price === p ? "border-primary bg-accent text-accent-foreground" : ""}`}
                      >
                        R$ {p.toFixed(2).replace(".", ",")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                
                
                {generating && !generated && (
                  <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="mt-4 font-medium">Gerando seu ebook...</p>
                    <p className="mt-1 text-sm text-muted-foreground">{generationStage || "Trabalhando..."}</p>
                    {generationProgress && generationProgress.total > 0 && (
                      <div className="mt-4 w-full max-w-xs">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full gradient-primary transition-all duration-500" style={{ width: `${Math.max(5, (generationProgress.done / generationProgress.total) * 100)}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{generationProgress.done} de {generationProgress.total} capítulos</p>
                      </div>
                    )}
                  </div>
                )}
                
                {generated && (
                  <div className="mt-6 space-y-6">
                    <EbookPreviewCarousel title={title} subtitle={subtitle} coverUrl={coverUrl} chapters={chapters} />
                  </div>
                )}

                {!generating && !generated && (
                  <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center">
                    <p className="text-muted-foreground">Ocorreu um erro ao exibir a prévia ou o ebook ainda não foi gerado.</p>
                    <Button onClick={generate} variant="outline" className="mt-4">
                      Tentar Gerar Novamente
                    </Button>
                  </div>
                )}
              </div>
            )}


            {step === 3 && (
              <div key="step3-container" className="space-y-6">
                <h2 className="font-display text-xl font-semibold text-center mb-6">Configure sua Página de Vendas</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Título do Ebook</label>
                      <Input 
                        placeholder="Digite o título do ebook" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Preço do Ebook</label>
                      <Input 
                        placeholder="R$ 0,00" 
                        value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          const numericValue = Number(value) / 100;
                          setPrice(numericValue);
                          setPriceInput(numericValue.toFixed(2).replace(".", ","));
                        }} 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Cor primária</label>
                        <Select value={primaryColor} onValueChange={setPrimaryColor}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent position="popper" side="bottom">
                            {colorOptions.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color.value }} />
                                  <span>{color.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Cor secundária</label>
                        <Select value={secondaryColor} onValueChange={setSecondaryColor}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent position="popper" side="bottom">
                            {colorOptions.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color.value }} />
                                  <span>{color.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="pt-4 space-y-3">
                      <Button 
                        onClick={generateSalesPage} 
                        disabled={generatingSalesPage || !title || !price}
                        className="w-full gradient-primary text-primary-foreground shadow-glow h-12"
                      >
                        {generatingSalesPage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" /> Gerar página de vendas
                          </>
                        )}
                      </Button>

                      {salesPageGenerated && (
                        <Button
                          variant="outline"
                          className="w-full h-12 gap-2 border-primary/20 hover:bg-primary/5"
                          onClick={async () => {
                            // Always open a tab synchronously to avoid popup blockers
                            const tab = window.open("about:blank", "_blank");

                            try {
                              if (!generatedEbookId) {
                                throw new Error("Ebook ainda não foi gerado");
                              }

                              // Re-fetch the canonical slug + ensure it is public
                              const { data: eb, error } = await supabase
                                .from("ebooks")
                                .select("slug, is_public, status")
                                .eq("id", generatedEbookId)
                                .maybeSingle();

                              if (error) throw error;
                              if (!eb?.slug) {
                                throw new Error("Link do ebook não encontrado");
                              }

                              // Make sure the page is actually public before opening
                              if (!eb.is_public || eb.status !== "published") {
                                const { error: upErr } = await supabase
                                  .from("ebooks")
                                  .update({ is_public: true, status: "published" })
                                  .eq("id", generatedEbookId);
                                if (upErr) throw upErr;
                              }

                              const url = `${window.location.origin}/e/${eb.slug}`;
                              setCreatedEbookSlug(eb.slug);
                              setEbookLink(url);

                              if (tab) {
                                tab.location.href = url;
                              } else {
                                window.location.href = url;
                              }
                            } catch (err: any) {
                              console.error("Ver na web error:", err);
                              if (tab) tab.close();
                              toast.error(err?.message || "Não foi possível abrir a página de vendas");
                            }
                          }}
                        >
                          <ExternalLink className="h-4 w-4" /> Ver na web
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    
                    <div className="rounded-2xl border border-border overflow-hidden shadow-xl aspect-[3/4] relative scale-[0.9] origin-top" style={{ backgroundColor: secondaryColor }}>
                      <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-none">
                        <section className="relative pt-8 pb-10 overflow-hidden text-center px-4">
                          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 rounded-full blur-[40px] -z-10" style={{ backgroundColor: `${primaryColor}33` }} />
                          <div className="space-y-4">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mx-auto" style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor, border: `1px solid ${primaryColor}33` }}>
                              <Sparkles className="h-3 w-3" /> Lançamento
                            </div>
                            <h1 className="text-2xl font-black tracking-tight leading-none text-[#111111]">
                              {title || "Seu Título"}
                            </h1>
                            <p className="text-sm text-muted-foreground font-medium">
                              {subtitle || "Aprenda de forma prática e rápida com este guia definitivo."}
                            </p>
                            <div className="flex flex-col items-center gap-4 pt-2">
                              <div className="h-10 px-6 text-sm font-black text-white rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: primaryColor }}>
                                OBTER ACESSO AGORA
                              </div>
                              <p className="text-2xl font-black" style={{ color: primaryColor }}>R$ {price.toFixed(2).replace(".", ",")}</p>
                            </div>
                            <div className="mx-auto w-32 relative shadow-lg rounded-lg overflow-hidden aspect-[3/4.2]" style={{ boxShadow: `0 12px 30px -8px ${primaryColor}66`, border: `2px solid ${primaryColor}` }}>
                              {coverUrl ? <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/50" style={{ backgroundColor: primaryColor }}><BookOpen className="h-6 w-6" /></div>}
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="font-display text-xl font-semibold">Divulgação</h2>
                <p className="mt-1 text-sm text-muted-foreground">Encontre os melhores grupos para divulgar seu produto.</p>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Search className="h-5 w-5 text-primary" />
                      Divulgação
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Ex: Emagrecimento, Finanças..."
                        value={divulgacaoNiche}
                        onChange={(e) => setDivulgacaoNiche(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        className="gradient-primary text-primary-foreground shadow-glow gap-2"
                        onClick={() => {
                          if (!divulgacaoNiche.trim()) return toast.error("Digite o nicho do ebook");
                          const link = `https://www.facebook.com/groups/search/groups/?q=${encodeURIComponent(divulgacaoNiche.trim())}`;
                          setGeneratedDivulgacaoLink(link);
                          navigator.clipboard.writeText(link).catch(() => {});
                          toast.success("Link gerado e copiado!");
                        }}
                      >
                        <Search className="h-4 w-4" />
                        Buscar
                      </Button>
                    </div>

                    {generatedDivulgacaoLink && (
                      <a
                        href={generatedDivulgacaoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 block text-sm text-primary underline break-all"
                      >
                        {generatedDivulgacaoLink}
                      </a>
                    )}
                  </div>

                  <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-primary" />
                      Onde divulgar seu Ebook
                    </h3>
                    <div className="relative">
                      <Input
                        readOnly
                        value={`Buscar melhores grupos relacionados a "${divulgacaoNiche.trim() || "nicho preenchido em divulgação"}"`}
                        className="pr-12 cursor-pointer"
                        onClick={() => {
                          const query = divulgacaoNiche.trim() || niche;
                          if (!query) return toast.error('Digite o nicho no campo "Divulgação"');
                          window.open(`https://www.facebook.com/groups/search/groups/?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
                        }}
                      />
                      <button
                        type="button"
                        aria-label="Abrir grupos no Facebook"
                        onClick={() => {
                          const query = divulgacaoNiche.trim() || niche;
                          if (!query) return toast.error('Digite o nicho no campo "Divulgação"');
                          window.open(`https://www.facebook.com/groups/search/groups/?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-primary hover:bg-primary/10 transition-colors"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                  </div>

                  <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Quote className="h-5 w-5 text-primary" />
                      Mensagem pronta para Divulgação
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use esta copy persuasiva para gerar interesse nos grupos:
                    </p>
                    <div className="relative">
                      <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 pb-14 rounded-xl border border-dashed border-primary/20 leading-relaxed">
                        {`Comprei sem grandes expectativas e me surpreendi. O conteúdo é direto ao ponto, fácil de aplicar e entregou exatamente o que eu procurava. Em poucos dias já consegui colocar várias dicas em prática. Recomendo para quem quer aprender de forma rápida e sem complicação !!!\n\nLink: ${ebookLink}`}
                      </pre>
                      <Button 
                        size="sm"
                        className="absolute bottom-3 right-3 bg-green-600 hover:bg-green-700 text-white shadow-sm gap-2"
                        onClick={() => {
                          const text = `Comprei sem grandes expectativas e me surpreendi. O conteúdo é direto ao ponto, fácil de aplicar e entregou exatamente o que eu procurava. Em poucos dias já consegui colocar várias dicas em prática. Recomendo para quem quer aprender de forma rápida e sem complicação !!!\n\nLink: ${ebookLink}`;
                          navigator.clipboard.writeText(text);
                          toast.success("Mensagem copiada!");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copiar Mensagem
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Video className="h-5 w-5 text-primary" />
                      Vídeo pronto para divulgação
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use este vídeo persuasivo para gerar interesse nos grupos:
                    </p>
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video w-full max-w-3xl mx-auto border border-primary/10 mb-4">
                      <video 
                        src={videoDivulgacao.url}
                        poster={videoDivulgacaoPoster.url}
                        className="w-full h-full object-contain bg-black"
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                      />
                    </div>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm gap-2"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = videoDivulgacao.url;
                        link.download = "video-divulgacao.mp4";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("Iniciando download do vídeo...");
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Baixar Vídeo
                    </Button>
                  </div>
                </motion.div>

                {pdfUrl && (
                  <div className="mt-4 rounded-2xl border bg-secondary/10 p-5 border-secondary/20">
                    <Button className="mt-3 w-full sm:w-auto variant-secondary gap-2" onClick={() => window.open(pdfUrl, '_blank')}><Download className="h-4 w-4" /> Baixar PDF</Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={prev} disabled={step === 0 || generating}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
        {step < steps.length - 1 ? (
          step === 1 ? (
            <Button 
              onClick={handleGenerateEbook} 
              disabled={generating}
              className="gradient-primary text-primary-foreground shadow-glow"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  Gerar Ebook <Sparkles className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={next} className="gradient-primary text-primary-foreground shadow-glow">Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button>
          )
        ) : (

          <Button
            disabled={saving}
            className="gradient-primary text-primary-foreground shadow-glow"
            onClick={async () => {
              if (!title) return toast.error("Gere o ebook primeiro");
              setSaving(true);
              try {
                if (generatedEbookId) {
                  await supabase.from("ebooks").update({ title, subtitle, status: "published", is_public: true, price }).eq("id", generatedEbookId);
                }
                toast.success("Ebook finalizado!");
                setTimeout(() => { resetForm(); window.location.href = "/"; }, 2000);
              } catch (e) { toast.error("Erro ao salvar"); } finally { setSaving(false); }
            }}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Finalizar e salvar
          </Button>
        )}
      </div>
    </div>
  );
}
