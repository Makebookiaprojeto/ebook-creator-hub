import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Sparkles, Loader2, Copy, Users, Rocket,
  Search, ChevronDown, Star, Flame, ShieldCheck, Clock, Zap, Quote, Download, FileText, Eye,
  BookOpen, MousePointer2, Target, Layout, Award, Lock as LockIcon, ArrowRight as ArrowRightIcon,
  TrendingUp, ExternalLink, Video, Play, Megaphone,
  Dumbbell, Utensils, Baby, Dog, Sparkle, GraduationCap, Laptop, Palette, Briefcase, Languages, Map, Home, Shirt,
  Heart, Wallet, Brain, HeartPulse, DollarSign, BadgeDollarSign
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
import { generateEbookPdf, downloadPdf } from "@/lib/ebookPdf";
const videoDivulgacao1 = { url: "/videos/video-divulgacao-1.mp4" };
const videoDivulgacao2 = { url: "/videos/video-divulgacao-2.mp4" };

const steps = ["Nicho", "Preço", "Ebook", "Página de Vendas", "Divulgação"];
const pricePresets = [19.9, 29.9, 39.9, 49.9];

const getPreviewTextColor = (bg: string): string => {
  const hex = bg.replace("#", "");
  if (hex.length !== 6) return "#FFFFFF";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#111111" : "#FFFFFF";
};

const getPreviewMutedColor = (bg: string): string => {
  return getPreviewTextColor(bg) === "#FFFFFF" ? "#D1D5DB" : "#4B5563";
};


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

type FbGroup = { name: string; url: string; description: string };
type ChapterDraft = {
  title: string;
  subtitle: string;
  content: string;
  image_url: string | null;
};

