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
import { CHECKOUT_LINKS } from "@/config/checkoutLinks";
import saasLogo from "@/assets/saas-logo.jpg";
import heroShowcase from "@/assets/hero-showcase.jpg";



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
        {/* Modern Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden bg-black">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-yellow-400/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/15 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative mx-auto max-w-5xl px-4 text-center z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-10 animate-fade-in backdrop-blur-sm shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              A nova era da criação digital chegou
            </div>
            
            <h1 className="font-display text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] mb-8 animate-slide-up text-white">
              Transforme uma ideia em um <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-yellow-400">Império Digital</span> em minutos.
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg sm:text-xl mb-12 animate-slide-up animation-delay-200 text-slate-300">
              Transforme uma simples ideia em um Ebook pronto para vender em poucos minutos. Nossa IA cria o conteúdo, desenvolve uma capa profissional, monta sua página de vendas e entrega tudo preparado para você começar a faturar.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up animation-delay-300">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-16 px-10 text-lg font-black bg-yellow-400 hover:bg-yellow-300 text-black shadow-[0_0_40px_rgba(250,204,21,0.4)] hover:shadow-[0_0_60px_rgba(250,204,21,0.6)] hover:scale-105 transition-all duration-300 rounded-2xl border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1">
                  Criar meu Ebook agora <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto max-w-5xl px-4 mt-32 sm:mt-40 animate-fade-in animation-delay-300 z-10">
            <img
              src={heroShowcase}
              alt="EbookAI Builder Showcase"
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
        <section className="py-24 mx-auto max-w-6xl px-4" id="planos">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">Escolha o Plano Ideal Para Você</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
            {/* Mensal */}
            <div className="px-8 py-8 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-border transition-all flex flex-col">
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
              <button
                type="button"
                onClick={() => window.location.href = CHECKOUT_LINKS.monthly}
                className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Garanta seu Acesso
              </button>
            </div>

            {/* Vitalício */}
            <div className="px-8 py-8 rounded-2xl border-2 border-primary bg-gradient-to-b from-primary/10 to-primary/5 flex flex-col relative ring-2 ring-primary/40 plan-glow-animated shadow-2xl shadow-primary/20 md:scale-[1.03]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] font-black bg-primary text-primary-foreground px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg whitespace-nowrap">
                <Crown className="h-3 w-3" /> Mais escolhido
              </div>
              <div className="mb-6 mt-2">
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                  Vitalício
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold align-top">12x de</span>
                  <span className="text-6xl font-black">29,58</span>
                </div>
                <div className="text-sm font-bold text-muted-foreground mt-1">
                  ou 247,90 à vista
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
              <button
                type="button"
                onClick={() => window.location.href = CHECKOUT_LINKS.lifetime}
                className="w-full h-14 rounded-xl font-bold text-base flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Garanta seu Acesso
              </button>
            </div>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 flex-wrap opacity-50 grayscale hover:grayscale-0 transition-all">
            <ShieldCheck className="h-8 w-8" />
            <span className="text-xs font-medium">Compra 100% Segura</span>
            <span className="text-xs font-medium">7 Dias de Garantia</span>
            <span className="text-xs font-medium">Acesso Imediato</span>
          </div>
        </section>

        {/* FAQ Section and Guarantee */}
        <section className="py-24 border-t border-border/10 bg-card/5 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          
          <div className="mx-auto max-w-4xl px-4 text-center">
            <MessageSquare className="h-12 w-12 text-primary/40 mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-12 text-gradient-primary">Perguntas Frequentes</h2>
            
            <div className="text-left space-y-6 max-w-3xl mx-auto">
              {[
                { q: "Preciso de experiência?", a: "Absolutamente nenhuma. A nossa IA faz o trabalho pesado de escrita e design. Você só precisa ter uma ideia de tema." },
                { q: "O pagamento é seguro?", a: "Totalmente. Usamos tecnologia de criptografia de ponta e processadores de pagamento líderes de mercado para garantir sua total segurança." },
                { q: "Posso vender os ebooks onde quiser?", a: "Sim! O conteúdo é seu. Você pode vender na Hotmart, Kiwify, Amazon ou até diretamente pelo link que nós geramos para você." }
              ].map((faq, i) => (
                <div key={i} className="p-8 rounded-2xl border border-primary/20 bg-background/60 shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:border-primary/40">
                  <p className="text-xl font-bold mb-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    {faq.q}
                  </p>
                  <p className="text-base text-muted-foreground ml-12 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>

            {/* Redesigned Guarantee Section */}
            <div className="mt-20 relative p-[1px] rounded-3xl bg-gradient-to-br from-yellow-400 via-yellow-600/50 to-primary/50 shadow-[0_20px_80px_-15px_rgba(234,179,8,0.2)] hover:shadow-[0_20px_100px_-10px_rgba(234,179,8,0.3)] transition-all duration-500 overflow-hidden transform hover:-translate-y-1">
              <div className="bg-background/95 backdrop-blur-3xl rounded-[23px] p-10 md:p-16 relative z-10 border border-black/20 flex flex-col items-center">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60"></div>
                
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-200 flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.5)] mb-8 animate-pulse">
                  <ShieldCheck className="h-12 w-12 text-black" />
                </div>
                
                <h3 className="text-3xl md:text-5xl font-display font-black mb-6 text-center tracking-tight">Garantia Incondicional de 7 Dias</h3>
                <p className="text-muted-foreground text-center text-lg md:text-xl mb-12 max-w-2xl leading-relaxed">
                  Se em uma semana você não tiver criado seu primeiro ebook de sucesso e não estiver completamente maravilhado com a plataforma, nós devolvemos <strong className="text-foreground">cada centavo</strong> do seu investimento. <span className="text-yellow-400 font-bold">Risco zero.</span>
                </p>
                
                <Link to="/auth" className="w-full sm:w-auto relative z-20">
                  <Button size="lg" className="w-full sm:w-auto h-16 px-12 text-xl font-black bg-yellow-400 hover:bg-yellow-300 text-black shadow-[0_0_40px_rgba(250,204,21,0.5)] hover:shadow-[0_0_60px_rgba(250,204,21,0.7)] hover:scale-[1.03] transition-all duration-300 rounded-2xl border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1">
                    QUERO COMEÇAR AGORA
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Redesigned Footer */}
      <footer className="relative bg-black pt-20 pb-12 overflow-hidden border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 flex flex-col items-center relative z-10">
          <Link to="/" className="flex items-center gap-4 mb-10 hover:scale-105 transition-transform duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] border border-primary/30">
              <img src={saasLogo} alt="EbookAI Builder" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-3xl font-black tracking-tight text-white">EbookAI <span className="text-primary">Builder</span></span>
          </Link>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-14 text-sm font-medium">
            <Link to="#" className="text-muted-foreground hover:text-white transition-colors duration-200">Termos de Uso</Link>
            <Link to="#" className="text-muted-foreground hover:text-white transition-colors duration-200">Políticas de Privacidade</Link>
            <Link to="/suporte" className="text-muted-foreground hover:text-white transition-colors duration-200 flex items-center gap-2">
              <LifeBuoy className="h-4 w-4" /> Central de Suporte
            </Link>
          </div>
          
          <div className="max-w-4xl text-center p-8 rounded-3xl bg-white/[0.02] border border-white/5 mb-14 shadow-2xl backdrop-blur-md">
            <p className="text-xs md:text-sm text-muted-foreground/70 leading-relaxed font-light">
              <strong className="text-muted-foreground font-semibold">Aviso Legal:</strong> Os resultados apresentados variam de pessoa para pessoa. A EbookAI Builder fornece tecnologia e ferramentas para criação e diagramação de ebooks, mas não garante faturamento ou ganhos imediatos, pois o sucesso depende da aplicação das estratégias de vendas, marketing e qualidade do nicho escolhido pelo autor. Todas as imagens e conteúdos gerados pela inteligência artificial na plataforma são de total propriedade do usuário criador.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between w-full pt-8 border-t border-white/10 gap-6">
            <p className="text-sm text-muted-foreground font-medium">
              © {new Date().getFullYear()} <span className="text-white font-bold tracking-wide">EbookAI Builder</span>. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                 <ShieldCheck className="h-5 w-5 text-green-500" />
                 Ambiente 100% Seguro
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
