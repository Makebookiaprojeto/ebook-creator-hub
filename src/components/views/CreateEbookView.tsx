import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Sparkles, Loader2, Copy, Users, Rocket,
  Search, ChevronDown, Star, Flame, ShieldCheck, Clock, Zap, Quote, Download, FileText, Eye
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
  const [openChapter, setOpenChapter] = useState<number | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Divulgação
  const [searchTopic, setSearchTopic] = useState("");
  const [ebookLink, setEbookLink] = useState("https://meuebook.com/oferta");
  const [searchedGroups, setSearchedGroups] = useState<FbGroup[]>([]);
  const [searchingGroups, setSearchingGroups] = useState(false);

  const handleAIError = (status?: number, fallback = "Falha ao gerar com IA") => {
    if (status === 429) return toast.error("Muitas requisições. Aguarde alguns segundos e tente novamente.");
    if (status === 402) return toast.error("Créditos esgotados. Adicione créditos em Configurações > Workspace.");
    toast.error(fallback);
  };

  const generate = async () => {
    if (!niche.trim()) {
      toast.error("Escolha um nicho primeiro");
      return;
    }
    setGenerating(true);
    setGenerationStage("Analisando o nicho...");
    try {
      // 1) Structure
      const { data: structure, error: sErr } = await supabase.functions.invoke("generate-ebook", {
        body: { mode: "structure", niche, audience },
      });
      if (sErr || !structure) {
        handleAIError((sErr as any)?.context?.status, "Falha ao gerar estrutura");
        return;
      }
      setTitle(structure.title);
      setSubtitle(structure.subtitle);
      const chapterDefs: { title: string; subtitle: string }[] = structure.chapters;
      setChapters(
        chapterDefs.map((c) => ({ title: c.title, subtitle: c.subtitle, content: "", image_url: null })),
      );
      setGenerated(true);
      setGenerationStage(`Escrevendo ${chapterDefs.length} capítulos e gerando imagens...`);

      // 2) Chapter contents (parallel)
      const contentPromise = Promise.all(
        chapterDefs.map((c, idx) =>
          supabase.functions.invoke("generate-ebook", {
            body: {
              mode: "chapter",
              ebookTitle: structure.title,
              audience,
              chapterTitle: c.title,
              chapterSubtitle: c.subtitle,
              chapterIndex: idx,
              totalChapters: chapterDefs.length,
            },
          }),
        ),
      );

      // 3) Cover image (parallel with chapters)
      const coverPromise = supabase.functions.invoke("generate-ebook", {
        body: { mode: "image", kind: "cover", prompt: structure.cover_prompt },
      });

      // 4) Chapter images (parallel)
      const chapterImagesPromise = Promise.all(
        chapterDefs.map((c) =>
          supabase.functions.invoke("generate-ebook", {
            body: {
              mode: "image",
              kind: "chapter",
              prompt: `${c.title} — ${c.subtitle}`,
            },
          }),
        ),
      );

      const [contents, coverRes, chapterImages] = await Promise.all([
        contentPromise,
        coverPromise,
        chapterImagesPromise,
      ]);

      if (coverRes.data?.url) setCoverUrl(coverRes.data.url);

      const filled: ChapterDraft[] = chapterDefs.map((c, i) => ({
        title: c.title,
        subtitle: c.subtitle,
        content: contents[i].data?.content ?? "Conteúdo não gerado.",
        image_url: chapterImages[i].data?.url ?? null,
      }));
      setChapters(filled);
      setGenerationStage("");
      toast.success("Ebook completo gerado com IA! 🎉");
    } catch (e) {
      console.error(e);
      toast.error("Erro inesperado ao gerar ebook");
    } finally {
      setGenerating(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!title || chapters.length === 0) {
      toast.error("Gere o ebook primeiro");
      return;
    }
    setGeneratingPdf(true);
    try {
      const blob = await generateEbookPdf({
        title,
        subtitle,
        cover_url: coverUrl,
        chapters,
      });
      downloadPdf(blob, title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").slice(0, 60));
      toast.success("PDF gerado!");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao gerar PDF");
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
    setTimeout(() => {
      const capitalized = topic
        .split(" ")
        .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
        .join(" ");
      const results: FbGroup[] = groupTemplates.map((tpl) => ({
        name: `${capitalized} ${tpl.suffix}`,
        members: Math.round(tpl.base * (0.6 + Math.random() * 0.8)),
        engagement: tpl.engagement,
      }));
      setSearchedGroups(results);
      setSearchingGroups(false);
      toast.success(`${results.length} grupos abertos encontrados para "${topic}"`);
    }, 1200);
  };

  const promoTemplates = (topic: string, link: string) => [
    `🔥 Pessoal, acabei de encontrar o melhor material sobre ${topic || "[ASSUNTO]"} que já vi! Mudou meu jogo completamente. Dá uma olhada: ${link}`,
    `✨ Você luta com ${topic || "[ASSUNTO]"}? Descobri um ebook passo a passo que resolve isso de verdade. Recomendo demais 👉 ${link}`,
    `💡 Se você quer dominar ${topic || "[ASSUNTO]"} sem perder tempo, esse material é OBRIGATÓRIO. Vale cada centavo: ${link}`,
    `🎯 Estou aplicando o método deste ebook de ${topic || "[ASSUNTO]"} e os resultados são reais. Quem quiser, segue o link: ${link}`,
    `⚡ Promoção especial por tempo limitado! O melhor ebook de ${topic || "[ASSUNTO]"} com desconto. Garanta agora 👉 ${link}`,
  ];

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

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
                    Descreva idade, interesses, dores e objetivos. Quanto mais específico, melhor a IA gera o conteúdo.
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
                <h2 className="font-display text-xl font-semibold">Gerar com IA</h2>
                <p className="mt-1 text-sm text-muted-foreground">Nossa IA criará a estrutura completa do seu ebook.</p>

                {!generated && !generating && (
                  <div className="mt-10 flex flex-col items-center justify-center rounded-2xl gradient-hero p-10 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
                      <Sparkles className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <p className="mt-4 font-display text-lg font-semibold">Pronto para a mágica?</p>
                    <p className="mt-1 text-sm text-muted-foreground">Vamos gerar título, subtítulo e capítulos.</p>
                    <Button onClick={generate} size="lg" className="mt-6 gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                      <Sparkles className="mr-2 h-4 w-4" /> Gerar com IA
                    </Button>
                  </div>
                )}

                {generating && (
                  <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="mt-4 font-medium">Gerando seu ebook...</p>
                    <p className="mt-1 text-sm text-muted-foreground">{generationStage || "Trabalhando..."}</p>
                    <p className="mt-3 text-xs text-muted-foreground">Pode levar 30-60 segundos. Estamos criando capa, capítulos e ilustrações.</p>
                  </div>
                )}

                {generated && (
                  <div className="mt-6 space-y-4">
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
                        <Button size="sm" variant="outline" onClick={generate}>
                          <Sparkles className="mr-2 h-3.5 w-3.5" /> Regenerar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleGeneratePdf}
                          disabled={generatingPdf}
                          className="gradient-primary text-primary-foreground shadow-glow"
                        >
                          {generatingPdf ? (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-3.5 w-3.5" />
                          )}
                          Gerar PDF
                        </Button>
                      </div>
                    </div>

                    {showFullPreview ? (
                      <EbookPreview title={title} subtitle={subtitle} coverUrl={coverUrl} chapters={chapters} />
                    ) : (
                      <>
                        <div>
                          <label className="text-xs font-medium uppercase text-muted-foreground">Título</label>
                          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 font-display text-lg font-semibold" />
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase text-muted-foreground">Subtítulo</label>
                          <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="mt-1.5" />
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase text-muted-foreground">Capítulos</label>
                          <p className="text-xs text-muted-foreground mt-1">Clique em um capítulo para ver e editar o conteúdo completo.</p>
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
                                      <Input
                                        value={c.title}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                          const copy = [...chapters];
                                          copy[i] = { ...copy[i], title: e.target.value };
                                          setChapters(copy);
                                        }}
                                        className="border-0 shadow-none focus-visible:ring-0 px-0 h-7 font-medium"
                                      />
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
                                          <label className="text-[11px] font-medium uppercase text-muted-foreground">Conteúdo do capítulo</label>
                                          <Textarea
                                            value={c.content}
                                            onChange={(e) => {
                                              const copy = [...chapters];
                                              copy[i] = { ...copy[i], content: e.target.value };
                                              setChapters(copy);
                                            }}
                                            className="mt-2 min-h-[260px] text-sm leading-relaxed bg-background"
                                          />
                                          <div className="mt-3 flex justify-end">
                                            <Button size="sm" variant="outline" onClick={() => setOpenChapter(null)}>
                                              <Check className="mr-2 h-3.5 w-3.5" /> Salvar capítulo
                                            </Button>
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
                      {(chapters.length ? chapters.map(c => c.title) : ["Benefício 1", "Benefício 2", "Benefício 3"]).slice(0, 6).map((b, i) => (
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

                <Button
                  className="mt-6 w-full gradient-primary text-primary-foreground shadow-glow sm:w-auto"
                  onClick={() => toast.success("Página publicada! 🚀")}
                >
                  <Rocket className="mr-2 h-4 w-4" /> Publicar página
                </Button>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="font-display text-xl font-semibold">Divulgação</h2>
                <p className="mt-1 text-sm text-muted-foreground">Encontre grupos relevantes e gere mensagens prontas.</p>

                {/* Search box */}
                <div className="mt-6 rounded-2xl border bg-muted/30 p-5">
                  <label className="text-sm font-semibold">Qual o assunto do seu ebook?</label>
                  <p className="mt-1 text-xs text-muted-foreground">Buscaremos grupos do Facebook coerentes com o seu tema.</p>
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Ex: emagrecimento saudável, marketing digital, finanças pessoais..."
                        value={searchTopic}
                        onChange={(e) => setSearchTopic(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button onClick={searchGroups} disabled={searchingGroups} className="gradient-primary text-primary-foreground shadow-glow">
                      {searchingGroups ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="mr-2 h-4 w-4" /> Buscar grupos</>}
                    </Button>
                  </div>

                  <div className="mt-3">
                    <label className="text-xs text-muted-foreground">Link do seu ebook</label>
                    <Input
                      value={ebookLink}
                      onChange={(e) => setEbookLink(e.target.value)}
                      className="mt-1 bg-background"
                    />
                  </div>
                </div>

                {/* Groups results */}
                {searchedGroups.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-display text-base font-semibold">Grupos encontrados para "{searchTopic}"</h3>
                    <div className="mt-3 space-y-3">
                      {searchedGroups.map((g) => (
                        <div key={g.name} className="flex items-center justify-between rounded-xl border bg-background p-4 transition hover:shadow-md">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{g.name}</p>
                              <p className="text-xs text-muted-foreground">{g.members.toLocaleString("pt-BR")} membros • {g.engagement} engajamento</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => toast.success("Link do grupo copiado!")}>
                            <Copy className="mr-2 h-3.5 w-3.5" /> Copiar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promo messages */}
                <div className="mt-8">
                  <h3 className="font-display text-base font-semibold">Mensagens prontas para divulgação</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {searchTopic ? `Personalizadas para "${searchTopic}"` : "Digite o assunto acima para personalizar as mensagens"} — já incluem o link do seu ebook.
                  </p>
                  <div className="mt-3 space-y-3">
                    {promoTemplates(searchTopic, ebookLink).map((m, i) => (
                      <div key={i} className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{m}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(m);
                            toast.success("Texto copiado!");
                          }}
                        >
                          <Copy className="mr-1.5 h-3 w-3" /> Copiar mensagem
                        </Button>
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
                await createEbookWithChapters(
                  { title, description: subtitle, category: niche, status: "published" },
                  chapters,
                );
                toast.success("Ebook salvo com sucesso! 🎉");
              } catch (e: any) {
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
