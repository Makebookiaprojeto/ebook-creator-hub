import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, BookOpen, Wand2, TrendingUp, ArrowRight, Check, 
  ShieldCheck, Zap, Star, Users, MessageSquare, Timer,
  Target, Rocket, Heart, Crown, Clock, MousePointerClick, Image as ImageIcon,
  LayoutDashboard, Plus, Library, LifeBuoy, User, Bell, DollarSign, ShoppingCart, CreditCard, QrCode, Play
} from "lucide-react";
import { PreviewCarousel } from "@/components/PreviewCarousel";
import { CHECKOUT_LINKS } from "@/config/checkoutLinks";
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

  // Framer motion variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Navbar */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-[0_0_15px_rgba(37,99,235,0.3)] group-hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all">
              <img src={saasLogo} alt="EbookAI Builder" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              EbookAI <span className="text-blue-500">Builder</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/auth" className="hidden md:block text-sm font-medium text-white/70 hover:text-white transition-colors">
              Acessar minha conta
            </Link>
            <a href="#planos">
              <Button className="h-10 px-6 rounded-full font-bold bg-yellow-400 hover:bg-yellow-300 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] hover:scale-105 transition-all border-none">
                Começar agora
              </Button>
            </a>
          </div>
        </div>
      </motion.header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center text-center px-4">
          {/* Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="relative z-10 max-w-5xl flex flex-col items-center"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 mb-8 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>A revolução na criação de infoprodutos</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mb-8 text-white">
              Crie e venda seu E-book com <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Inteligência Artificial</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg md:text-2xl text-white/60 mb-10 max-w-3xl leading-relaxed font-light">
              Gere E-books completos, páginas de vendas magnéticas e design de capas profissionais em minutos. O método mais rápido para transformar seu conhecimento em receita.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a href="#planos" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-full text-lg font-bold bg-yellow-400 hover:bg-yellow-300 text-black shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:shadow-[0_0_50px_rgba(250,204,21,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all border-none">
                  Criar meu E-book agora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </motion.div>
            
            <motion.div variants={fadeIn} className="mt-8 flex items-center gap-4 text-sm font-medium text-white/50">
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400"/> Acesso Imediato</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400"/> IA Inclusa</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400"/> Páginas prontas</div>
            </motion.div>
          </motion.div>

          {/* Floating UI Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="w-full max-w-6xl mt-24 relative z-20"
          >
            <div className="relative rounded-2xl md:rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-2 md:p-4 shadow-2xl shadow-blue-900/20 overflow-hidden animate-float">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50" />
              <div className="relative rounded-xl md:rounded-3xl overflow-hidden border border-white/5 bg-[#0a0a0a]">
                <PreviewCarousel />
              </div>
            </div>
          </motion.div>
        </section>

        {/* LOGO MARQUEE */}
        <section className="py-12 border-y border-white/5 bg-white/[0.01] overflow-hidden">
          <div className="flex w-[200%] md:w-auto animate-marquee">
            <div className="flex items-center justify-around w-full gap-8 px-4 text-white/30 font-display text-xl md:text-2xl font-bold uppercase tracking-widest whitespace-nowrap">
              <span>GERAÇÃO AUTOMÁTICA</span>
              <span className="text-blue-500/50">•</span>
              <span>DESIGN PROFISSIONAL</span>
              <span className="text-blue-500/50">•</span>
              <span>PÁGINAS DE VENDAS</span>
              <span className="text-blue-500/50">•</span>
              <span>MÚLTIPLOS NICHOS</span>
              <span className="text-blue-500/50">•</span>
              <span>PAGAMENTO INTEGRADO</span>
              <span className="text-blue-500/50">•</span>
              <span>INTELIGÊNCIA ARTIFICIAL</span>
            </div>
          </div>
        </section>

        {/* FEATURES BENTO GRID */}
        <section className="py-24 md:py-32 px-4 relative">
          <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">Tudo que você precisa para <br className="hidden md:block"/> vender todos os dias</h2>
              <p className="text-white/50 text-lg max-w-2xl mx-auto">Deixe a tecnologia complexa com a gente. Focamos em entregar a estrutura perfeita para você faturar.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-2 p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity">
                  <Wand2 className="w-24 h-24 text-blue-500" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Geração Ultra-Rápida</h3>
                <p className="text-white/60 text-lg leading-relaxed max-w-md relative z-10">Nossa Inteligência Artificial redige capítulos inteiros, persuasivos e livres de plágio em poucos segundos. O bloqueio criativo acabou.</p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                  <ImageIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Capas com IA</h3>
                <p className="text-white/60 text-lg leading-relaxed relative z-10">O visual vende. A EbookAI cria capas fotorrealistas e mockups 3D de forma automática.</p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                  <MousePointerClick className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Página de Vendas</h3>
                <p className="text-white/60 text-lg leading-relaxed relative z-10">Sites desenhados para alta conversão. Estrutura pronta com copy persuasiva focada em resultados.</p>
              </motion.div>

              {/* Feature 4 */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-2 p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Checkout Transparente</h3>
                <p className="text-white/60 text-lg leading-relaxed max-w-md relative z-10">Integração perfeita. Seus clientes pagam por PIX ou Cartão e recebem o acesso automaticamente sem que você precise fazer nada.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="planos" className="py-24 md:py-32 px-4 relative bg-[#030303] border-y border-white/5">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
          
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Escolha o seu acesso</h2>
              <p className="text-white/50 text-lg">Pagamento único ou mensal. Sem surpresas.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
              
              {/* Mensal */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-8 md:p-10 rounded-[2rem] bg-white/[0.02] border border-white/10 relative"
              >
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white/70 mb-4">Plano Mensal</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white/50">R$</span>
                    <span className="text-5xl font-display font-bold">147,90</span>
                    <span className="text-white/50">/mês</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-10">
                  {["Acesso à plataforma", "Criação de e-books ilimitada", "Páginas de vendas prontas", "Checkout integrado", "Suporte VIP"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/80">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-blue-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <a href={CHECKOUT_LINKS.monthly} className="block w-full">
                  <Button className="w-full h-14 rounded-xl font-bold text-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all">
                    Assinar Mensal
                  </Button>
                </a>
              </motion.div>

              {/* Vitalício */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-b from-blue-900/20 to-black border border-blue-500/40 relative shadow-[0_0_50px_rgba(37,99,235,0.15)] overflow-hidden md:scale-105 z-10"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                <div className="absolute top-0 right-0 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest bg-blue-500 text-white px-3 py-1 rounded-full">Mais Vantajoso</div>
                </div>
                
                <div className="mb-8 mt-4">
                  <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2"><Crown className="w-5 h-5"/> Acesso Vitalício</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white/50">12x de R$</span>
                    <span className="text-5xl font-display font-bold">29,58</span>
                  </div>
                  <p className="text-white/50 mt-2">ou R$ 247,90 à vista</p>
                </div>
                
                <ul className="space-y-4 mb-10">
                  {["Acesso à plataforma para sempre", "Sem mensalidades", "Criação de e-books ilimitada", "Páginas de vendas prontas", "Checkout integrado", "Atualizações futuras grátis"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.5)]">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <a href={CHECKOUT_LINKS.lifetime} className="block w-full">
                  <Button className="w-full h-14 rounded-xl font-bold text-lg bg-yellow-400 hover:bg-yellow-300 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all border-none">
                    Garantir Acesso Vitalício
                  </Button>
                </a>
              </motion.div>

            </div>
          </div>
        </section>

        {/* GUARANTEE */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center p-10 md:p-16 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500" />
            <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto mb-6 relative z-10" />
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 relative z-10">7 Dias de Garantia</h2>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed relative z-10">
              Teste o EbookAI Builder. Se você não conseguir criar seu primeiro E-book de alta qualidade e não amar a plataforma, devolvemos 100% do seu dinheiro. Sem perguntas.
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#020202] py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <Link to="/" className="flex items-center gap-3 mb-8 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden border border-white/10">
              <img src={saasLogo} alt="EbookAI Builder" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">EbookAI Builder</span>
          </Link>
          
          <div className="flex items-center gap-6 text-sm text-white/40 mb-12">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="mailto:contato@suporte.com" className="hover:text-white transition-colors">Suporte</a>
          </div>
          
          <p className="text-center text-white/30 text-xs max-w-3xl leading-relaxed">
            Este site não faz parte e nem é endossado pelo Facebook, Instagram ou Meta Platforms, Inc.
            Os resultados variam e dependem exclusivamente da aplicação prática das ferramentas por parte do usuário.
          </p>
          <div className="mt-8 text-white/20 text-xs">
            © {new Date().getFullYear()} EbookAI Builder. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
