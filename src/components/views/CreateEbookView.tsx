import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Sparkles, Loader2, Copy, Users, Rocket,
  Search, ChevronDown, Star, Flame, ShieldCheck, Clock, Zap, Quote, Download, FileText, Eye,
  BookOpen, MousePointer2, Target, Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const niches = [
  { name: "Emagrecimento", emoji: "🔥", desc: "Alta demanda, ticket médio R$47" },
  { name: "Renda extra", emoji: "💰", desc: "Público engajado, conversão alta" },
  { name: "Marketing digital", emoji: "📈", desc: "Ticket alto, R$97-197" },
  { name: "Relacionamentos", emoji: "💕", desc: "Mercado emocional forte" },
  { name: "Desenvolvimento pessoal", emoji: "🧠", desc: "Crescimento constante" },
  { name: "Finanças", emoji: "💵", desc: "Profissional, ticket alto" },
  { name: "Saúde mental", emoji: "🧘", desc: "Ansiedade, sono, foco" },
  { name: "Fitness e musculação", emoji: "💪", desc: "Hipertrofia, treinos" },
  { name: "Receitas e culinária", emoji: "🍳", desc: "Low carb, fit, doces" },
  { name: "Maternidade", emoji: "👶", desc: "Gestação, sono do bebê" },
  { name: "Pets", emoji: "🐶", desc: "Adestramento, cuidados" },
  { name: "Espiritualidade", emoji: "✨", desc: "Tarô, astrologia, fe" },
  { name: "Estudos e concursos", emoji: "📚", desc: "ENEM, OAB, vestibular" },
  { name: "Tecnologia e programação", emoji: "💻", desc: "Dev, IA, no-code" },
  { name: "Beleza e autocuidado", emoji: "💄", desc: "Skincare, cabelo, makeup" },
  { name: "Empreendedorismo", emoji: "🚀", desc: "Negócios, gestão, vendas" },
  { name: "Idiomas", emoji: "🌍", desc: "Inglês, espanhol fluente" },
  { name: "Viagens", emoji: "✈️", desc: "Roteiros, mochilão, dicas" },
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

const steps = ["Nicho", "Preço", "Ebook", "Página de Vendas", "Divulgação"];
const pricePresets = [19.9, 29.9, 39.9, 49.9];

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
  const [ebookLink, setEbookLink] = useState("");
  const [createdEbookSlug, setCreatedEbookSlug] = useState<string | null>(null);
  const [searchedGroups, setSearchedGroups] = useState<FbGroup[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Sales page simulation states
  const [generatingSalesPage, setGeneratingSalesPage] = useState(false);
  const [salesPageGenerated, setSalesPageGenerated] = useState(false);
  const [salesPageStage, setSalesPageStage] = useState("");

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
    setGeneratingSalesPage(true);
    setSalesPageGenerated(false);
    const stages = [
      "Analisando a estrutura do ebook...",
      "Extraindo gatilhos mentais...",
      "Redigindo copy de alta conversão...",
      "Otimizando layout para mobile...",
      "Finalizando estrutura da página..."
    ];
    for (const stage of stages) {
      setSalesPageStage(stage);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    setGeneratingSalesPage(false);
    setSalesPageGenerated(true);
    toast.success("Página de vendas gerada com sucesso!");
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
      <div>
        <h1 className="font-display text-3xl font-bold">Criar novo ebook</h1>
        <p className="mt-1 text-muted-foreground">Siga as etapas e crie seu produto em minutos.</p>
      </div>

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
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {niches.map((n) => (
                    <button
                      key={n.name}
                      onClick={() => setNiche(n.name)}
                      className={`group rounded-xl border p-4 text-left transition hover:shadow-md hover:-translate-y-0.5 ${
                        niche === n.name ? "border-primary bg-accent shadow-glow" : "hover:border-primary/40"
                      }`}
                    >
                      <p className="font-semibold text-base">{n.name}</p>
                    </button>
                  ))}
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
                <p className="mt-1 text-sm text-muted-foreground">Digite ou escolha uma sugestão abaixo.</p>
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
                <h2 className="font-display text-xl font-semibold">Gere seu Ebook</h2>
                {!generated && !generating && (
                  <div className="mt-10 flex flex-col items-center justify-center rounded-2xl gradient-hero p-10 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
                      <Sparkles className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <p className="mt-4 font-display text-lg font-semibold">Pronto para a mágica?</p>
                    <p className="mt-1 text-sm text-muted-foreground">Vamos gerar título, subtítulo e capítulos.</p>
                    <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-xs">
                      <Button onClick={generate} size="lg" className="w-full gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                        <Sparkles className="mr-2 h-4 w-4" /> Gerar Ebook
                      </Button>
                    </div>
                  </div>
                )}
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
                    <EbookPreview title={title} subtitle={subtitle} coverUrl={coverUrl} chapters={chapters} showOnlyFirstChapter={true} />
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div key="step3-container">
                <h2 className="font-display text-xl font-semibold">Página</h2>
                <p className="mt-1 text-sm text-muted-foreground">Preview da landing page de alta conversão.</p>

                {!salesPageGenerated && !generatingSalesPage && (
                  <div key="cta-sales" className="mt-10 flex flex-col items-center justify-center rounded-2xl gradient-hero p-10 text-center border-2 border-dashed border-primary/20 bg-primary/5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
                      <Layout className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <p className="mt-4 font-display text-lg font-semibold">Sua página está quase pronta!</p>
                    <p className="mt-1 text-sm text-muted-foreground">Clique no botão abaixo para gerar a estrutura de vendas.</p>
                    <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-xs">
                      <Button onClick={generateSalesPage} size="lg" className="w-full gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                        <Zap className="mr-2 h-4 w-4" /> Gerar Página de Vendas
                      </Button>
                    </div>
                  </div>
                )}

                {generatingSalesPage && (
                  <div key="generating-sales" className="mt-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="mt-4 font-medium">Gerando sua página de vendas...</p>
                    <p className="mt-1 text-sm text-muted-foreground">{salesPageStage || "Trabalhando..."}</p>
                    <div className="mt-6 w-full max-w-xs">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div className="h-full gradient-primary" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 6, ease: "linear" }} />
                      </div>
                    </div>
                  </div>
                )}

                {salesPageGenerated && (
                  <motion.div key="sales-page-preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-6 rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-2xl relative">
                    <div className="pt-16 pb-12 px-8 text-center bg-white relative">
                      <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-100 mb-6">PRÉVIA DA PÁGINA DE VENDAS</Badge>
                      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight max-w-2xl mx-auto">{title || "Seu Título"}</h1>
                      <p className="mt-4 text-base text-gray-500 max-w-lg mx-auto leading-relaxed">{subtitle}</p>
                      <div className="mt-8 flex justify-center">
                        <div className="relative w-40 h-56 rounded-xl bg-gray-100 shadow-xl overflow-hidden ring-1 ring-gray-200">
                          {coverUrl ? <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-blue-600"><BookOpen className="h-10 w-10 text-white/50" /></div>}
                        </div>
                      </div>
                      <div className="mt-10">
                        <div className="text-4xl font-black text-blue-600">R$ {price.toFixed(2).replace(".", ",")}</div>
                        <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 rounded-2xl shadow-lg" onClick={() => toast.info("Esta é apenas uma prévia.")}>QUERO COMEÇAR AGORA</Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {salesPageGenerated && (
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      className="flex-1 gradient-primary text-primary-foreground shadow-glow"
                      disabled={saving}
                      onClick={async () => {
                        if (!generatedEbookId) return toast.error("Gere o ebook primeiro");
                        setSaving(true);
                        try {
                          await supabase.from("ebooks").update({ status: "published", is_public: true }).eq("id", generatedEbookId);
                          setIsPublished(true);
                          toast.success("Página publicada com sucesso! 🚀");
                        } catch (err) { toast.error("Erro ao publicar"); } finally { setSaving(false); }
                      }}
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                      Publicar página
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-primary/20 hover:bg-primary/5 gap-2"
                      onClick={() => {
                        if (isPublished && ebookLink) {
                          window.open(ebookLink, '_blank');
                        } else {
                          const previewData = { title, subtitle, price, chapters: chapters.map(c => ({ title: c.title, content: c.content })) };
                          sessionStorage.setItem('ebook_preview_data', JSON.stringify(previewData));
                          window.open(`${window.location.origin}/e/preview`, '_blank');
                        }
                      }}
                    >
                      <Eye className="h-4 w-4" /> {isPublished ? "Ver Página na Web" : "Ver na Web"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="font-display text-xl font-semibold">Divulgação</h2>
                <p className="mt-1 text-sm text-muted-foreground">Encontre os melhores grupos para divulgar seu produto.</p>
                <div className="mt-6 rounded-2xl border bg-muted/30 p-5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input placeholder="Qual o nicho?" value={searchTopic} onChange={(e) => setSearchTopic(e.target.value)} />
                    <Button onClick={() => { if (!searchTopic.trim()) return toast.error("Digite o assunto"); setSearchedGroups([{ name: "Ready", members: 0, engagement: "" }]); toast.success("Links gerados!"); }} className="gradient-primary text-primary-foreground shadow-glow"><Zap className="mr-2 h-4 w-4" /> Gerar Links</Button>
                  </div>
                </div>
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
        <Button variant="ghost" onClick={prev} disabled={step === 0}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
        {step < steps.length - 1 ? (
          <Button onClick={next} className="gradient-primary text-primary-foreground shadow-glow">Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button>
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