function DivulgacaoVideoCard({ title, src, filename, script }: { title: string; src: string; filename: string; script: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = async () => {
    if (!src) {
      toast.info("Vídeo será disponibilizado em breve.");
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    try {
      setPlaying(true);
      el.muted = false;
      await el.play();
    } catch {
      try {
        el.muted = true;
        await el.play();
      } catch {
        setPlaying(false);
        toast.error("Não foi possível reproduzir o vídeo neste navegador.");
      }
    }
  };

  const handleDownload = () => {
    if (!src) {
      toast.info("Vídeo será disponibilizado em breve.");
      return;
    }
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Iniciando download do vídeo...");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 rounded-xl border bg-background/40 p-4 shadow-gold">
      <div className="relative shrink-0 mx-auto sm:mx-0 w-[140px] aspect-[9/16] rounded-lg overflow-hidden bg-black border border-primary/10">
        {src ? (
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-cover"
            controls={playing}
            playsInline
            preload="metadata"

            onPause={() => setPlaying(false)}
          />

        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center px-2">
            Vídeo em breve
          </div>
        )}
        {!playing && (
          <button
            type="button"
            onClick={handlePlay}
            aria-label="Reproduzir vídeo"
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
          >
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm">
              <Play className="h-5 w-5 ml-0.5" />
            </span>
          </button>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        <h4 className="text-base font-semibold mb-2 text-primary">{title}</h4>
        <div className="flex-1 flex flex-col justify-start pt-8">
          <p className="text-base text-muted-foreground whitespace-pre-line leading-relaxed">
            <span className="font-semibold text-[#FFFF00]">Roteiro: </span>
            {script}
          </p>
        </div>

        <div className="mt-3 flex justify-end">
          <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow gap-2" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
            Baixar Vídeo
          </Button>
        </div>
      </div>
    </div>
  );
}




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
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [chapters, setChapters] = useState<ChapterDraft[]>([]);
  const [generatedEbookId, setGeneratedEbookId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{ done: number; total: number } | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [searchTopic, setSearchTopic] = useState("");
  const [divulgacaoNiche, setDivulgacaoNiche] = useState("");
  const [showDivulgacaoMessage, setShowDivulgacaoMessage] = useState(false);
  const [loadingDivulgacaoMessage, setLoadingDivulgacaoMessage] = useState(false);
  const [searchingGroups, setSearchingGroups] = useState(false);
  const [groupSearchDone, setGroupSearchDone] = useState(false);
  const [ebookLink, setEbookLink] = useState("");
  const [createdEbookSlug, setCreatedEbookSlug] = useState<string | null>(null);
  const [searchedGroups, setSearchedGroups] = useState<FbGroup[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Sales page simulation states
  const [generatingSalesPage, setGeneratingSalesPage] = useState(false);
  const [salesPageGenerated, setSalesPageGenerated] = useState(false);
  const [salesPageStage, setSalesPageStage] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#F97316");
  const [secondaryColor, setSecondaryColor] = useState("#000000");

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

  const searchFacebookGroups = () => {
    const query = divulgacaoNiche.trim();
    if (!query) return toast.error("Digite o nicho do ebook");

    const termo = `grupos de ${query}`;
    const url = `https://www.facebook.com/search/top?q=${encodeURIComponent(termo)}`;
    window.open(url, "_blank", "noopener,noreferrer");
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

      // Merge sales page customization into generation_input so the public page can read it
      const { data: existing } = await supabase
        .from("ebooks")
        .select("generation_input")
        .eq("id", generatedEbookId)
        .maybeSingle();
      const prevInput = (existing?.generation_input as any) || {};
      const mergedInput = {
        ...prevInput,
        sales_page: {
          title,
          price,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
        },
      };

      await supabase.from("ebooks").update({
        title,
        price,
        price_cents: Math.round(price * 100),
        status: "published",
        is_public: true,
        generation_input: mergedInput,
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


  const stepContentRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewScrollDoneRef = useRef(false);

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

  // Ao chegar no Passo 3 (index 2), aguardar a montagem/animacao do conteúdo e a estabilizacao do layout antes de centralizar a prévia.
  useEffect(() => {
    if (step !== 2) {
      previewScrollDoneRef.current = false;
      return;
    }

    if (!generated || previewScrollDoneRef.current) return;

    let cancelled = false;
    let raf = 0;
    let timeout = 0;
    const correctionTimers: number[] = [];
    let attempts = 0;
    let stableFrames = 0;
    let previousPageHeight = 0;

    const imagesReady = (target: HTMLElement) => {
      const images = Array.from(target.querySelectorAll("img"));
      return images.length === 0 || images.every((img) => img.complete && img.naturalWidth > 0);
    };

    const getStickyHeaderOffset = () => {
      const header = document.querySelector("header");
      if (!header) return 0;

      const style = window.getComputedStyle(header);
      if (style.position !== "sticky" && style.position !== "fixed") return 0;

      return Math.ceil(header.getBoundingClientRect().height);
    };

    const getScrollContainer = (target: HTMLElement): HTMLElement | Window => {
      let parent = target.parentElement;

      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        const canScroll = /(auto|scroll|overlay)/.test(style.overflowY);
        if (canScroll && parent.scrollHeight > parent.clientHeight) return parent;
        parent = parent.parentElement;
      }

      return window;
    };

    const alignPreviewToTop = () => {
      const previewTarget = previewRef.current;
      if (!previewTarget) return;

      const headerOffset = getStickyHeaderOffset();
      const extraOffset = 120; // rola um pouco menos para baixo
      const scrollContainer = getScrollContainer(previewTarget);

      if (scrollContainer === window) {
        const top = previewTarget.getBoundingClientRect().top + window.scrollY - headerOffset - extraOffset;
        window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
        return;
      }

      const container = scrollContainer as HTMLElement;
      const containerRect = container.getBoundingClientRect();
      const targetRect = previewTarget.getBoundingClientRect();
      container.scrollTo({
        top: container.scrollTop + targetRect.top - containerRect.top - headerOffset - extraOffset,
        behavior: "auto",
      });
    };

    const waitForStablePreview = () => {
      if (cancelled) return;

      const scrollTarget = stepContentRef.current;
      const previewTarget = previewRef.current;
      const pageHeight = document.scrollingElement?.scrollHeight ?? document.documentElement.scrollHeight;
      const previewRect = previewTarget?.getBoundingClientRect();
      const targetReady = !!scrollTarget && !!previewTarget && !!previewRect && previewRect.height > 320;
      const pageHeightStable = Math.abs(pageHeight - previousPageHeight) < 1;

      stableFrames = pageHeightStable ? stableFrames + 1 : 0;
      previousPageHeight = pageHeight;

      if (targetReady && stableFrames >= 2 && (imagesReady(previewTarget) || attempts > 45)) {
        previewScrollDoneRef.current = true;
        alignPreviewToTop();
        [80, 180, 360].forEach((delay) => {
          correctionTimers.push(window.setTimeout(() => {
            if (!cancelled) alignPreviewToTop();
          }, delay));
        });
        return;
      }

      if (attempts < 90) {
        attempts += 1;
        raf = requestAnimationFrame(waitForStablePreview);
      }
    };

    timeout = window.setTimeout(() => {
      raf = requestAnimationFrame(waitForStablePreview);
    }, 280);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      correctionTimers.forEach(clearTimeout);
    };
  }, [step, generated]);


  return (
    <div className="space-y-6 animate-fade-in">

      {/* Progress */}
      <div className="px-5 -mt-6 pb-8">
        <div className="mx-auto grid max-w-2xl grid-cols-5 rounded-2xl border border-border bg-card/40 px-6 py-5 shadow-gold">
          {steps.map((label, i) => (
            <div key={label} className="relative flex flex-col items-center gap-1.5">
              {i < steps.length - 1 && (
                <div className="absolute left-1/2 top-[18px] h-0.5 w-full -translate-y-1/2 rounded-full bg-zinc-600">
                  <div
                    style={i < step ? { backgroundColor: "#FFFF00" } : undefined}
                    className={`h-full rounded-full transition-all duration-500 ${i < step ? "w-full" : "w-0"}`}
                  />
                </div>
              )}
              <div
                style={i < step ? { backgroundColor: "#FFFF00", color: "#000000" } : undefined}
                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition ${
                  i < step
                    ? ""
                    : i === step
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden sm:block whitespace-nowrap text-xs font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div ref={stepContentRef} className={`px-6 sm:px-8 pt-2 pb-6 min-h-[420px] ${step === 0 || step === 1 || step === 2 || step === 3 || step === 4 ? "" : "rounded-2xl border bg-card shadow-soft"}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
             <div className="-mt-6">
                 <div className="flex flex-col items-center text-center">
                   <Sparkles className="h-6 w-6" style={{ color: "#FFFF00" }} />
                   <h2 className="font-display text-lg font-semibold mt-2 mb-4">Selecione um nicho</h2>
                 </div>
                 <div className="mt-5 mx-auto max-w-3xl grid grid-cols-5 gap-2.5">
                   {niches.slice(0, 20).map((n) => {
                     const Icon = n.icon;
                     return (
                       <button
                         key={n.name}
                         onClick={() => setNiche(n.name)}
                           className={`group rounded-md border px-2 py-2.5 text-center transition-all shadow-gold hover:-translate-y-0.5 min-h-[58px] flex flex-col items-center justify-center gap-1.5 ${
                             niche === n.name 
                               ? "border-[#D4AF37] bg-[#D4AF37] text-black" 
                               : "bg-card border-border hover:border-primary/50"
                           }`}
                        >
                          {Icon && <Icon className={`h-5 w-5 ${niche === n.name ? "text-black" : "text-primary"}`} />}
                          <p className={`font-medium text-[13px] leading-tight ${
                            niche === n.name ? "text-black" : "text-foreground"
                          }`}>
                           {n.name}
                         </p>
                       </button>
                     );
                   })}
                 </div>

              </div>
            )}

            {step === 1 && (
              <div className="max-w-xl mx-auto -mt-4">
                <div className="flex flex-col items-center text-center">
                  <BadgeDollarSign className="h-7 w-7" style={{ color: "#FFFF00" }} strokeWidth={2.2} />
                  <h2 className="font-display text-xl font-semibold mt-2 mb-4">Defina o preço</h2>
                </div>

                <div className="mt-5 rounded-2xl border border-[#D4AF37] bg-card shadow-[0_0_18px_rgba(212,175,55,0.35)] p-6">


                  <label className="text-sm font-medium uppercase text-muted-foreground">Preço de venda (R$)</label>
                  <div className="mt-2 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">R$</span>
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
                      className="pl-12 h-16 text-3xl font-bold font-display border-[#D4AF37] focus-visible:ring-[#D4AF37]"
                    />
                  </div>
                  <div className="mt-5">

                  <p className="text-sm text-muted-foreground mb-2">Sugestões rápidas</p>
                  <div className="flex flex-wrap gap-2">
                    {pricePresets.map((p) => (
                      <button
                        key={p}
                        onClick={() => { setPrice(p); setPriceInput(p.toFixed(2).replace(".", ",")); }}
                        className={`rounded-lg border px-4 py-2 text-base font-medium transition hover:border-primary ${price === p ? "border-primary bg-accent text-accent-foreground" : ""}`}
                      >
                        R$ {p.toFixed(2).replace(".", ",")}
                      </button>
                    ))}
                  </div>

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
                  <div className="-mt-4 space-y-6">
                    <div ref={previewRef} data-step3-preview>
                      <EbookPreviewCarousel title={title} subtitle={subtitle} coverUrl={coverUrl} chapters={chapters} />
                    </div>

                    <div className="w-full text-center">
                      <Button
                        onClick={async () => {
                          try {
                            setDownloadingPdf(true);
                            const blob = await generateEbookPdf({ title, subtitle, cover_url: coverUrl, chapters });
                            const safeName = (title || "ebook").replace(/[^a-z0-9-_ ]/gi, "").trim() || "ebook";
                            downloadPdf(blob, `${safeName}.pdf`);
                            toast.success("PDF baixado com sucesso!");
                          } catch (e) {
                            console.error(e);
                            toast.error("Erro ao gerar PDF");
                          } finally {
                            setDownloadingPdf(false);
                          }
                        }}
                        disabled={downloadingPdf}
                        className="mx-auto gradient-primary text-primary-foreground shadow-glow h-12 px-6"
                      >
                        {downloadingPdf ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando PDF...</>
                        ) : (
                          <><Download className="mr-2 h-4 w-4" /> Baixar PDF</>
                        )}
                      </Button>
                    </div>



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
              <div key="step3-container" className="space-y-6 -mt-4">
                <div className="flex flex-col items-center mb-6">
                  <Rocket className="h-7 w-7 mb-2" style={{ color: "#FFFF00" }} />
                  <h2 className="font-display text-xl font-semibold text-center">Configure sua Página de Vendas</h2>
                </div>

                <div className="max-w-xl mx-auto pt-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-base font-medium mb-1.5 block">Título do Ebook</label>
                      <Input 
                        placeholder="Digite o título do ebook" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        className="text-base h-11 shadow-gold"
                      />
                    </div>
                    <div>
                      <label className="text-base font-medium mb-1.5 block">Preço do Ebook</label>
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
                        className="text-base h-11 shadow-gold"
                      />
                    </div>
                    {(() => {
                      const palette = [
                        "#EF4444","#F97316","#EAB308",
                        "#22C55E","#3B82F6","#000000","#FFFFFF",
                      ];
                      const primaryPalette = palette;
                      const secondaryPalette = palette;
                      const Swatches = ({ value, onChange, colors }: { value: string; onChange: (v: string) => void; colors: string[] }) => (
                        <div className="flex flex-wrap justify-center gap-2">
                          {colors.map((c) => {
                            const active = value.toLowerCase() === c.toLowerCase();
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => onChange(c)}
                                aria-label={c}
                                className={`h-6 w-6 rounded-full transition-transform duration-150 cursor-pointer hover:scale-110 active:scale-95 ${active ? "ring-2 ring-offset-2 ring-offset-background ring-primary" : "ring-1 ring-border"}`}
                                style={{ backgroundColor: c }}
                              />
                            );
                          })}
                        </div>
                      );
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="text-center">
                            <label className="text-base font-medium mb-2 block">Cor primária</label>
                            <Swatches value={primaryColor} onChange={setPrimaryColor} colors={primaryPalette} />
                          </div>
                          <div className="text-center">
                            <label className="text-base font-medium mb-2 block">Cor secundária</label>
                            <Swatches value={secondaryColor} onChange={setSecondaryColor} colors={secondaryPalette} />
                          </div>
                        </div>
                      );
                    })()}

                    
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
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="flex flex-col items-center text-center -mt-8">
                  <Megaphone className="h-7 w-7 text-[#FFFF00]" />
                  <h2 className="font-display text-xl font-semibold mt-0 mb-2">Divulgação e Venda</h2>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 space-y-4"
                >
                  <div className="p-6 rounded-lg border border-border bg-card/40 shadow-gold">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-1 text-[#FFFF00]">
                      <Users className="h-5 w-5 text-primary" />
                      Buscar grupos por nicho
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Digite o nicho do seu Ebook.</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Ex: Emagrecimento, Finanças, Marketing Digital..."
                        value={divulgacaoNiche}
                        onChange={(e) => setDivulgacaoNiche(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            searchFacebookGroups();
                          }
                        }}
                        className="flex-1 h-11 text-base"
                      />

                      <Button
                        className="gradient-primary text-primary-foreground shadow-glow gap-2"
                        onClick={searchFacebookGroups}
                      >
                        <Search className="h-4 w-4" />
                        Buscar grupos
                      </Button>
                    </div>
                  </div>


                  <div className="p-5 rounded-xl border border-border shadow-gold">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-1 text-[#FFFF00]">
                      <Quote className="h-5 w-5 text-primary" />
                      Mensagem pronta para Divulgação
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Use esta mensagem persuasiva para aumentar sua conversão.</p>
                    <div className="relative">
                      <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 pb-14 rounded-xl border border-dashed border-primary/20 leading-relaxed">
                        {`Comprei sem grandes expectativas e me surpreendi. O conteúdo é direto ao ponto, fácil de aplicar e entregou exatamente o que eu procurava. Em poucos dias já consegui colocar várias dicas em prática. Recomendo para quem quer aprender de forma rápida e sem complicação. Clique no link abaixo para saber mais !!!!\n\nLink: ${ebookLink}`}
                      </pre>
                      <Button
                        size="sm"
                        className="absolute bottom-3 right-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2"
                        onClick={() => {
                          const text = `Comprei sem grandes expectativas e me surpreendi. O conteúdo é direto ao ponto, fácil de aplicar e entregou exatamente o que eu procurava. Em poucos dias já consegui colocar várias dicas em prática. Recomendo para quem quer aprender de forma rápida e sem complicação. Clique no link abaixo para saber mais !!!!\n\nLink: ${ebookLink}`;
                          navigator.clipboard.writeText(text);
                          toast.success("Mensagem copiada!");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copiar Mensagem
                      </Button>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-1 text-[#FFFF00]">
                      <Video className="h-5 w-5 text-primary" />
                      Vídeos prontos para divulgação
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use estes vídeos persuasivos para gerar interesse nos grupos:
                    </p>
                    <div className="flex flex-col gap-4">
                      {[
                        {
                          title: "Vídeo 1",
                          src: videoDivulgacao1.url,
                          filename: "video-divulgacao-1.mp4",
                          script: "Comprei esse ebook sem muita expectativa, mas me surpreendi. O conteúdo é direto, fácil de aplicar e realmente valeu cada centavo.",
                        },
                        {
                          title: "Vídeo 2",
                          src: videoDivulgacao2.url,
                          filename: "video-divulgacao-2.mp4",
                          script: "Sinceramente, esse ebook superou minhas expectativas. Aprendi coisas que consegui colocar em prática na hora e já vi resultados.",
                        },
                      ].map((v, i) => (
                        <DivulgacaoVideoCard key={i} {...v} />
                      ))}
                    </div>
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
