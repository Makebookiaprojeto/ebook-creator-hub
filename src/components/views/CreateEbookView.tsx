import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2, Copy, Users, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { niches, facebookGroups, promoMessages } from "@/lib/mockData";
import { toast } from "sonner";

const steps = ["Nicho", "Preço", "Gerar", "Vendas", "Divulgação"];

export function CreateEbookView() {
  const [step, setStep] = useState(0);
  const [niche, setNiche] = useState("");
  const [price, setPrice] = useState(47);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setTitle(`O Guia Definitivo de ${niche || "Sucesso"}`);
      setSubtitle(`Como dominar ${niche.toLowerCase() || "o mercado"} em 30 dias mesmo começando do zero`);
      setChapters([
        `Introdução ao mundo de ${niche || "novos negócios"}`,
        "Os 5 erros que iniciantes cometem",
        "Estratégias comprovadas pelos top 1%",
        "O método passo a passo",
        "Ferramentas essenciais",
        "Como escalar seus resultados",
        "Conclusão e próximos passos",
      ]);
      setGenerating(false);
      setGenerated(true);
      toast.success("Ebook gerado com sucesso!");
    }, 2200);
  };

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
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {niches.map((n) => (
                    <button
                      key={n.name}
                      onClick={() => setNiche(n.name)}
                      className={`group rounded-xl border p-4 text-left transition hover:shadow-md hover:-translate-y-0.5 ${
                        niche === n.name ? "border-primary bg-accent shadow-glow" : "hover:border-primary/40"
                      }`}
                    >
                      <div className="text-2xl">{n.emoji}</div>
                      <p className="mt-2 font-semibold text-sm">{n.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{n.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="font-display text-xl font-semibold">Defina o preço</h2>
                <p className="mt-1 text-sm text-muted-foreground">Sugestão para "{niche || "seu nicho"}": R$29 — R$97</p>

                <div className="mt-8 flex flex-col items-center">
                  <div className="text-sm text-muted-foreground">Preço de venda</div>
                  <div className="mt-2 font-display text-6xl font-bold text-gradient">R$ {price}</div>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value) || 0)}
                    className="mt-4 w-32 text-center text-lg font-semibold"
                  />
                </div>

                <div className="mt-8">
                  <Slider value={[price]} min={9} max={297} step={1} onValueChange={(v) => setPrice(v[0])} />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>R$ 9</span>
                    <span>R$ 297</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[27, 47, 97].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPrice(p)}
                      className={`rounded-xl border p-3 text-sm font-medium transition hover:border-primary ${
                        price === p ? "border-primary bg-accent" : ""
                      }`}
                    >
                      R$ {p}
                    </button>
                  ))}
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
                    <p className="mt-1 text-sm text-muted-foreground">Analisando o nicho • Criando estrutura • Refinando</p>
                  </div>
                )}

                {generated && (
                  <div className="mt-6 space-y-4">
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
                      <div className="mt-1.5 space-y-2">
                        {chapters.map((c, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-xl border bg-background p-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-semibold text-accent-foreground">
                              {i + 1}
                            </span>
                            <Input
                              value={c}
                              onChange={(e) => {
                                const copy = [...chapters];
                                copy[i] = e.target.value;
                                setChapters(copy);
                              }}
                              className="border-0 shadow-none focus-visible:ring-0 px-0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="font-display text-xl font-semibold">Página de vendas</h2>
                <p className="mt-1 text-sm text-muted-foreground">Preview da landing page do seu ebook.</p>

                <div className="mt-6 overflow-hidden rounded-2xl border">
                  <div className="gradient-hero p-8 sm:p-12 text-center">
                    <Badge className="bg-accent text-accent-foreground hover:bg-accent">⚡ Lançamento</Badge>
                    <h1 className="mx-auto mt-4 max-w-2xl font-display text-3xl sm:text-4xl font-bold leading-tight">
                      {title || "Seu título aparecerá aqui"}
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                      {subtitle || "Seu subtítulo persuasivo vai aqui"}
                    </p>
                    <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                      <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
                        Comprar por R$ {price}
                      </Button>
                      <span className="text-xs text-muted-foreground">✓ Acesso imediato • Garantia 7 dias</span>
                    </div>
                  </div>
                  <div className="border-t bg-card p-8">
                    <h3 className="font-display text-lg font-semibold">O que você vai aprender</h3>
                    <ul className="mt-4 space-y-2.5">
                      {(chapters.length ? chapters : ["Benefício 1", "Benefício 2", "Benefício 3"]).slice(0, 5).map((b, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
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
                <p className="mt-1 text-sm text-muted-foreground">Grupos do Facebook recomendados para o seu nicho.</p>

                <div className="mt-6 space-y-3">
                  {facebookGroups.map((g) => (
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
                      <Button variant="outline" size="sm" onClick={() => toast.success("Mensagem copiada!")}>
                        <Copy className="mr-2 h-3.5 w-3.5" /> Copiar
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <h3 className="font-display text-base font-semibold">Mensagens prontas</h3>
                  <div className="mt-3 space-y-3">
                    {promoMessages.map((m, i) => (
                      <div key={i} className="rounded-xl border bg-muted/30 p-4">
                        <p className="text-sm text-foreground">{m}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(m);
                            toast.success("Texto copiado!");
                          }}
                        >
                          <Copy className="mr-1.5 h-3 w-3" /> Copiar texto
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
          <Button onClick={() => toast.success("Ebook finalizado! 🎉")} className="gradient-primary text-primary-foreground shadow-glow">
            Finalizar <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
