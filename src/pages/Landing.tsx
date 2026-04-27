import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Wand2, TrendingUp, ArrowRight, Check } from "lucide-react";
import saasLogo from "@/assets/saas-logo.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (!loading && user) navigate("/app", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">EbookAI Builder</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow">
                Criar conta grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-40 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" /> Powered by IA
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-6xl">
            Crie e venda <span className="text-gradient-primary">ebooks lucrativos</span><br />
            em poucos minutos
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            A plataforma all-in-one que escreve, formata e publica seu ebook usando IA — para você focar só em vender.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
                Começar grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">Já tenho conta</Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Sem cartão de crédito • Cancele quando quiser</p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Wand2, title: "Geração com IA", desc: "Escolha o nicho, o público e a IA escreve capítulos completos." },
            { icon: BookOpen, title: "Página de vendas", desc: "Landing pronta com depoimentos, urgência e CTA otimizado." },
            { icon: TrendingUp, title: "Divulgação smart", desc: "Sugestões de grupos do Facebook e textos prontos para postar." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 hover:border-primary/50 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Planos simples</h2>
          <p className="mt-2 text-muted-foreground">Escolha o plano que cabe no seu objetivo.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Mensal PRO</p>
            <p className="mt-2 font-display text-4xl font-bold">R$ 149,90<span className="text-base font-normal text-muted-foreground">/mês</span></p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Ebooks ilimitados", "IA premium", "Página de vendas", "Suporte prioritário"].map((b) => (
                <li key={b} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {b}</li>
              ))}
            </ul>
            <Link to="/auth" className="block mt-6">
              <Button variant="outline" className="w-full">Começar PRO</Button>
            </Link>
          </div>
          <div className="rounded-2xl border-2 border-primary bg-card p-6 relative shadow-glow">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
              MELHOR VALOR
            </div>
            <p className="text-sm text-muted-foreground">Vitalício</p>
            <p className="mt-2 font-display text-4xl font-bold">R$ 249,90<span className="text-base font-normal text-muted-foreground"> uma vez</span></p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Tudo do PRO", "Pagamento único", "Atualizações vitalícias", "Acesso antecipado a recursos"].map((b) => (
                <li key={b} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {b}</li>
              ))}
            </ul>
            <Link to="/auth" className="block mt-6">
              <Button className="w-full gradient-primary text-primary-foreground shadow-glow">Garantir vitalício</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 mt-12">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EbookAI Builder. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
