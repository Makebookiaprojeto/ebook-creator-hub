import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Sparkles, Loader2, Copy, Users, Rocket,
  Search, ChevronDown, Star, Flame, ShieldCheck, Clock, Zap, Quote, Download, FileText, Eye, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { niches, groupTemplates, testimonials } from "@/lib/mockData";
import { toast } from "sonner";
import { useEbooks } from "@/hooks/useEbooks";
import { supabase } from "@/integrations/supabase/client";
import { EbookPreview } from "@/components/EbookPreview";
import { generateEbookPdf, downloadPdf } from "@/lib/ebookPdf";

const steps = ["Nicho", "Preço", "Gerar", "Vendas", "Divulgação"];
const pricePresets = [19.9, 29.9, 39.9, 49.9, 97.0];

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
  const [showAllNiches, setShowAllNiches] = useState(false);
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
  const [openChapter, setOpenChapter] = useState<number | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [coverSearch, setCoverSearch] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [searchTopic, setSearchTopic] = useState("");
  const [ebookLink, setEbookLink] = useState("");
  const [createdEbookSlug, setCreatedEbookSlug] = useState<string | null>(null);
  const [searchedGroups, setSearchedGroups] = useState<FbGroup[]>([]);
  const [searchingGroups, setSearchingGroups] = useState(false);

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
    setOpenChapter(null);
    setPdfUrl(null);
    setIsPublished(false);
    setSearchTopic("");
    setEbookLink("");
    setCreatedEbookSlug(null);
    setSearchedGroups([]);
  };

  // Recovery effect: check for ongoing generations on mount
  useEffect(() => {
    const checkOngoing = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: eb } = await supabase
        .from("ebooks")
        .select("id, niche, audience, generation_status, title, subtitle, cover_url, content_json, status, slug")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Só recupera se for um rascunho ou estiver processando.
      // Se já estiver "published", ignoramos para permitir criar um novo.
      if (eb && eb.status !== "published") {
        setNiche(eb.niche || "");
        setAudience(eb.audience || "");
        setGeneratedEbookId(eb.id);
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
          
          const chs = (eb.content_json as any[]) || [];
          if (chs.length > 0) {
            setChapters(chs.map(c => ({
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

  // Polling logic extracted to be reusable
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
        .select("title, subtitle, cover_url, generation_status, generation_progress, generation_error, content_json, slug")
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
      if (eb.slug) {
        setCreatedEbookSlug(eb.slug);
        setEbookLink(`${window.location.origin}/e/${eb.slug}`);
      }

      const prog: any = eb.generation_progress ?? {};
      if (prog.message) setGenerationStage(prog.message);
      
      const chs = (eb.content_json as any[]) || [];
      if (chs.length > 0) {
        setChapters(
          chs.map((c) => ({
            title: c.title,
            subtitle: "",
            content: c.content ?? "",
            image_url: c.image_url ?? null,
          })),
        );
      }
      
      if (prog.total > 0) {
        setGenerationProgress({ done: prog.done || 0, total: prog.total });
      }

      if (eb.generation_status === "done") {
        setGenerated(true);
        setGenerating(false);
        setGenerationStage("");

        // Marcar ebook como publicado automaticamente ao terminar de gerar
        try {
          await supabase
            .from("ebooks")
            .update({ 
              status: "published",
              is_public: true
            })
            .eq("id", ebookId);
        } catch (pubErr) {
          console.error("Auto publish failed:", pubErr);
        }

        // Automatic PDF generation and delivery if not already done
        if (eb.title && eb.content_json && Array.isArray(eb.content_json) && eb.content_json.length > 0) {
          try {
            console.log("Automatically generating PDF for newly finished ebook...");
            const blob = await generateEbookPdf({
              title: eb.title,
              subtitle: eb.subtitle,
              cover_url: eb.cover_url,
              chapters: (eb.content_json as any[]).map(c => ({
                title: c.title,
                content: c.content,
                image_url: c.image_url
              }))
            });
            
            // Upload to storage so it can be delivered
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const filePath = `${user.id}/${Date.now()}-${eb.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
              const { error: uploadError } = await supabase.storage
                .from("ebook-files")
                .upload(filePath, blob);

              if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage
                  .from("ebook-files")
                  .getPublicUrl(filePath);
                
                await supabase.from("ebooks").update({ pdf_url: publicUrl }).eq("id", ebookId);
                setPdfUrl(publicUrl);
                toast.success("Ebook criado e PDF pronto para entrega!");
              }
            }
          } catch (pdfErr) {
            console.error("Auto PDF generation failed:", pdfErr);
          }
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

  const handleAIError = (status?: number, fallback = "Falha ao gerar com IA", errorText?: string) => {
    if (status === 403 && errorText?.includes("limite mensal")) {
      return toast.error(errorText);
    }
    if (status === 429) return toast.error("Muitas requisições. Aguarde alguns segundos e tente novamente.");
    if (status === 402) return toast.error("Créditos esgotados. Adicione créditos em Configurações > Workspace.");
    toast.error(errorText || fallback);
  };

  const generate = async () => {
    if (!niche.trim()) {
      toast.error("Escolha um nicho primeiro");
      return;
    }
    setGenerating(true);
    setGenerated(false);
    setGenerationStage("Buscando ebook no banco de dados...");
    setGenerationProgress(null);
    setTitle("");
    setSubtitle("");
    setCoverUrl(null);
    setChapters([]);

    try {
      // Look for a template ebook for this niche
      const { data: template, error: fetchErr } = await supabase
        .from("ebooks")
        .select("*")
        .eq("niche", niche)
        .eq("is_template", true)
        .limit(1)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (!template) {
        setGenerating(false);
        toast.error("Ebook ainda não disponível para este nicho");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Clone the template for the current user
      const { data: newEbook, error: cloneErr } = await supabase
        .from("ebooks")
        .insert({
          user_id: user.id,
          title: template.title,
          subtitle: template.subtitle,
          description: template.description,
          category: template.category,
          niche: template.niche,
          audience: audience || template.audience,
          cover_url: template.cover_url,
          status: "published",
          is_public: true,
          content_json: template.content_json,
          pdf_url: template.pdf_url,
          price: price || 29.9,
          slug: `${template.slug || 'ebook'}-${Math.random().toString(36).substring(2, 7)}`,
          generation_status: "done"
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

      const chs = (newEbook.content_json as any[]) || [];
      setChapters(chs.map(c => ({
        title: c.title,
        subtitle: "",
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

  const handleGeneratePdf = async () => {
    if (!title) return toast.error("Gere o conteúdo primeiro");
    setGeneratingPdf(true);
    try {
      const blob = await generateEbookPdf({
        title,
        subtitle,
        cover_url: coverUrl,
        chapters: chapters.map(c => ({
          title: c.title,
          content: c.content,
          image_url: c.image_url
        }))
      });
      downloadPdf(blob, title);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const searchGroups = () => {
    const topic = searchTopic.trim();
    if (!topic) {
      toast.error("Digite o assunto do seu ebook primeiro");
      return;
    }
    setSearchingGroups(true);
    
    if (createdEbookSlug) {
      setEbookLink(`${window.location.origin}/e/${createdEbookSlug}`);
    }
    
    setTimeout(() => {
      // Simula uma busca interna para não ser bloqueado pelo popup
      const results: FbGroup[] = [
        { name: `Grupos de ${topic}`, members: 0, engagement: "Frequente" }
      ];
      setSearchedGroups(results);
      setSearchingGroups(false);
      toast.success("Busca preparada! Clique no botão abaixo para ver no Facebook.");
    }, 600);
  };

  const promoTemplates = (topic: string, link: string) => [
    {
      title: "🔥 Gancho de Curiosidade (Alto Engajamento)",
      content: `Gente, eu tô sem acreditar no que acabei de descobrir sobre ${topic || "[ASSUNTO]"}. 😱\n\nSempre achei que era impossível ter resultados rápidos nessa área, mas esse material que encontrei mudou tudo. Não é curso, é um passo a passo prático que vai direto ao ponto.\n\nLiberei o acesso aqui pra quem também quer virar o jogo: ${link}\n\nAproveitem enquanto o link ainda tá ativo! 🚀`,
    },
    {
      title: "✨ Autoridade e Prova Social",
      content: `Você também sente que está estagnado em ${topic || "[ASSUNTO]"}? 😰\n\nDepois de testar de tudo, finalmente encontrei o método que as grandes autoridades usam (e não contam pra ninguém). Esse ebook é praticamente um mapa do tesouro pra quem busca resultados reais e profissionais.\n\nConfira os detalhes aqui 👉 ${link}\n\nPS: A garantia de 7 dias me deu a segurança que eu precisava pra começar. Vale cada centavo!`,
    },
    {
      title: "💡 Educativo e Resolutivo (Ideal para Grupos)",
      content: `Dica de ouro para o grupo! 💡\n\nMuita gente me pergunta como resolver [DOR COMUM EM ${topic || "ESTE NICHO"}]. A resposta curta? Estratégia.\n\nEncontrei este guia completo de ${topic || "[ASSUNTO]"} que desmistifica todo o processo. Se você quer parar de perder tempo e começar a fazer do jeito certo, esse é o caminho.\n\nLink do material: ${link}\n\nBons estudos! 📚`,
    },
    {
      title: "🎯 Oferta Irresistível (Escassez)",
      content: `ALERTA DE OPORTUNIDADE! ⚡\n\nConsegui um link exclusivo com desconto para o melhor ebook de ${topic || "[ASSUNTO]"} do mercado. O conteúdo é denso, prático e focado em gerar lucro/resultado rápido.\n\nNão sei por quanto tempo esse valor promocional vai durar, então corre lá: ${link}\n\nQuem chegar primeiro leva os bônus exclusivos! 🏃💨`,
    },
  ];


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
        <p className="mt-1 text-muted-foreground">Siga as etapas e publique seu ebook em minutos.</p>
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
                <h2 className="font-display text-xl font-semibold">Escolha seu nicho</h2>
                <p className="mt-1 text-sm text-muted-foreground">Selecione um nicho ou digite o seu próprio.</p>
                <Input
                  className="mt-4"
                  placeholder="Ex: Yoga para iniciantes"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                />

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {(showAllNiches ? niches : niches.slice(0, 7)).map((n) => (
                    <button
                      key={n.name}
                      onClick={() => setNiche(n.name)}
                      className={`group rounded-xl border p-4 text-left transition hover:shadow-md hover:-translate-y-0.5 ${
                        niche === n.name ? "border-primary bg-accent shadow-glow" : "hover:border-primary/40"
                      }`}
                    >
                      <div className="text-2xl">{n.emoji}</div>
                      <p className="mt-2 font-semibold text-sm">{n.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{n.desc}</p>
                    </button>
                  ))}
                  {!showAllNiches && niches.length > 7 && (
                    <button
                      onClick={() => setShowAllNiches(true)}
                      className="group rounded-xl border border-dashed p-4 text-left transition hover:border-primary hover:bg-accent/40 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="text-2xl">➕</div>
                      <p className="mt-2 font-semibold text-sm">Entre outros</p>
                      <p className="mt-1 text-xs text-muted-foreground">Ver mais {niches.length - 7} nichos</p>
                    </button>
                  )}
                </div>

                <div className="mt-8">
                  <label className="text-sm font-semibold">
                    Quem é o público-alvo do seu ebook? <span className="text-muted-foreground font-normal">(opcional, mas recomendado)</span>
                  </label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Descreva idade, interesses, dores e objetivos para personalizar seu ebook.
                  </p>
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
                        onClick={() => {
                          setPrice(p);
                          setPriceInput(p.toFixed(2).replace(".", ","));
                        }}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition hover:border-primary ${
                          price === p ? "border-primary bg-accent text-accent-foreground" : ""
                        }`}
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
                <h2 className="font-display text-xl font-semibold">Gerar Ebook</h2>
                <p className="mt-1 text-sm text-muted-foreground">O sistema buscará um ebook pronto correspondente ao seu nicho.</p>

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
                          <div
                            className="h-full gradient-primary transition-all duration-500"
                            style={{ width: `${Math.max(5, (generationProgress.done / generationProgress.total) * 100)}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {generationProgress.done} de {generationProgress.total} capítulos
                        </p>
                      </div>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">Pode levar 1-3 minutos. Estamos criando capa, capítulos e ilustrações em alta qualidade.</p>
                  </div>
                )}


                {generated && (
                  <div className="mt-6 space-y-6">

                    {/* Quick stats + actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-gradient-to-br from-accent/40 to-transparent p-4">
                      <div className="flex items-center gap-3">
                        {coverUrl ? (
                          <img src={coverUrl} alt="capa" className="h-16 w-12 rounded-md object-cover shadow-md" />
                        ) : (
                          <div className="h-16 w-12 rounded-md bg-muted animate-pulse" />
                        )}
                        <div>
                          <p className="font-display text-sm font-bold leading-tight line-clamp-2">{title}</p>
                          <p className="text-xs text-muted-foreground">{chapters.length} capítulos</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => setShowFullPreview((v) => !v)}>
                          <Eye className="mr-2 h-3.5 w-3.5" /> {showFullPreview ? "Fechar preview" : "Preview completo"}
                        </Button>
                      </div>
                    </div>

                    {showFullPreview ? (
                      <EbookPreview title={title} subtitle={subtitle} coverUrl={coverUrl} chapters={chapters} />
                    ) : (
                      <>
                        <div>
                          <label className="text-xs font-medium uppercase text-muted-foreground">Título</label>
                          <div className="mt-1.5 p-3 rounded-lg border bg-muted/20 font-display text-lg font-semibold">
                            {title}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase text-muted-foreground">Subtítulo</label>
                          <div className="mt-1.5 p-3 rounded-lg border bg-muted/20">
                            {subtitle}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase text-muted-foreground">Capítulos ({chapters.length})</label>
                          <p className="text-xs text-muted-foreground mt-1">Clique em um capítulo para ver o conteúdo completo.</p>
                          <div className="mt-2 space-y-2">
                            {chapters.map((c, i) => {
                              const isOpen = openChapter === i;
                              return (
                                <div key={i} className="rounded-xl border bg-background overflow-hidden">
                                  <button
                                    onClick={() => setOpenChapter(isOpen ? null : i)}
                                    className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-muted/40"
                                  >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-semibold text-accent-foreground">
                                      {i + 1}
                                    </span>
                                    {c.image_url && (
                                      <img src={c.image_url} alt="" className="h-7 w-7 rounded object-cover" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">
                                        {c.title}
                                      </div>
                                      {c.subtitle && (
                                        <p className="text-xs text-muted-foreground line-clamp-1">{c.subtitle}</p>
                                      )}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                  </button>
                                  <AnimatePresence initial={false}>
                                    {isOpen && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="border-t p-4 bg-muted/20">
                                          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                                            {c.content}
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="font-display text-xl font-semibold">Página de vendas</h2>
                <p className="mt-1 text-sm text-muted-foreground">Preview da landing page de alta conversão.</p>

                <div className="mt-6 overflow-hidden rounded-2xl border">
                  {/* Top urgency bar */}
                  <div className="bg-destructive text-destructive-foreground py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2">
                    <Flame className="h-3.5 w-3.5" /> OFERTA RELÂMPAGO • 50% OFF • RESTAM POUCAS UNIDADES
                  </div>

                  {/* Hero — high-conversion red/orange palette */}
                  <div className="gradient-conversion-soft p-8 sm:p-12 text-center relative overflow-hidden">
                    <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive shadow-conversion">
                      <Zap className="mr-1 h-3 w-3" /> PROMOÇÃO ATIVA
                    </Badge>
                    <h1 className="mx-auto mt-4 max-w-2xl font-display text-3xl sm:text-5xl font-bold leading-tight">
                      {title || "Seu título aparecerá aqui"}
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
                      {subtitle || "Seu subtítulo persuasivo vai aqui"}
                    </p>

                    {chapters.length > 0 && (
                      <div className="mx-auto mt-6 max-w-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                          {chapters.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <Check className="h-3 w-3 text-success" />
                              <span className="line-clamp-1">{c.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mock cover */}
                    <div className="mt-6 flex justify-center">
                      <div className="relative w-44 h-60 rounded-lg gradient-conversion shadow-conversion flex items-center justify-center text-white p-4 rotate-[-4deg]">
                        <div className="text-center">
                          <Sparkles className="h-6 w-6 mx-auto opacity-90" />
                          <p className="mt-2 font-display font-bold text-sm leading-tight line-clamp-4">{title || "Ebook"}</p>
                          <p className="mt-2 text-[10px] opacity-90">EBOOK DIGITAL</p>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-8">
                      <p className="text-xs text-muted-foreground line-through">De R$ {(price * 2).toFixed(2).replace(".", ",")}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Por apenas</p>
                      <p className="mt-1 font-display text-5xl font-bold text-gradient-conversion">
                        R$ {price.toFixed(2).replace(".", ",")}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">ou 12x sem juros no cartão</p>
                    </div>

                    <div className="mt-6 flex flex-col items-center gap-3">
                      <Button size="lg" className="gradient-conversion text-white shadow-conversion text-base px-8 py-6 hover:opacity-95 animate-pulse">
                        🛒 QUERO COMPRAR AGORA
                      </Button>
                      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-success" /> Garantia 7 dias</span>
                        <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-warning" /> Acesso imediato</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-destructive" /> Oferta termina em 24h</span>
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="border-t bg-card p-8">
                    <h3 className="font-display text-2xl font-bold text-center">O que você vai aprender</h3>
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {(chapters.length ? chapters.map(c => c.title) : ["Benefício 1", "Benefício 2", "Benefício 3", "Benefício 4", "Benefício 5", "Benefício 6", "Benefício 7"]).slice(0, 7).map((b, i) => (
                        <li key={i} className="flex items-start gap-3 rounded-xl border bg-background p-3 text-sm">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/10">
                            <Check className="h-4 w-4 text-success" />
                          </div>
                          <span className="font-medium">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Testimonials */}
                  <div className="border-t bg-muted/30 p-8">
                    <div className="text-center">
                      <Badge className="bg-warning/20 text-warning border-warning/30 hover:bg-warning/20">⭐ AVALIAÇÃO 4.9/5</Badge>
                      <h3 className="mt-3 font-display text-2xl font-bold">+2.847 alunos transformados</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Veja o que dizem quem já comprou</p>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      {testimonials.map((t) => (
                        <div key={t.name} className="rounded-xl border bg-card p-5 shadow-soft">
                          <Quote className="h-5 w-5 text-primary opacity-40" />
                          <p className="mt-2 text-sm leading-relaxed">"{t.text}"</p>
                          <div className="mt-3 flex gap-0.5">
                            {Array.from({ length: t.rating }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                            ))}
                          </div>
                          <div className="mt-3 flex items-center gap-2.5 border-t pt-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground">
                              {t.avatar}
                            </div>
                            <div>
                              <p className="text-xs font-semibold">{t.name}</p>
                              <p className="text-[11px] text-muted-foreground">{t.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final CTA */}
                  <div className="border-t gradient-conversion-soft p-8 text-center">
                    <h3 className="font-display text-2xl font-bold">Não perca essa oportunidade</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                      Garante seu acesso agora com desconto exclusivo + bônus surpresa.
                    </p>
                    <Button size="lg" className="mt-5 gradient-conversion text-white shadow-conversion text-base px-8 py-6 hover:opacity-95">
                      🔥 GARANTIR MINHA VAGA POR R$ {price.toFixed(2).replace(".", ",")}
                    </Button>
                    <p className="mt-3 text-[11px] text-muted-foreground">🔒 Compra 100% segura • Garantia incondicional de 7 dias</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1 gradient-primary text-primary-foreground shadow-glow"
                    onClick={() => {
                      setIsPublished(true);
                      toast.success("Página publicada! 🚀");
                    }}
                  >
                    <Rocket className="mr-2 h-4 w-4" /> Publicar página
                  </Button>
                  
                  {isPublished && (
                    <Button
                      variant="outline"
                      className="flex-1 border-primary/20 hover:bg-primary/5 gap-2"
                      onClick={() => {
                        // Usamos sessionStorage para passar os dados do preview sem estourar o limite da URL (HTTP 414)
                        const previewData = {
                          title,
                          subtitle,
                          price,
                          chapters: chapters.map(c => ({ title: c.title, content: c.content }))
                        };
                        sessionStorage.setItem('ebook_preview_data', JSON.stringify(previewData));
                        window.open(`${window.location.origin}/e/preview`, '_blank');
                      }}
                    >
                      <Eye className="h-4 w-4" /> Ver na Web
                    </Button>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="font-display text-xl font-semibold">Divulgação</h2>
                <p className="mt-1 text-sm text-muted-foreground">Encontre grupos relevantes e gere mensagens prontas.</p>

                {/* Search box */}
                <div className="mt-6 rounded-2xl border bg-muted/30 p-5">
                  <label className="text-sm font-semibold">Qual o assunto do seu ebook?</label>
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Ex: emagrecimento saudável, marketing digital..."
                        value={searchTopic}
                        onChange={(e) => setSearchTopic(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        if (!searchTopic.trim()) return toast.error("Digite o assunto primeiro");
                        setSearchedGroups([{ name: "Ready", members: 0, engagement: "" }]);
                        toast.success("Links de busca gerados!");
                      }} 
                      className="gradient-primary text-primary-foreground shadow-glow"
                    >
                      <Zap className="mr-2 h-4 w-4" /> Gerar Links de Busca
                    </Button>
                  </div>
                </div>

                {/* Sales Link Section */}
                <div className="mt-6 rounded-2xl border bg-primary/5 p-5 border-primary/20">
                  <div className="flex items-center gap-2 text-primary">
                    <Globe className="h-5 w-5" />
                    <h3 className="font-display font-bold">Seu link de vendas</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ebookLink 
                      ? "Este é o link da página que seus clientes usarão para comprar o ebook."
                      : "O link está sendo gerado. Ele aparecerá aqui automaticamente assim que a criação for concluída."}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Input 
                      readOnly 
                      value={ebookLink || "Aguardando conclusão..."}
                      className="bg-background text-xs h-10"
                    />
                    <Button 
                      disabled={!ebookLink}
                      className="gradient-primary text-primary-foreground shadow-glow h-10"
                      onClick={() => {
                        if (ebookLink) {
                          navigator.clipboard.writeText(ebookLink);
                          toast.success("Link de vendas copiado!");
                        }
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copiar Link
                    </Button>
                  </div>
                </div>

                {/* Manual Search Links */}
                {searchedGroups.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-xl border bg-card p-5 space-y-4">
                      <div className="flex items-center gap-3 text-blue-600">
                        <Users className="h-5 w-5" />
                        <h3 className="font-bold">Busca Manual no Facebook</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Link da Busca</p>
                        <div className="flex items-center gap-2">
                          <Input 
                            readOnly 
                            value={`https://www.facebook.com/groups/search/groups/?q=${encodeURIComponent(searchTopic)}`}
                            className="bg-muted/50 text-xs"
                          />
                          <Button 
                            className="gradient-primary text-primary-foreground shadow-glow shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(`https://www.facebook.com/groups/search/groups/?q=${encodeURIComponent(searchTopic)}`);
                              toast.success("Link copiado! Cole no seu navegador.");
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" /> Copiar Link
                          </Button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Promo messages */}
                <div className="mt-8">
                  <h3 className="font-display text-base font-semibold">Mensagens prontas para divulgação</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {searchTopic ? `Personalizadas para "${searchTopic}"` : "Digite o assunto acima para personalizar as mensagens"}.
                  </p>
                  <div className="mt-3 space-y-3">
                    {promoTemplates(searchTopic, ebookLink).map((m, i) => (
                      <div key={i} className="rounded-xl border bg-card p-5 space-y-3 transition hover:border-primary/40 hover:shadow-soft">
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{m.title}</span>
                          <Badge variant="outline" className="text-[9px] font-bold">RECOMENDADO</Badge>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap italic">"{m.content}"</p>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            className="h-8 gradient-primary text-primary-foreground shadow-glow"
                            onClick={() => {
                              navigator.clipboard.writeText(m.content);
                              toast.success("Mensagem profissional copiada!");
                            }}
                          >
                            <Copy className="mr-2 h-3.5 w-3.5" /> Copiar Mensagem
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={prev} disabled={step === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={next} className="gradient-primary text-primary-foreground shadow-glow">
            Continuar <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={async () => {
              if (!title) {
                toast.error("Gere ou preencha o título antes de finalizar");
                return;
              }
              try {
                setSaving(true);

                if (generatedEbookId) {
                  // Ebook já existe (gerado em background). Atualiza + publica + sincroniza capítulos editados.
                  const { data: updated, error: updErr } = await supabase
                    .from("ebooks")
                    .update({
                      title,
                      subtitle,
                      description: subtitle,
                      category: niche,
                      niche,
                      audience,
                      cover_url: coverUrl,
                      status: "published",
                      is_public: true,
                      pdf_url: pdfUrl,
                      price: price
                    } as any)
                    .eq("id", generatedEbookId)
                    .select("slug")
                    .single();
                  if (updErr) throw updErr;

                  // Sincroniza edições nos capítulos
                  const { data: existingChs } = await supabase
                    .from("chapters")
                    .select("id, order_index")
                    .eq("ebook_id", generatedEbookId)
                    .order("order_index", { ascending: true });
                  
                  if (existingChs && chapters.length > 0) {
                    await Promise.all(
                      chapters.map((c, i) => {
                        const row = existingChs[i];
                        if (!row) return Promise.resolve();
                        return supabase
                          .from("chapters")
                          .update({ title: c.title, content: c.content, image_url: c.image_url })
                          .eq("id", row.id);
                      }),
                    );
                  }

                  if (updated?.slug) {
                    setCreatedEbookSlug(updated.slug);
                    setEbookLink(`${window.location.origin}/e/${updated.slug}`);
                  }
                } else {
                  // Fluxo legado (sem geração assíncrona)
                  const res = await createEbookWithChapters(
                    {
                      title,
                      subtitle,
                      description: subtitle,
                      category: niche,
                      niche,
                      audience,
                      cover_url: coverUrl,
                      status: "published",
                      pdf_url: pdfUrl,
                      price: price,
                      is_public: true
                    },
                    chapters,
                  );
                  if (res?.slug) {
                    setCreatedEbookSlug(res.slug);
                    setEbookLink(`${window.location.origin}/e/${res.slug}`);
                  }
                }
                toast.success("Ebook finalizado com sucesso! Redirecionando...");
                
                // Aguarda um pouco para o usuário ver a mensagem e o link ser gerado antes de limpar/sair
                setTimeout(() => {
                  resetForm();
                  // Força um "refresh" na visualização enviando o usuário para a dashboard/biblioteca 
                  // ou apenas limpando o estado para um novo ebook
                  window.location.href = "/";
                }, 2000);
              } catch (e: any) {
                console.error("Save error:", e);
                toast.error(e.message ?? "Erro ao salvar ebook");
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="gradient-primary text-primary-foreground shadow-glow"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Finalizar e salvar
          </Button>
        )}
      </div>
    </div>
  );
}
