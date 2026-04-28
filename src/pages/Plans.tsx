import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
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
    a: "No mensal você paga R$ 149,90 todo mês. No vitalício você paga R$ 249,90 uma única vez e usa pra sempre, sem renovação.",
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
            <Sparkles className="h-5 w-5 text-primary" />
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
            Acesso liberado na hora
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
              Escolha o plano ideal pra você
            </h2>
            <p className="text-muted-foreground">
              Garantia incondicional de 7 dias. Cancele quando quiser.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Mensal */}
            <Card className="p-8 border-border/60 flex flex-col">
              <div className="mb-6">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Mensal
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">R$ 149,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Renovação automática a cada 30 dias.
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Até 20 ebooks/mês</span>
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
            <Card className="p-8 border-primary bg-primary/5 flex flex-col relative overflow-hidden ring-2 ring-primary/40">
              <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded-full">
                <Crown className="h-3 w-3" /> Mais escolhido
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
                  Vitalício
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">R$ 249,90</span>
                  <span className="text-muted-foreground">único</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Pague uma vez e use para sempre. Sem mensalidade.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium bg-primary/15 text-primary px-2 py-1 rounded">
                  <TrendingUp className="h-3 w-3" />
                  Economize R$ 1.548 no 1º ano
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Editor com IA integrada",
                  "Capa profissional automática",
                  "Página de vendas pronta",
                  "Receba pagamentos diretamente",
                  "Suporte prioritário",
                  "Acesso vitalício, sem renovações",
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
                  · Vitalício = <span className="font-semibold text-foreground">R$ 249,90</span>{" "}
                  pra sempre. Você economiza{" "}
                  <span className="font-semibold text-primary">R$ 1.548,90</span> só
                  no primeiro ano.
                </p>
              </div>
            </div>
          </Card>

          {/* GARANTIA */}
          <div className="mt-8 max-w-2xl mx-auto flex items-center gap-4 p-5 rounded-lg border border-primary/30 bg-primary/5">
            <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Garantia incondicional de 7 dias</p>
              <p className="text-sm text-muted-foreground">
                Se por qualquer motivo você não gostar, devolvemos 100% do seu
                dinheiro. Sem perguntas, sem burocracia.
              </p>
            </div>
          </div>
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
            Pronto pra publicar seu primeiro eBook?
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
