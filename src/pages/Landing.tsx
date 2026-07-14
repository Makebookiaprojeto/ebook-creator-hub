import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, BookOpen, Wand2, TrendingUp, ArrowRight, Check, 
  ShieldCheck, Zap, Star, Users, MessageSquare, Timer,
  Target, Rocket, Heart, Crown, Clock,
  LayoutDashboard, Plus, Library, LifeBuoy, User, Bell, DollarSign, ShoppingCart, CreditCard, QrCode
} from "lucide-react";
import { CHECKOUT_LINKS_BY_METHOD, type PaymentMethod } from "@/config/checkoutLinks";
import saasLogo from "@/assets/saas-logo.jpg";
import heroShowcase from "@/assets/hero-showcase.png.asset.json";

function PlanPaymentButtons({ plan, emphasis = false }: { plan: "monthly" | "lifetime"; emphasis?: boolean }) {
  const go = (method: PaymentMethod) => {
    const url = CHECKOUT_LINKS_BY_METHOD[plan]?.[method];
    if (url) window.location.href = url;
  };
  return (
    <div className="mb-2">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 text-center">
        Método de Pagamento
      </div>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => go("pix")}
          className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] ${emphasis ? "h-14 text-base" : ""}`}
        >
          <QrCode className="h-5 w-5" /> PIX Instantâneo
        </button>
        <button
          type="button"
          onClick={() => go("card")}
          className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-400/30 transition-all hover:scale-[1.02] active:scale-[0.98] ${emphasis ? "h-14 text-base" : ""}`}
        >
          <CreditCard className="h-5 w-5" /> Cartão de Crédito
        </button>
      </div>
    </div>
  );
}

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    document.documentElement.classList.add("dark");
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading && user) navigate("/app", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
              <img src={saasLogo} alt="EbookAI Builder" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">EbookAI <span className="text-primary">Builder</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="hidden sm:block text-sm font-medium hover:text-primary transition">Entrar</Link>
            <Link to="/auth">
              <Button size="sm" className="gradient-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] hover:scale-105 transition-all">
                Começar agora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[680px] bg-primary/30 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/25 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative mx-auto max-w-5xl px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-8 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" /> A nova era da criação digital chegou
            </div>
            <h1 className="font-display text-5xl font-black tracking-tight sm:text-7xl leading-[1.1] mb-8 animate-slide-up">
              Transforme uma ideia em um <br />
              <span className="text-gradient-primary">Império Digital</span> em minutos.
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl mb-10 animate-slide-up animation-delay-200">
              Transforme uma simples ideia em um Ebook pronto para vender em poucos minutos. Nossa IA cria o conteúdo, desenvolve uma capa profissional, monta sua página de vendas e entrega tudo preparado para você começar a faturar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-300">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 text-lg font-bold gradient-primary text-primary-foreground shadow-glow hover:scale-105 transition-all">
                  Criar meu Ebook agora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative mx-auto max-w-5xl px-4 mt-40 sm:mt-56 animate-fade-in animation-delay-300">
            <img
              src={heroShowcase.url}
              alt="EbookAI Builder — ebook pronto, página de vendas e grupos de divulgação"
              loading="lazy"
              className="relative mx-auto w-full max-w-5xl rounded-2xl shadow-[0_25px_80px_-15px_rgba(234,179,8,0.35)] ring-1 ring-yellow-400/30"
            />
          </div>
        </section>


        {/* The Pain vs Solution */}
        <section className="py-24 bg-card/20 border-y border-border/10">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">Antes e depois</p>
              <h2 className="font-display text-4xl font-bold">Do processo travado ao lançamento em minutos</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Compare o método tradicional com a experiência EbookAI Builder e veja por que criadores estão migrando.</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-stretch">
              <div className="p-10 rounded-3xl border border-border/40 bg-background/40 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-muted/40 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-muted-foreground">O método tradicional</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Semanas de bloqueio criativo até estruturar o conteúdo",
                    "Investimento de R$ 500+ com designers para uma capa profissional",
                    "Curva de aprendizado para construir páginas de vendas",
                    "Configuração técnica de checkouts e integrações de pagamento",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-muted-foreground/70">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-10 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <Zap className="h-10 w-10 text-primary/25" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-glow">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-primary">Com a EbookAI Builder</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Estrutura completa gerada em menos de 30 segundos",
                    "Conteúdo aprofundado escrito por uma IA especialista",
                    "Capas fotorrealistas prontas para conversão",
                    "Página de vendas integrada a PIX e cartão de crédito",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-foreground">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="leading-relaxed font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonials */}
        <section className="py-24 bg-primary/5">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">Cases de sucesso</p>
              <h2 className="font-display text-4xl font-bold mb-4">Histórias reais de quem transformou conhecimento em receita</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Profissionais de diferentes áreas utilizam a EbookAI Builder para escalar seus infoprodutos com consistência.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  name: "Mariana Costa", 
                  role: "Coach de Carreira", 
                  text: "Eu tinha o conhecimento mas não conseguia escrever. A EbookAI fez em 20 minutos o que eu tentava há 3 meses. Fiz R$ 4.200 na primeira semana!",
                  rating: 5
                },
                { 
                  name: "Rafael Lima", 
                  role: "Nutricionista", 
                  text: "Incrível! Criei um guia de receitas fit, publiquei no meu Instagram e as vendas não param de cair. O visual da página que a IA gera é muito profissional.",
                  rating: 5
                },
                { 
                  name: "Juliana Santos", 
                  role: "Ex-CLT", 
                  text: "Sempre quis ter meu negócio digital. Com a criação ilimitada de ebooks, eu consigo testar vários nichos até achar o campeão. Já pedi demissão!",
                  rating: 5
                }
              ].map((t, i) => (
                <div key={i} className="group relative p-8 rounded-2xl bg-gradient-to-br from-card/80 to-background border border-primary/10 hover:border-primary/40 shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute -top-4 left-6 text-6xl leading-none text-primary/40 font-serif select-none">"</div>
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(star => <Star key={star} className="h-4 w-4 fill-yellow-500 text-yellow-500" />)}
                  </div>
                  <p className="text-foreground/90 mb-6 leading-relaxed">{t.text}</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-border/30">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-bold text-primary-foreground shadow-md shadow-primary/30">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-xs text-primary/80 font-medium">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 mx-auto max-w-6xl px-4">
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
            {/* Mensal */}
            <div className="px-8 py-10 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-border transition-all flex flex-col">
              <div className="mb-6 mt-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  Mensal
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold align-top">R$</span>
                  <span className="text-6xl font-black">147,90</span>
                  <span className="text-muted-foreground text-sm">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Renovação automática a cada 30 dias.
                </p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {["Criação de ebooks ilimitada", "IA premium (Cérebro Criativo)", "Página de vendas de alta conversão", "Checkout integrado", "Suporte prioritário"].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm font-medium">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> <span>{item}</span>
                  </li>
                ))}
              </ul>
              <PlanPaymentButtons plan="monthly" />
            </div>

            {/* Vitalício */}
            <div className="px-8 py-10 rounded-2xl border-2 border-primary bg-gradient-to-b from-primary/10 to-primary/5 flex flex-col relative ring-2 ring-primary/40 plan-glow-animated shadow-2xl shadow-primary/20 md:scale-[1.03]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] font-black bg-primary text-primary-foreground px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg whitespace-nowrap">
                <Crown className="h-3 w-3" /> Mais escolhido
              </div>
              <div className="mb-6 mt-2">
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                  Vitalício
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold align-top">R$</span>
                  <span className="text-6xl font-black">247,90</span>
                  <span className="text-muted-foreground text-sm">à vista</span>
                </div>
                <div className="text-sm font-bold text-primary mt-1">
                  ou em até 12 X de R$ 29,58
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Pague uma vez e use para sempre.
                </p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {["Criação de ebooks ilimitada", "IA premium (Cérebro Criativo)", "Página de vendas de alta conversão", "Checkout integrado", "Suporte prioritário", "Pagamento único", "Atualizações vitalícias inclusas"].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm font-medium">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> <span>{item}</span>
                  </li>
                ))}
              </ul>
              <PlanPaymentButtons plan="lifetime" emphasis />
            </div>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 flex-wrap opacity-50 grayscale hover:grayscale-0 transition-all">
            <ShieldCheck className="h-8 w-8" />
            <span className="text-xs font-medium">Compra 100% Segura</span>
            <span className="text-xs font-medium">7 Dias de Garantia</span>
            <span className="text-xs font-medium">Acesso Imediato</span>
          </div>
        </section>

        {/* FAQ Section simplified */}
        <section className="py-24 border-t border-border/10 bg-card/5">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <MessageSquare className="h-12 w-12 text-primary/40 mx-auto mb-6" />
            <h2 className="font-display text-4xl font-bold mb-10 text-gradient-primary">Ainda com dúvida?</h2>
            <div className="text-left space-y-6">
              {[
                { q: "Preciso de experiência?", a: "Absolutamente nenhuma. A nossa IA faz o trabalho pesado de escrita e design. Você só precisa ter uma ideia de tema." },
                { q: "O pagamento é seguro?", a: "Totalmente. Usamos tecnologia de criptografia de ponta e processadores de pagamento líderes de mercado para garantir sua total segurança." },
                { q: "Posso vender os ebooks onde quiser?", a: "Sim! O conteúdo é seu. Você pode vender na Hotmart, Kiwify, Amazon ou até diretamente pelo link que nós geramos para você." }
              ].map((faq, i) => (
                <div key={i} className="p-6 rounded-xl border bg-background/50">
                  <p className="font-bold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" /> {faq.q}
                  </p>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-16 p-8 rounded-3xl gradient-primary/10 border border-primary/20">
              <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Teste sem risco por 7 dias.</h3>
              <p className="text-muted-foreground text-sm mb-8">Se em uma semana você não tiver criado seu primeiro ebook de sucesso, nós devolvemos cada centavo do seu investimento.</p>
              <Link to="/auth">
                <Button size="lg" className="gradient-primary text-primary-foreground px-10">QUERO COMEÇAR AGORA</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm font-bold mb-4">EbookAI Builder</p>
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed max-w-2xl mx-auto">
            Disclaimer: Os resultados podem variar de pessoa para pessoa. Não garantimos faturamento imediato, 
            pois o sucesso depende da aplicação das estratégias de marketing e qualidade do nicho escolhido. 
            Todas as imagens geradas pela IA são de propriedade do criador.
          </p>
          <div className="mt-8 flex justify-center gap-6 text-[10px] text-muted-foreground">
            <Link to="#" className="hover:text-primary transition">Termos de Uso</Link>
            <Link to="#" className="hover:text-primary transition">Privacidade</Link>
            <Link to="/suporte" className="hover:text-primary transition">Suporte</Link>
          </div>
          <p className="mt-8 text-[10px] text-muted-foreground/40">
            © {new Date().getFullYear()} EbookAI Builder. Feito para criadores digitais.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
