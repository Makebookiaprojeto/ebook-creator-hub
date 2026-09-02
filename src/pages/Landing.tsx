import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Check, ArrowRight, ShieldCheck, 
  FileText, LayoutTemplate, Video, TrendingUp,
  Plus, Zap
} from "lucide-react";
import { CHECKOUT_LINKS } from "@/config/checkoutLinks";
import saasLogo from "@/assets/saas-logo.jpg";
import { PreviewCarousel } from "@/components/PreviewCarousel";

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/5 bg-[#0a0a0a] rounded-2xl mb-4 overflow-hidden hover:border-white/10 transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="font-bold text-white text-lg">{question}</span>
        <Plus className={`w-5 h-5 text-blue-500 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
      </button>
      <div 
        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <p className="text-white/60 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

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
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#061022] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0d2247] via-[#061022] to-[#030814] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* NAVBAR */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#061022]/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden border border-white/10">
              <img src={saasLogo} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              EbookAI Builder
            </span>
          </Link>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
              <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
              <a href="#planos" className="hover:text-white transition-colors">Preços</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <Link to="/auth" className="hover:text-white transition-colors">Entrar</Link>
            </nav>
            <a href="#planos">
              <Button className="h-10 px-6 rounded-lg font-bold bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg transition-all border-none">
                Criar meu ebook
              </Button>
            </a>
          </div>
        </div>
      </motion.header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-36 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center text-center px-4">
          <div className="absolute top-1/4 -left-[10%] w-[500px] h-[300px] bg-blue-600/10 blur-[120px] rounded-[100%] rotate-45 pointer-events-none" />
          <div className="absolute bottom-1/4 -right-[10%] w-[400px] h-[200px] bg-blue-500/10 blur-[100px] rounded-[100%] -rotate-45 pointer-events-none" />

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="relative z-10 max-w-4xl flex flex-col items-center"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-1.5 text-xs font-bold text-white/60 mb-8 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
              DE IDEIA À PRIMEIRA VENDA
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-6 text-white max-w-3xl">
              Não sabe criar um produto nem onde vender? <span className="text-yellow-400">Aqui, resolvemos os dois.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl leading-relaxed">
              Saia do zero com um <span className="text-white font-bold">produto pronto</span>, uma <span className="text-white font-bold">página de vendas</span> e <span className="text-white font-bold">grupos para divulgar</span> e começar a vender no digital.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a href="#planos" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-xl text-base font-bold bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg transition-all border-none">
                  Gerar meu primeiro ebook agora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a href="#planos" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-xl text-base font-bold bg-[#0a0a0a] border-white/10 text-white hover:bg-white/5 transition-all">
                  Ver um ebook gerado pela IA
                </Button>
              </a>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="w-full max-w-[1000px] mt-24 relative z-20"
          >
            <div className="flex justify-center gap-2 mb-4 overflow-x-auto pb-2">
               <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-white/5 rounded-xl text-white/80 text-sm font-medium">
                 <FileText className="w-4 h-4" /> Ebook
               </div>
               <ArrowRight className="w-4 h-4 text-white/20 my-auto" />
               <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-white/5 rounded-xl text-white/80 text-sm font-medium">
                 <ShieldCheck className="w-4 h-4" /> Checkout
               </div>
               <ArrowRight className="w-4 h-4 text-white/20 my-auto" />
               <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-white/5 rounded-xl text-white/80 text-sm font-medium">
                 <LayoutTemplate className="w-4 h-4" /> Página
               </div>
               <ArrowRight className="w-4 h-4 text-white/20 my-auto" />
               <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-white/5 rounded-xl text-white/80 text-sm font-medium">
                 <Video className="w-4 h-4" /> Videos
               </div>
               <ArrowRight className="w-4 h-4 text-white/20 my-auto" />
               <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-white/5 rounded-xl text-white/80 text-sm font-medium">
                 <TrendingUp className="w-4 h-4" /> Vender
               </div>
            </div>

            <div className="relative rounded-2xl border border-white/5 bg-[#0a0a0a] shadow-2xl overflow-hidden aspect-auto min-h-[400px] md:min-h-[550px] flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#111]">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="ml-4 text-xs text-white/30 font-mono">https://ebookaibuilder.com</div>
              </div>
              
              <div className="w-full flex-1 relative overflow-hidden bg-gradient-to-b from-[#151515] to-[#050505]">
                 <PreviewCarousel />
                 <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-black/60">
                    <div className="bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1 rounded uppercase tracking-wider mb-4 border border-green-500/20">
                      GERADO POR IA
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Emagrecimento Sem Dieta</h3>
                    <p className="text-white/60 text-sm mb-6">Guia completo em 5 capítulos</p>
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-white/80"><Check className="w-4 h-4 text-green-400" /> Estrutura pronta</div>
                       <div className="flex items-center gap-2 text-white/80"><Check className="w-4 h-4 text-green-400" /> Conteúdo completo</div>
                       <div className="flex items-center gap-2 text-white/80"><Check className="w-4 h-4 text-green-400" /> PDF pronto pra vender</div>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-[1000px] mt-16 text-left">
             <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div> Feito no Brasil</div>
                <div className="text-xs text-white/50 ml-3.5">100% em português</div>
             </div>
             <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div> IA de ponta</div>
                <div className="text-xs text-white/50 ml-3.5">Modelos de última geração</div>
             </div>
             <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div> Pagamento seguro</div>
                <div className="text-xs text-white/50 ml-3.5">PIX e cartão</div>
             </div>
             <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div> 7 dias de garantia</div>
                <div className="text-xs text-white/50 ml-3.5">Risco zero</div>
             </div>
          </div>
        </section>

        {/* SECTION: VOCÊ SÓ PRECISA DE UMA IDEIA */}
        <section id="como-funciona" className="py-24 px-4 border-t border-white/5 bg-[#030814]">
          <div className="max-w-[1000px] mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-bold text-white/60 mb-6 uppercase tracking-wider">
              DO ZERO AO PRODUTO PRONTO
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-black mb-4 text-white">Você só precisa de uma ideia</h2>
            <p className="text-white/60 text-lg">A IA faz o resto: transforma essa ideia em produto pronto para divulgar.</p>
          </div>

          <div className="max-w-[1000px] mx-auto grid md:grid-cols-2 gap-6">
            <div className="bg-[#08152b] border border-blue-500/20 rounded-3xl p-10 flex flex-col justify-start relative shadow-xl">
               <div className="text-blue-200 text-xs font-bold tracking-wider mb-4">ANTES</div>
               <h3 className="text-2xl font-bold text-white mb-8">Uma ideia solta</h3>
               <ul className="space-y-4">
                 <li className="text-white/80 flex items-start gap-3">
                    <span className="mt-1 opacity-60">-</span> Não sabe por onde começar a escrever
                 </li>
                 <li className="text-white/80 flex items-start gap-3">
                    <span className="mt-1 opacity-60">-</span> Não tem página de vendas nem checkout
                 </li>
                 <li className="text-white/80 flex items-start gap-3">
                    <span className="mt-1 opacity-60">-</span> Não sabe como divulgar o produto
                 </li>
                 <li className="text-white/80 flex items-start gap-3">
                    <span className="mt-1 opacity-60">-</span> Levaria dias (ou nunca sairia do papel)
                 </li>
               </ul>
            </div>

            <div className="bg-yellow-400 border border-yellow-500 rounded-3xl p-10 flex flex-col justify-start relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 inset-x-0 h-1 bg-yellow-500"></div>
               <div className="text-black text-xs font-bold tracking-wider mb-4">DEPOIS</div>
               <h3 className="text-2xl font-bold text-black mb-8">Um produto pronto para vender</h3>
               <ul className="space-y-4">
                 <li className="text-black flex items-start gap-3 font-medium">
                    <Check className="w-5 h-5 text-black shrink-0" /> Ebook completo, escrito pela IA em minutos
                 </li>
                 <li className="text-black flex items-start gap-3 font-medium">
                    <Check className="w-5 h-5 text-black shrink-0" /> Página de vendas e checkout já configurados
                 </li>
                 <li className="text-black flex items-start gap-3 font-medium">
                    <Check className="w-5 h-5 text-black shrink-0" /> Roteiros de vídeo prontos para gravar
                 </li>
                 <li className="text-black flex items-start gap-3 font-medium">
                    <Check className="w-5 h-5 text-black shrink-0" /> Você só precisa revisar e divulgar
                 </li>
               </ul>
            </div>
          </div>
        </section>

        {/* SECTION: INTEGRAÇÕES */}
        <section className="py-24 px-4 border-t border-white/5 bg-[#061022] overflow-hidden">
           <div className="max-w-[1000px] mx-auto text-center mb-10">
             <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-bold text-white/60 mb-6 uppercase tracking-wider">
               INTEGRAÇÕES
             </div>
             <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-white">Integrado com as principais plataformas de pagamento do Brasil</h2>
           </div>
           
           <div className="relative flex w-[200%] md:w-auto overflow-hidden py-4 opacity-80">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#061022] to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#061022] to-transparent z-10" />
              <div className="flex items-center gap-4 px-4 animate-marquee whitespace-nowrap">
                {["Kiwify", "Cakto", "Hotmart", "Applyfy", "PerfectPay", "Kiwify", "Cakto", "Hotmart", "Applyfy", "PerfectPay"].map((gateway, i) => (
                   <div key={i} className="px-6 py-2.5 rounded-2xl border border-white/5 bg-[#0a0a0a] text-white/70 font-bold text-base">
                     {gateway}
                   </div>
                ))}
                {["Kiwify", "Cakto", "Hotmart", "Applyfy", "PerfectPay", "Kiwify", "Cakto", "Hotmart", "Applyfy", "PerfectPay"].map((gateway, i) => (
                   <div key={i+10} className="px-6 py-2.5 rounded-2xl border border-white/5 bg-[#0a0a0a] text-white/70 font-bold text-base">
                     {gateway}
                   </div>
                ))}
              </div>
           </div>
           
           <div className="max-w-[1000px] mx-auto text-center mt-6">
             <p className="text-white/40 text-sm">Configure seu link e comece a vender.</p>
           </div>
        </section>

        {/* SECTION: QUALQUER NICHO */}
        <section className="py-24 px-4 bg-[#030814] overflow-hidden">
           <div className="max-w-[1000px] mx-auto text-center mb-16">
             <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-bold text-white/60 mb-6 uppercase tracking-wider">
               PARA QUALQUER NICHO
             </div>
             <h2 className="font-display text-4xl md:text-5xl font-black mb-4 text-white">Qualquer nicho, um ebook pronto</h2>
             <p className="text-white/60 text-lg">Escolha o tema que quiser: a IA adapta o conteúdo e entrega o produto certo pra ele.</p>
           </div>

           <div className="relative flex flex-col gap-4 w-[200%] md:w-auto overflow-hidden py-4 opacity-70">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#030814] to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#030814] to-transparent z-10" />
              
              <div className="flex items-center gap-4 px-4 animate-marquee-reverse whitespace-nowrap">
                {["Emagrecimento", "Finanças pessoais", "Relacionamento", "Receitas fit", "Marketing digital", "Produtividade", "Emagrecimento", "Finanças pessoais", "Relacionamento", "Receitas fit", "Marketing digital", "Produtividade"].map((nicho, i) => (
                   <div key={`top-${i}`} className="px-6 py-2.5 rounded-full border border-white/5 bg-[#0a0a0a] text-white/60 text-sm font-medium">
                     {nicho}
                   </div>
                ))}
                {["Emagrecimento", "Finanças pessoais", "Relacionamento", "Receitas fit", "Marketing digital", "Produtividade", "Emagrecimento", "Finanças pessoais", "Relacionamento", "Receitas fit", "Marketing digital", "Produtividade"].map((nicho, i) => (
                   <div key={`top-dup-${i}`} className="px-6 py-2.5 rounded-full border border-white/5 bg-[#0a0a0a] text-white/60 text-sm font-medium">
                     {nicho}
                   </div>
                ))}
              </div>

              <div className="flex items-center gap-4 px-4 animate-marquee whitespace-nowrap">
                {["Espiritualidade", "Pets", "Beleza e autocuidado", "Desenvolvimento pessoal", "Idiomas", "Maternidade", "Espiritualidade", "Pets", "Beleza e autocuidado", "Desenvolvimento pessoal", "Idiomas", "Maternidade"].map((nicho, i) => (
                   <div key={`bot-${i}`} className="px-6 py-2.5 rounded-full border border-white/5 bg-[#0a0a0a] text-white/60 text-sm font-medium">
                     {nicho}
                   </div>
                ))}
                {["Espiritualidade", "Pets", "Beleza e autocuidado", "Desenvolvimento pessoal", "Idiomas", "Maternidade", "Espiritualidade", "Pets", "Beleza e autocuidado", "Desenvolvimento pessoal", "Idiomas", "Maternidade"].map((nicho, i) => (
                   <div key={`bot-dup-${i}`} className="px-6 py-2.5 rounded-full border border-white/5 bg-[#0a0a0a] text-white/60 text-sm font-medium">
                     {nicho}
                   </div>
                ))}
              </div>
           </div>
        </section>

        {/* SECTION: DEPOIMENTOS */}
        <section className="py-24 px-4 border-t border-white/5 bg-[#061022]">
           <div className="max-w-[1200px] mx-auto text-center mb-16">
             <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-bold text-white/60 mb-6 uppercase tracking-wider">
               QUEM JÁ USOU
             </div>
             <h2 className="font-display text-4xl md:text-5xl font-black mb-4 text-white">Gente real criando e vendendo</h2>
             <p className="text-white/60 text-lg">Depoimentos de quem usou o EbookAI Builder pra tirar o ebook do papel.</p>
           </div>

           <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { nome: "Mariana", nicho: "Nicho de emagrecimento saudável", texto: "Criei o ebook com a IA em poucos minutos e já comecei a vender na mesma semana." },
                { nome: "Lucas", nicho: "Nicho de renda extra", texto: "Transformei uma ideia solta num produto completo, com oferta pronta pra venda. Recomendo demais!" },
                { nome: "Ana", nicho: "Nicho de beleza e autocuidado", texto: "Nunca fui boa com Canva ou ChatGPT. Criei minha estrutura em minutos e já coloquei pra rodar." },
                { nome: "Felipe", nicho: "Nicho de culinária e receitas", texto: "Minhas vendas dobraram! A copy da página de vendas que o sistema gerou é fora do comum. Perfeito." }
              ].map((dep, i) => (
                 <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
                    <div>
                      <div className="text-yellow-400 font-serif text-5xl h-8 overflow-hidden mb-4">"</div>
                      <p className="text-white/80 text-sm leading-relaxed mb-8">{dep.texto}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">{dep.nome.charAt(0)}</div>
                       <div>
                         <div className="text-white font-bold text-sm leading-none mb-1">{dep.nome}</div>
                         <div className="text-white/40 text-[11px] leading-tight">{dep.nicho}</div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </section>

        {/* PRICING SECTION */}
        <section id="planos" className="pt-24 pb-12 px-4 relative bg-[#030814] border-t border-white/5">
          <div className="max-w-[1000px] mx-auto text-center mb-16">
             <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-bold text-white/60 mb-6 uppercase tracking-wider">
               PLANOS
             </div>
             <h2 className="font-display text-4xl md:text-5xl font-black mb-4 text-white">Esse é o valor da sua liberdade hoje</h2>
             <p className="text-white/60 text-lg">Pagamento seguro via PIX ou cartão. 7 dias de garantia em qualquer plano — sem risco.</p>
          </div>

          <div className="max-w-[900px] mx-auto grid md:grid-cols-2 gap-6 items-stretch">
            {/* PLANO MENSAL */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 flex flex-col relative">
               <h3 className="text-2xl font-bold text-white mb-2">Mensal</h3>
               <p className="text-white/40 text-sm mb-8">Ideal pra testar sem compromisso.</p>
               
               <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-lg font-bold text-white/60">R$</span>
                  <span className="text-[3.5rem] font-display font-black text-white leading-none tracking-tighter">147,90</span>
                  <span className="text-white/40 text-sm ml-1">/mês</span>
               </div>
               
               <ul className="space-y-4 mb-10 flex-1">
                 {["Ebooks ilimitados com IA", "Estrutura e capítulos automáticos", "Página de vendas incluída", "Download em PDF", "Cancele quando quiser, sem multa"].map((item, i) => (
                   <li key={i} className="flex items-start gap-3 text-white/70 text-sm font-medium">
                      <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> {item}
                   </li>
                 ))}
               </ul>
               
               <a href={CHECKOUT_LINKS.monthly} className="block w-full mt-auto">
                 <Button className="w-full h-14 rounded-xl font-bold text-sm bg-yellow-400 hover:bg-yellow-500 text-black border border-none shadow-lg transition-all">
                   COMEÇAR NO MENSAL
                 </Button>
               </a>
            </div>

            {/* PLANO VITALÍCIO */}
            <div className="bg-[#0c1322] border border-blue-500/50 rounded-3xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(59,130,246,0.15)] mt-4 md:mt-0">
               <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">
                  MELHOR CUSTO-BENEFÍCIO
               </div>
               
               <h3 className="text-2xl font-bold text-blue-400 mb-2 mt-2 text-center">Vitalício</h3>
               <p className="text-white/40 text-sm mb-8 text-center">Pague uma vez. Use para sempre, sem mensalidade.</p>
               
               <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-lg font-bold text-white/60">R$</span>
                  <span className="text-[4rem] font-display font-black text-white leading-none tracking-tighter">247,90</span>
               </div>
               <div className="text-center text-white/30 text-xs mb-8">pagamento único · menos de 2 meses do plano mensal</div>
               
               <ul className="space-y-4 mb-10 flex-1">
                 {["Tudo do plano mensal, pra sempre", "Ebooks ilimitados com IA", "Páginas de vendas incluídas", "Download em PDF", "Nunca mais pague de novo"].map((item, i) => (
                   <li key={i} className="flex items-start gap-3 text-white text-sm font-medium">
                      <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> {item}
                   </li>
                 ))}
               </ul>
               
               <a href={CHECKOUT_LINKS.lifetime} className="block w-full mt-auto">
                 <Button className="w-full h-14 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all">
                   GARANTIR ACESSO VITALÍCIO <ArrowRight className="ml-2 w-4 h-4" />
                 </Button>
               </a>
               
               <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-white/40 font-medium">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" /> Pagamento seguro</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" /> 7 dias de garantia</span>
               </div>
            </div>
          </div>
        </section>

        {/* GUARANTEE BOX (Risco zero) */}
        <section className="pb-24 px-4 bg-[#030814]">
           <div className="max-w-[900px] mx-auto bg-[#061022] border border-green-500/30 rounded-2xl p-6 md:p-8 flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-green-500 shrink-0 mt-1" />
              <div>
                <h4 className="text-green-500 font-bold text-lg mb-2">Risco zero: 7 dias de garantia</h4>
                <p className="text-white/60 text-sm leading-relaxed">Teste a plataforma por 7 dias. Se não for pra você, é só pedir e devolvemos 100% do seu dinheiro — sem perguntas, sem burocracia. Você só tem a ganhar.</p>
              </div>
           </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-24 px-4 border-t border-white/5 bg-[#061022]">
           <div className="max-w-[800px] mx-auto">
              <div className="text-center mb-12">
                 <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-bold text-blue-400 mb-6 uppercase tracking-wider">
                   DÚVIDAS
                 </div>
                 <h2 className="font-display text-4xl md:text-5xl font-black text-white">Perguntas frequentes</h2>
              </div>
              
              <div className="flex flex-col">
                <FAQItem 
                  question="O que é o EbookAI Builder?" 
                  answer="Somos a plataforma definitiva para você criar e vender ebooks gerados por Inteligência Artificial em poucos minutos, incluindo página de vendas e estrutura completa." 
                />
                <FAQItem 
                  question="Como funciona a geração do ebook?" 
                  answer="Você digita o nicho e o assunto, nossa IA estrutura todos os capítulos e cria o conteúdo base, e você exporta o produto 100% pronto." 
                />
                <FAQItem 
                  question="Preciso saber escrever ou ter experiência?" 
                  answer="Não. A Inteligência Artificial cuida de 100% da escrita e do layout para você. Basta revisar." 
                />
                <FAQItem 
                  question="O ebook sai em PDF?" 
                  answer="Sim, você exporta o material diagramado e limpo em formato PDF, pronto para entrega aos seus clientes." 
                />
                <FAQItem 
                  question="A página de vendas vem junto?" 
                  answer="Sim! Nós já entregamos a copy e a estrutura da página de vendas otimizada para o seu nicho." 
                />
                <FAQItem 
                  question="Qual a diferença entre o plano mensal e o vitalício?" 
                  answer="O plano mensal tem renovação automática a cada mês. O vitalício você paga uma única vez e tem acesso garantido à ferramenta para sempre, sem nenhuma taxa adicional." 
                />
                <FAQItem 
                  question="Existe garantia?" 
                  answer="Oferecemos 7 dias de garantia incondicional. Caso não goste, devolveremos 100% do seu valor." 
                />
                <FAQItem 
                  question="O conteúdo é original?" 
                  answer="Com certeza. A IA gera um conteúdo completamente novo e exclusivo para você a cada requisição." 
                />
              </div>
           </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-32 px-4 relative overflow-hidden bg-gradient-to-b from-[#061022] to-[#030814]">
           <div className="absolute top-0 -left-[10%] w-[600px] h-[300px] bg-blue-600/10 blur-[150px] rounded-[100%] rotate-45 pointer-events-none" />
           <div className="absolute bottom-0 -right-[10%] w-[500px] h-[200px] bg-blue-500/10 blur-[120px] rounded-[100%] -rotate-45 pointer-events-none" />
           
           <div className="max-w-[800px] mx-auto text-center relative z-10">
              <h2 className="font-display text-4xl md:text-5xl font-black mb-6 text-white leading-tight">
                 Seu próximo produto digital <span className="text-yellow-400">começa agora, não amanhã.</span>
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
                 Escolha o nicho, a IA cria tudo, e em minutos você tem um produto pronto pra vender. Com 7 dias de garantia, o único risco é continuar adiando.
              </p>
              
              <a href="#planos">
                 <Button size="lg" className="h-16 px-10 rounded-xl text-lg font-bold bg-yellow-400 hover:bg-yellow-500 text-black shadow-[0_0_40px_rgba(250,204,21,0.3)] transition-all border-none">
                    <Zap className="mr-2 w-5 h-5" /> Quero meu ebook agora
                 </Button>
              </a>
           </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#030814] py-12 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden border border-white/10">
              <img src={saasLogo} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-base font-bold tracking-tight text-white">
              EbookAI Builder
            </span>
          </Link>
          
          <div className="text-white/30 text-xs">
            © {new Date().getFullYear()} EbookAI Builder - Todos os direitos reservados
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
