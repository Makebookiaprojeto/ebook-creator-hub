import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Sparkles, ArrowRight, Check, ShieldCheck, 
  BookOpen, LayoutTemplate, PenTool, Video,
  Crown, PlaySquare, Image as ImageIcon
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
    // Fundo predominantemente AZUL, detalhes em PRETO
    <div className="min-h-screen bg-[#053278] bg-gradient-to-br from-[#053278] via-[#022152] to-[#011438] text-white font-sans selection:bg-black/30 overflow-x-hidden">
      
      {/* Navbar - Detalhes em Preto (Fundo translúcido preto) */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-black/20 bg-black/60 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-lg border border-white/10">
              <img src={saasLogo} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              EbookAI <span className="text-yellow-400">Builder</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 md:gap-6">
            <Link to="/auth" className="hidden md:block text-sm font-medium text-white/80 hover:text-white transition-colors">
              Área de Membros
            </Link>
            <a href="#planos">
              <Button className="h-10 px-6 rounded-full font-bold bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg hover:scale-105 transition-all border-none">
                Liberar meu acesso
              </Button>
            </a>
          </div>
        </div>
      </motion.header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-36 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center text-center px-4">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="relative z-10 max-w-5xl flex flex-col items-center"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-black/40 px-5 py-2 text-sm font-bold text-yellow-400 mb-8 backdrop-blur-md shadow-2xl">
              <Sparkles className="h-4 w-4" />
              <span>A Revolução da IA chegou</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="font-display text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-8 text-white">
              Gere Ebooks completos <br className="hidden md:block"/> 
              com <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Inteligência Artificial</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg md:text-2xl text-white/80 mb-10 max-w-3xl leading-relaxed font-medium">
              A plataforma definitiva para gerar Ebooks, páginas de vendas, criativos para anúncios e roteiros de vídeo. Tudo isso em questão de minutos.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a href="#planos" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-16 px-12 rounded-full text-lg font-black bg-yellow-400 hover:bg-yellow-300 text-black shadow-[0_10px_40px_rgba(250,204,21,0.4)] hover:shadow-[0_15px_50px_rgba(250,204,21,0.6)] hover:scale-[1.03] active:scale-[0.98] transition-all border-none">
                  QUERO CRIAR MEU EBOOK COM IA <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </a>
            </motion.div>
            
            <motion.div variants={fadeIn} className="mt-8 flex items-center gap-6 text-sm font-bold text-white/70">
              <div className="flex items-center gap-2"><Check className="h-5 w-5 text-yellow-400"/> Acesso Liberado na Hora</div>
              <div className="flex items-center gap-2"><Check className="h-5 w-5 text-yellow-400"/> 100% IA Integrada</div>
            </motion.div>
          </motion.div>

          {/* Floating UI Mockup (Card em Preto para contraste) */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="w-full max-w-5xl mt-24 relative z-20"
          >
            <div className="relative rounded-3xl border-4 border-black bg-black p-2 md:p-3 shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-hidden animate-float">
              <div className="relative rounded-2xl overflow-hidden bg-black w-full">
                <PreviewCarousel />
              </div>
            </div>
          </motion.div>
        </section>

        {/* LOGO MARQUEE */}
        <section className="py-10 border-y border-black/40 bg-black/30 overflow-hidden backdrop-blur-sm">
          <div className="flex w-[200%] md:w-auto animate-marquee">
            <div className="flex items-center justify-around w-full gap-8 px-4 text-white/50 font-display text-xl md:text-2xl font-black uppercase tracking-widest whitespace-nowrap">
              <span>EBOOKS COM IA</span>
              <span className="text-yellow-400">•</span>
              <span>PÁGINAS DE VENDAS</span>
              <span className="text-yellow-400">•</span>
              <span>CRIATIVOS PARA ANÚNCIOS</span>
              <span className="text-yellow-400">•</span>
              <span>ROTEIROS DE VÍDEO</span>
              <span className="text-yellow-400">•</span>
              <span>INFOPRODUTO PRONTO</span>
            </div>
          </div>
        </section>

        {/* FEATURES BENTO GRID (Cards PRETOS no fundo AZUL) */}
        <section className="py-24 md:py-32 px-4 relative">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="font-display text-3xl md:text-5xl font-black mb-6 text-white shadow-black drop-shadow-md">
                Tudo em um só lugar
              </h2>
              <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                Deixamos a complexidade para a IA. Você foca apenas em gerar vendas.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Feature 1 */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="col-span-1 lg:col-span-2 p-8 md:p-10 rounded-3xl bg-black border-2 border-black/50 hover:border-yellow-400/50 shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                  <BookOpen className="w-32 h-32 text-yellow-400" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#053278] flex items-center justify-center mb-6 border border-white/10">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-4 text-white">Ebooks Escritos por IA</h3>
                <p className="text-white/60 text-lg leading-relaxed relative z-10">
                  Não perca meses escrevendo. Nossa inteligência artificial cria capítulos extremamente ricos, com conteúdo aprofundado, formatado e pronto para a venda em instantes.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="col-span-1 lg:col-span-2 p-8 md:p-10 rounded-3xl bg-black border-2 border-black/50 hover:border-yellow-400/50 shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                  <LayoutTemplate className="w-32 h-32 text-yellow-400" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#053278] flex items-center justify-center mb-6 border border-white/10">
                  <LayoutTemplate className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-4 text-white">Páginas de Vendas</h3>
                <p className="text-white/60 text-lg leading-relaxed relative z-10">
                  Gere páginas de vendas de alta conversão estruturadas com os melhores frameworks de copy do mercado. Prontas para integrar seu botão de checkout.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="col-span-1 lg:col-span-2 p-8 md:p-10 rounded-3xl bg-black border-2 border-black/50 hover:border-yellow-400/50 shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#053278] flex items-center justify-center mb-6 border border-white/10">
                  <ImageIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-4 text-white">Criativos Poderosos</h3>
                <p className="text-white/60 text-lg leading-relaxed relative z-10">
                  Pare de gastar fortunas com designers. Gere imagens perfeitas para os seus anúncios de Facebook e Instagram através do nosso gerador inteligente.
                </p>
              </motion.div>

              {/* Feature 4 */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="col-span-1 lg:col-span-2 p-8 md:p-10 rounded-3xl bg-black border-2 border-black/50 hover:border-yellow-400/50 shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#053278] flex items-center justify-center mb-6 border border-white/10">
                  <PlaySquare className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-4 text-white">Roteiros de Vídeo (VSL)</h3>
                <p className="text-white/60 text-lg leading-relaxed relative z-10">
                  Atraia a atenção da sua audiência. Nossa ferramenta escreve VSLs persuasivas para você gravar ou narrar, garantindo um funil de vendas avassalador.
                </p>
              </motion.div>

            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="planos" className="py-24 md:py-32 px-4 relative bg-black border-y-4 border-[#021840]">
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="font-display text-4xl md:text-5xl font-black mb-6 text-white">Libere o seu acesso hoje</h2>
              <p className="text-white/60 text-lg font-medium">O acesso é liberado automaticamente após a aprovação da compra.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              
              {/* Mensal - Em azul escuro para não ofuscar o preto/amarelo */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-8 md:p-10 rounded-[2rem] bg-[#053278] border-2 border-[#032050] relative shadow-xl flex flex-col"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-white mb-4">Acesso Mensal</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white/70">R$</span>
                    <span className="text-5xl font-display font-black text-white">147,90</span>
                    <span className="text-white/70 font-bold">/mês</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {["Acesso à Plataforma Base", "Geração de Ebooks com IA", "Geração de Páginas de Venda", "Criativos de Anúncio", "Roteiros de Vídeo", "Renovação Automática"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/90 font-medium">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <a href={CHECKOUT_LINKS.monthly} className="block w-full">
                  <Button className="w-full h-16 rounded-xl font-black text-lg bg-white hover:bg-gray-200 text-[#053278] shadow-lg transition-all">
                    ASSINAR MENSAL
                  </Button>
                </a>
              </motion.div>

              {/* Vitalício - Principal destaque, Amarelo e Preto */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-gray-900 to-black border-4 border-yellow-400 relative shadow-[0_20px_50px_rgba(250,204,21,0.2)] overflow-hidden md:scale-105 z-10 flex flex-col"
              >
                <div className="absolute top-0 right-0 p-5">
                  <div className="text-xs font-black uppercase tracking-widest bg-yellow-400 text-black px-4 py-2 rounded-full">
                    Acesso Exclusivo
                  </div>
                </div>
                
                <div className="mb-8 mt-4">
                  <h3 className="text-2xl font-black text-yellow-400 mb-4 flex items-center gap-2">
                    <Crown className="w-6 h-6"/> Acesso Vitalício
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white/50">12x de</span>
                    <span className="text-5xl font-display font-black text-white">29,58</span>
                  </div>
                  <p className="text-white/50 mt-2 font-bold text-lg">ou R$ 247,90 à vista</p>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {["Acesso à Plataforma para sempre", "Sem Mensalidades", "Geração de Ebooks com IA", "Geração de Páginas de Venda", "Criativos de Anúncio", "Roteiros de Vídeo", "Todas atualizações grátis"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white font-medium">
                      <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <a href={CHECKOUT_LINKS.lifetime} className="block w-full">
                  <Button className="w-full h-16 rounded-xl font-black text-lg bg-yellow-400 hover:bg-yellow-300 text-black shadow-[0_10px_30px_rgba(250,204,21,0.3)] transition-all border-none">
                    COMPRAR ACESSO VITALÍCIO
                  </Button>
                </a>
              </motion.div>

            </div>
          </div>
        </section>

        {/* GUARANTEE */}
        <section className="py-24 px-4 bg-gradient-to-b from-black to-[#053278]">
          <div className="max-w-4xl mx-auto text-center p-10 md:p-16 rounded-[2rem] bg-black border-2 border-white/10 relative overflow-hidden shadow-2xl">
            <ShieldCheck className="w-20 h-20 text-yellow-400 mx-auto mb-6 relative z-10" />
            <h2 className="font-display text-3xl md:text-5xl font-black mb-6 text-white relative z-10">
              Satisfação Garantida
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed relative z-10 font-medium">
              O risco é todo nosso. Se você acessar o sistema, gerar seu produto e não aprovar a qualidade, 
              basta um clique para receber 100% do seu dinheiro de volta. Você tem 7 dias para testar.
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-black bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <Link to="/" className="flex items-center gap-3 mb-8 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden border border-white/10">
              <img src={saasLogo} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-xl font-black tracking-tight text-white">
              EbookAI <span className="text-yellow-400">Builder</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-8 text-sm font-bold text-white/50 mb-12">
            <a href="#" className="hover:text-yellow-400 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Privacidade</a>
            <a href="mailto:contato@suporte.com" className="hover:text-yellow-400 transition-colors">Suporte</a>
          </div>
          
          <p className="text-center text-white/30 text-xs max-w-3xl leading-relaxed font-medium">
            Este site não faz parte e nem é endossado pelo Facebook, Instagram ou Meta Platforms, Inc.
            Acesso liberado pelo administrador imediatamente após a confirmação da compra.
          </p>
          <div className="mt-8 text-white/20 text-xs font-bold">
            © {new Date().getFullYear()} EbookAI Builder. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
