import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, BookOpen, Wand2, TrendingUp, ArrowRight, Check, 
  ShieldCheck, Zap, Star, Users, MessageSquare, Timer,
  Target, Rocket, Heart, Crown, Clock,
  LayoutDashboard, Plus, Library, LifeBuoy, User, Bell, DollarSign, ShoppingCart, CreditCard
} from "lucide-react";
import saasLogo from "@/assets/saas-logo.jpg";

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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative mx-auto max-w-5xl px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-8 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" /> A nova era da criação digital chegou
            </div>
            <h1 className="font-display text-5xl font-black tracking-tight sm:text-7xl leading-[1.1] mb-8 animate-slide-up">
              Transforme uma ideia em um <br />
              <span className="text-gradient-primary">Império Digital</span> em minutos.
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl mb-10 animate-slide-up animation-delay-200">
              Não perca semanas escrevendo. Nossa IA cria o conteúdo, gera a capa, monta a página de vendas e te entrega tudo pronto para lucrar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-300">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 text-lg font-bold gradient-primary text-primary-foreground shadow-glow hover:scale-105 transition-all">
                  Criar meu Ebook agora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="User" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />)}
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground">+2.000 criadores lucrando</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Pain vs Solution */}
        <section className="py-20 bg-card/20 border-y border-border/10">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold mb-6 italic">O caminho antigo era doloroso...</h2>
                <ul className="space-y-4">
                  {[
                    "Semanas de bloqueio criativo",
                    "Gastar R$ 500+ com designers de capa",
                    "Aprender a programar páginas de vendas",
                    "Ter que configurar checkouts complexos"
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-muted-foreground/60 line-through">
                      <Check className="h-5 w-5 opacity-20" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <Zap className="h-12 w-12 text-primary/20 group-hover:scale-110 transition-transform" />
                </div>
                <h2 className="font-display text-3xl font-bold mb-6 text-primary">Com a EbookAI Builder:</h2>
                <ul className="space-y-4">
                  {[
                    "Estrutura completa em 30 segundos",
                    "Conteúdo profundo escrito por IA especialista",
                    "Capas fotorealistas que vendem sozinhas",
                    "Página de vendas pronta para receber PIX/Cartão"
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-foreground font-medium">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* App Preview Mockup — replica fiel do dashboard real */}
            <div className="mt-20">
              <div className="text-center mb-8">
                <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-2">Veja por dentro</p>
                <h3 className="font-display text-3xl font-bold">Uma plataforma feita para você criar sem fricção</h3>
              </div>
              <div className="relative mx-auto max-w-6xl rounded-2xl border border-border/40 bg-card/60 shadow-2xl overflow-hidden backdrop-blur">
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
                      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-background font-bold text-xs shadow-sm">
                        <Plus className="h-4 w-4" /> Nova Estrutura
                      </button>
                    </div>
                    <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Menu</div>
                    <div className="px-2 space-y-0.5 flex-1">
                      {[
                        { label: "Dashboard", icon: LayoutDashboard, active: true },
                        { label: "Biblioteca", icon: Library, active: false },
                        { label: "Suporte", icon: LifeBuoy, active: false },
                        { label: "Perfil", icon: User, active: false },
                      ].map(item => (
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
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-border/40">
                      <div className="text-xs text-muted-foreground">Dashboard</div>
                      <div className="flex items-center gap-3">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <div className="h-7 w-7 rounded-full gradient-primary shadow-glow" />
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Stat cards reais */}
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { icon: BookOpen, label: "Ebooks Criados", value: "27" },
                          { icon: ShoppingCart, label: "Vendas Totais", value: "213" },
                          { icon: DollarSign, label: "Receita Total", value: "R$ 8.124,90" },
                          { icon: CreditCard, label: "Receita Hoje", value: "R$ 617,90" },
                        ].map(s => (
                          <div key={s.label} className="rounded-xl border border-border/40 bg-card/60 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] text-muted-foreground">{s.label}</span>
                              <s.icon className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="text-sm font-bold">{s.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Chart placeholder */}
                      <div className="rounded-xl border border-border/40 bg-card/60 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold">Receita nos últimos 30 dias</span>
                          <div className="h-5 w-16 rounded-md bg-muted/40" />
                        </div>
                        <svg viewBox="0 0 400 90" className="w-full h-20">
                          <defs>
                            <linearGradient id="lpGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d="M0,70 L40,55 L80,60 L120,40 L160,45 L200,30 L240,35 L280,20 L320,28 L360,12 L400,18 L400,90 L0,90 Z" fill="url(#lpGrad)" />
                          <path d="M0,70 L40,55 L80,60 L120,40 L160,45 L200,30 L240,35 L280,20 L320,28 L360,12 L400,18" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                        </svg>
                      </div>

                      {/* Tabela */}
                      <div className="rounded-xl border border-border/40 bg-card/60 p-3">
                        <div className="text-xs font-semibold mb-2 px-1">Vendas recentes</div>
                        <div className="space-y-1.5">
                          {[
                            { ebook: "Liberdade Financeira em 90 dias", price: "R$ 47,00", method: "Pix" },
                            { ebook: "Receitas Low Carb", price: "R$ 37,00", method: "Cartão" },
                            { ebook: "Marketing Digital do Zero", price: "R$ 67,00", method: "Pix" },
                          ].map(r => (
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
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">Sua máquina de imprimir ebooks</h2>
            <p className="text-muted-foreground">Tudo o que você precisa em uma única plataforma.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Wand2, title: "Escrita Inteligente", desc: "A IA não apenas escreve, ela cria uma jornada de aprendizado para seu cliente." },
              { icon: BookOpen, title: "Venda no Automático", desc: "Nós geramos o link que você envia para o cliente e ele compra direto de você." },
              { icon: TrendingUp, title: "Divulgação smart", desc: "Saiba exatamente onde divulgar com nossas ferramentas de busca de grupos." },
              { icon: ShieldCheck, title: "Segurança Total", desc: "Seus dados e seus ebooks estão protegidos com tecnologia de ponta." },
              { icon: Timer, title: "Velocidade Recorde", desc: "O que levava 30 dias agora leva 30 minutos. Multiplique sua produção." },
              { icon: Rocket, title: "Escala Infinita", desc: "Crie ebooks de forma ilimitada e domine múltiplos nichos." },
            ].map((f, i) => (
              <div key={f.title} className="p-8 rounded-2xl border bg-card/50 hover:bg-card hover:-translate-y-2 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof / Testimonials */}
        <section className="py-24 bg-primary/5">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold mb-4">Quem já mudou de vida</h2>
              <p className="text-muted-foreground">Relatos reais de pessoas comuns que viraram infoprodutores.</p>
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
                <div key={i} className="p-8 rounded-2xl bg-background border border-white/5 relative">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(star => <Star key={star} className="h-4 w-4 fill-yellow-500 text-yellow-500" />)}
                  </div>
                  <p className="italic text-muted-foreground mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4 italic text-primary">O investimento que se paga em 1 venda.</h2>
            <p className="text-muted-foreground">Escolha o seu passaporte para a liberdade digital.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Mensal */}
            <div className="p-10 rounded-3xl border bg-card/30 flex flex-col hover:border-white/20 transition-all">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4"></p>
              <h3 className="text-2xl font-bold mb-2">Mensal PRO</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black">R$ 149,90</span>
                <span className="text-muted-foreground font-medium">/mês</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {["Criação de ebooks ilimitada", "IA premium (Cérebro Criativo)", "Página de vendas de alta conversão", "Checkout integrado", "Suporte prioritário"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="block">
                <Button variant="outline" className="w-full h-12 border-primary/20 hover:bg-primary/5">Assinar Mensal</Button>
              </Link>
            </div>

            {/* Vitalício */}
            <div className="p-10 rounded-3xl border-2 border-primary bg-primary/5 flex flex-col relative shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)]">
              <div className="absolute top-0 right-0 p-6">
                <Crown className="h-12 w-12 text-primary/10" />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-primary px-6 py-2 text-[10px] font-black text-primary-foreground rounded-full tracking-widest uppercase whitespace-nowrap shadow-xl z-20 border border-white/10">
                OFERTA VITALÍCIA
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4"></p>
              <h3 className="text-2xl font-bold mb-2">Vitalício VIP</h3>
              <div className="flex flex-col mb-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black">R$ 249,90</span>
                  <span className="text-muted-foreground font-medium"> única vez</span>
                </div>
                <div className="text-sm font-bold text-primary mt-1">
                  ou em até 12 X de R$ 25,82
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary font-bold mb-6">
                <Clock className="h-3.5 w-3.5 animate-pulse" />
                <span>Oferta encerra em: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {["Tudo do PRO", "Pagamento único", "Acesso para sempre", "Atualizações vitalícias inclusas"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-semibold">
                    <Check className="h-4 w-4 text-primary shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="block">
                <Button className="w-full h-14 text-lg font-black gradient-primary text-primary-foreground shadow-glow hover:scale-105 transition-all">GARANTIR MINHA VAGA</Button>
              </Link>
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
