import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SaasJourneyPreview } from "@/components/SaasJourneyPreview";
import {
  Loader2,
  Check,
  Crown,
  Sparkles,
  LogOut,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
  BookOpen,
  LayoutDashboard,
  Plus,
  Library,
  LifeBuoy,
  User,
  Bell,
  DollarSign,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import saasLogo from "@/assets/saas-logo.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { CHECKOUT_LINKS } from "@/config/checkoutLinks";
import { supabase } from "@/integrations/supabase/client";
import { resolveDisplayName } from "@/lib/userName";

const BENEFITS = [
  "Editor com IA integrada",
  "Capa profissional automática",
  "Página de vendas pronta",
  "Receba pagamentos diretamente",
  "Suporte prioritário",
];

const TESTIMONIALS = [
  {
    name: "Mariana Costa",
    role: "Coach de carreira",
    text: "Em 2 semanas lancei meu primeiro eBook e já fiz R$ 4.300. A IA escreve do meu jeito, parece mágica.",
    rating: 5,
  },
  {
    name: "Rafael Almeida",
    role: "Nutricionista",
    text: "Tentei várias plataformas e nenhuma era tão simples. Aqui eu publico, vendo e recebo no mesmo lugar.",
    rating: 5,
  },
  {
    name: "Juliana Reis",
    role: "Professora de inglês",
    text: "Já tinha o conteúdo, faltava transformar em produto. Em uma tarde estava tudo pronto pra vender.",
    rating: 5,
  },
  {
    name: "Diego Martins",
    role: "Empreendedor digital",
    text: "Paguei o vitalício e em 1 mês já tinha recuperado o investimento. Melhor decisão do ano.",
    rating: 5,
  },
];

const FAQS = [
  {
    q: "Como funciona o pagamento?",
    a: "Você paga uma única vez no plano vitalício, ou mensalmente no plano mensal. O pagamento é processado de forma segura pela Cakto e você recebe o acesso liberado automaticamente.",
  },
  {
    q: "E se eu não gostar?",
    a: "Você tem 7 dias de garantia. Se não gostar por qualquer motivo, devolvemos 100% do seu dinheiro, sem perguntas.",
  },
  {
    q: "Preciso saber escrever para usar?",
    a: "Não. A IA da plataforma escreve o eBook a partir das suas ideias. Você só precisa revisar e personalizar do seu jeito.",
  },
  {
    q: "Posso vender os eBooks que criar?",
    a: "Sim! Todo eBook criado é 100% seu. Você recebe sua própria página de vendas e os pagamentos vão direto pra você.",
  },
  {
    q: "Qual a diferença entre mensal e vitalício?",
    a: "No mensal você paga R$ 147,90 todo mês. No vitalício você paga R$ 247,90 uma única vez e usa pra sempre, sem renovação.",
  },
  {
    q: "O acesso é liberado em quanto tempo?",
    a: "Imediatamente após a confirmação do pagamento. Use o mesmo e-mail do seu cadastro no checkout para liberação automática.",
  },
];

export default function Plans() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { loading: subLoading, isActive } = useSubscription();
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    // Force CSS dark mode
    document.documentElement.classList.add("dark");
    
    // Cache buster: force refresh if version mismatch
    const version = "v1.0.2";
    const stored = localStorage.getItem("plans_v");
    if (stored !== version) {
      localStorage.setItem("plans_v", version);
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const name = resolveDisplayName((data as any)?.display_name, user);
      setDisplayName(name);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!subLoading && isActive) navigate("/app", { replace: true });
  }, [subLoading, isActive, navigate]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

  const handleCheckout = (plan: "monthly" | "lifetime") => {
    const baseUrl = CHECKOUT_LINKS[plan];
    if (!baseUrl) return;
    const url = new URL(baseUrl);
    if (user?.email) url.searchParams.set("email", user.email);
    window.location.href = url.toString();
  };

  const scrollToPlans = () => {
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shadow-glow">
              <img src={saasLogo} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-semibold">{displayName || "Carregando..."}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5" />
            Acesso liberado imediatamente
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Comece a vender seu primeiro eBook ainda <span className="text-primary">esta semana</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            Crie, publique e venda eBooks profissionais com IA. Sem precisar
            saber escrever, designer ou programador.
          </p>

          {/* Rating + social proof */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1 font-medium text-foreground">4.9</span>
              <span>· +2.000 criadores</span>
            </div>
          </div>

          <Button size="lg" onClick={scrollToPlans} className="text-base">
            Ver planos
          </Button>

          {/* App Preview Mockup — replica fiel do dashboard real */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-2">Veja por dentro</p>
              <h3 className="font-display text-3xl font-bold">Uma plataforma feita para você criar sem fricção</h3>
            </div>
            <div className="relative mx-auto max-w-6xl rounded-2xl border border-border/40 bg-card/60 shadow-2xl overflow-hidden backdrop-blur text-left">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-background/60">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <span className="h-3 w-3 rounded-full bg-green-500/70" />
                </div>
                <div className="mx-auto text-xs text-muted-foreground">app.ebookaibuilder.com</div>
              </div>
              <div className="grid grid-cols-12 min-h-[480px]">
                {/* Sidebar real */}
                <aside className="col-span-3 lg:col-span-2 border-r border-border/40 bg-background/50 flex flex-col">
                  <div className="border-b border-border/40 px-3 py-3 flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl overflow-hidden shadow-glow shrink-0">
                      <img src={saasLogo} alt="EbookAI" className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div className="p-2 pt-3">
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-background font-bold text-xs shadow-md">
                      <Plus className="h-4 w-4" /> <span style={{ textShadow: "0 1px 2px rgba(0,0,0,0.35)" }}>Nova Estrutura</span>
                    </button>
                  </div>
                  <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Menu</div>
                  <div className="px-2 space-y-0.5 flex-1">
                    {[
                      { label: "Dashboard", icon: LayoutDashboard, active: true },
                      { label: "Biblioteca", icon: Library, active: false },
                      { label: "Suporte", icon: LifeBuoy, active: false },
                      { label: "Perfil", icon: User, active: false },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs ${
                          item.active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        <item.icon className="h-3.5 w-3.5" /> {item.label}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border/40 m-2 p-2 rounded-lg bg-card flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full gradient-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center shadow-glow">U</div>
                    <span className="text-[10px] text-muted-foreground truncate">usuario@email.com</span>
                  </div>
                </aside>

                {/* Main content — Dashboard real */}
                <main className="col-span-9 lg:col-span-10 bg-background/20">
                  <div className="flex items-center justify-between px-6 py-3 border-b border-border/40">
                    <div className="text-xs text-muted-foreground">Dashboard</div>
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <div className="h-7 w-7 rounded-full gradient-primary shadow-glow" />
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { icon: BookOpen, label: "Ebooks Criados", value: "27" },
                        { icon: ShoppingCart, label: "Vendas Totais", value: "213" },
                        { icon: DollarSign, label: "Receita Total", value: "R$ 8.124,90" },
                        { icon: CreditCard, label: "Receita Hoje", value: "R$ 617,90" },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl border border-border/40 bg-card/60 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-muted-foreground">{s.label}</span>
                            <s.icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="text-sm font-bold">{s.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-border/40 bg-card/60 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold">Receita nos últimos 30 dias</span>
                        <div className="h-5 w-16 rounded-md bg-muted/40" />
                      </div>
                      <svg viewBox="0 0 400 90" className="w-full h-20">
                        <defs>
                          <linearGradient id="plansGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,70 L40,55 L80,60 L120,40 L160,45 L200,30 L240,35 L280,20 L320,28 L360,12 L400,18 L400,90 L0,90 Z" fill="url(#plansGrad)" />
                        <path d="M0,70 L40,55 L80,60 L120,40 L160,45 L200,30 L240,35 L280,20 L320,28 L360,12 L400,18" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                      </svg>
                    </div>

                    <div className="rounded-xl border border-border/40 bg-card/60 p-3">
                      <div className="text-xs font-semibold mb-2 px-1">Vendas recentes</div>
                      <div className="space-y-1.5">
                        {[
                          { ebook: "Liberdade Financeira em 90 dias", price: "R$ 47,00", method: "Pix" },
                          { ebook: "Receitas Low Carb", price: "R$ 37,00", method: "Cartão" },
                          { ebook: "Marketing Digital do Zero", price: "R$ 67,00", method: "Pix" },
                        ].map((r) => (
                          <div key={r.ebook} className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/20 text-[11px]">
                            <span className="truncate">{r.ebook}</span>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-muted-foreground">{r.method}</span>
                              <span className="font-semibold text-primary">{r.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
          <SaasJourneyPreview />
        </section>

        {/* NÚMEROS DE IMPACTO */}
        <section className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, value: "2.300+", label: "Criadores ativos" },
              { icon: BookOpen, value: "8.700+", label: "eBooks publicados" },
              { icon: TrendingUp, value: "R$ 1,2M", label: "Faturado pelos usuários" },
              { icon: Star, value: "4.9/5", label: "Nota média" },
            ].map((s) => (
              <Card key={s.label} className="p-5 text-center border-border/60">
                <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* PLANOS */}
        <section id="planos" className="max-w-5xl mx-auto px-6 py-12 scroll-mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              Escolha o plano ideal para você
            </h2>
            <p className="text-muted-foreground">
              Garantia incondicional de 7 dias. Cancele quando quiser.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Mensal */}
            <Card className="px-10 py-12 border-border/60 flex flex-col">
              <div className="mb-6">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Plano Mensal
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-bold">R$ 147,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Renovação automática a cada 30 dias.
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Criação de ebooks ilimitada</span>
                </li>
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => handleCheckout("monthly")}
              >
                Assinar mensal
              </Button>
            </Card>

            {/* Vitalício */}
            <Card className="px-10 py-12 border-primary bg-primary/5 flex flex-col relative overflow-hidden ring-2 ring-primary/40 plan-glow-animated">
              <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded-full">
                <Crown className="h-3 w-3" /> Mais escolhido
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
                  Acesso Vitalício
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">R$ 247,90</span>
                  <span className="text-muted-foreground text-sm">à vista</span>
                </div>
                <div className="text-sm font-medium text-primary mt-1">
                  ou em até 12 X de R$ 25,82
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Pague uma vez e use para sempre.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium bg-primary/15 text-primary px-2 py-1 rounded">
                  <TrendingUp className="h-3 w-3" />
                  Economize R$ 1.548 no 1º ano
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Tudo do PRO",
                  "Pagamento único",
                  "Acesso para sempre",
                  "Atualizações vitalícias inclusas",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm font-medium">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="w-full"
                onClick={() => handleCheckout("lifetime")}
              >
                Garantir vitalício
              </Button>
            </Card>
          </div>

          {/* COMPARATIVO ECONOMIA */}
          <Card className="mt-8 p-6 max-w-2xl mx-auto bg-muted/30 border-border/60">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Faz as contas com a gente:</p>
                <p className="text-muted-foreground">
                  Mensal por 1 ano = <span className="line-through">R$ 1.798,80</span>{" "}
                  · Vitalício = <span className="font-semibold text-foreground">R$ 247,90</span>{" "}
                  para sempre. Você economiza{" "}
                  <span className="font-semibold text-primary">R$ 1.548,90</span> só
                  no primeiro ano.
                </p>
              </div>
            </div>
          </Card>

        </section>

        {/* DEPOIMENTOS */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              Quem já usa, recomenda
            </h2>
            <p className="text-muted-foreground">
              Histórias reais de quem transformou conhecimento em renda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-6 border-border/60">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center text-sm font-semibold">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              Perguntas frequentes
            </h2>
            <p className="text-muted-foreground">
              Tirou todas as dúvidas? Bora começar.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA FINAL */}
        <section className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            Pronto para publicar seu primeiro eBook?
          </h2>
          <p className="text-muted-foreground mb-8">
            Junte-se a mais de 2.000 criadores que já estão faturando com a plataforma.
          </p>
          <Button size="lg" onClick={scrollToPlans} className="text-base">
            Escolher meu plano
          </Button>
          <p className="text-xs text-muted-foreground mt-6 max-w-md mx-auto">
            ⚠️ Importante: use o mesmo e-mail do seu cadastro ({user?.email}) na
            hora de pagar, para liberarmos seu acesso automaticamente.
          </p>
        </section>
      </main>
    </div>
  );
}
