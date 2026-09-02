import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Check, ArrowRight, ShieldCheck, 
  FileText, LayoutTemplate, Video, TrendingUp
} from "lucide-react";
import { CHECKOUT_LINKS } from "@/config/checkoutLinks";
import saasLogo from "@/assets/saas-logo.jpg";
import { PreviewCarousel } from "@/components/PreviewCarousel";

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
    // Fundo predominante AZUL bem escuro/profundo (para imitar a vibe do print, mas na sua cor)
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
          {/* Blobs de fundo no estilo do print (mas em tons azuis) */}
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
            
            <motion.h1 variants={fadeIn} className="font-display text-5xl md:text-[5.5rem] font-black tracking-tight leading-[1.05] mb-6 text-white">
              Não sabe criar um <br className="hidden md:block"/>
              produto nem onde <br className="hidden md:block"/>
              vender? <span className="text-yellow-400">Aqui, resolvemos <br className="hidden md:block"/> os dois.</span>
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
              <a href="#demo" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-xl text-base font-bold bg-transparent border-white/20 text-white hover:bg-white/5 transition-all">
                  Ver um ebook gerado pela IA
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Floating UI Mockup - Imitando o print (fundo escuro/preto com menu de abas) */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="w-full max-w-[1000px] mt-24 relative z-20"
          >
            {/* Tabs style from print */}
            <div className="flex justify-center gap-2 mb-4 overflow-x-auto pb-2">
               <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white/80 text-sm font-medium">
                 <FileText className="w-4 h-4" /> Ebook
               </div>
               <ArrowRight className="w-4 h-4 text-white/20 my-auto" />
               <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white/80 text-sm font-medium">
                 <ShieldCheck className="w-4 h-4" /> Checkout
               </div>
               <ArrowRight className="w-4 h-4 text-white/20 my-auto" />
               <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white/80 text-sm font-medium">
                 <LayoutTemplate className="w-4 h-4" /> Página
               </div>
               <ArrowRight className="w-4 h-4 text-white/20 my-auto" />
               <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white/80 text-sm font-medium">
                 <Video className="w-4 h-4" /> Videos
               </div>
               <ArrowRight className="w-4 h-4 text-white/20 my-auto" />
               <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white/80 text-sm font-medium">
                 <TrendingUp className="w-4 h-4" /> Vender
               </div>
            </div>

            <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden aspect-video max-h-[500px]">
              {/* Fake browser header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#111]">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="ml-4 text-xs text-white/30 font-mono">app.ebookaibuilder.com.br</div>
              </div>
              
              {/* Content area inside mockup (dark) */}
              <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#151515] to-[#050505]">
                 <PreviewCarousel />
                 {/* Overlay to match print aesthetics */}
                 <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-black/60">
                    <div className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded uppercase tracking-wider mb-4 border border-green-500/20">
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

          {/* Social Proof Badges under mockup */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-[1000px] mt-16 text-left">
             <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Feito no Brasil</div>
                <div className="text-xs text-white/50 ml-3.5">100% em português</div>
             </div>
             <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> IA de ponta</div>
                <div className="text-xs text-white/50 ml-3.5">Modelos de última geração</div>
             </div>
             <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> Pagamento seguro</div>
                <div className="text-xs text-white/50 ml-3.5">PIX e cartão</div>
             </div>
             <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 7 dias de garantia</div>
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
            {/* Antes Card (Darker/Black) */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-10 flex flex-col justify-start">
               <div className="text-white/40 text-xs font-bold tracking-wider mb-4">ANTES</div>
               <h3 className="text-2xl font-bold text-white mb-8">Uma ideia solta</h3>
               
               <ul className="space-y-4">
                 <li className="text-white/50 flex items-start gap-3">
                    <span className="mt-1 opacity-50">-</span> Não sabe por onde começar a escrever
                 </li>
                 <li className="text-white/50 flex items-start gap-3">
                    <span className="mt-1 opacity-50">-</span> Não tem página de vendas nem checkout
                 </li>
                 <li className="text-white/50 flex items-start gap-3">
                    <span className="mt-1 opacity-50">-</span> Não sabe como divulgar o produto
                 </li>
                 <li className="text-white/50 flex items-start gap-3">
                    <span className="mt-1 opacity-50">-</span> Levaria dias (ou nunca sairia do papel)
                 </li>
               </ul>
            </div>

            {/* Depois Card (Highlight) */}
            <div className="bg-[#0f1422] border border-blue-500/20 rounded-3xl p-10 flex flex-col justify-start relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-1 bg-blue-500/50"></div>
               <div className="text-blue-400 text-xs font-bold tracking-wider mb-4">DEPOIS</div>
               <h3 className="text-2xl font-bold text-white mb-8">Um produto pronto para vender</h3>
               
               <ul className="space-y-4">
                 <li className="text-white/80 flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 shrink-0" /> Ebook completo, escrito pela IA em minutos
                 </li>
                 <li className="text-white/80 flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 shrink-0" /> Página de vendas e checkout já configurados
                 </li>
                 <li className="text-white/80 flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 shrink-0" /> Roteiros de vídeo prontos para gravar
                 </li>
                 <li className="text-white/80 flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 shrink-0" /> Você só precisa revisar e divulgar
                 </li>
               </ul>
            </div>
          </div>
        </section>

        {/* SECTION: INTEGRAÇÕES */}
        <section className="py-24 px-4 border-t border-white/5 bg-[#061022]">
           <div className="max-w-[1000px] mx-auto text-center">
             <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-bold text-white/60 mb-6 uppercase tracking-wider">
               INTEGRAÇÕES
             </div>
             <h2 className="font-display text-3xl md:text-4xl font-bold mb-10 text-white">Integrado com as principais plataformas de pagamento do Brasil</h2>
             
             <div className="flex flex-wrap justify-center gap-4 mb-8">
               {["PerfectPay", "Kiwify", "Cakto", "Hotmart", "Appify"].map((gateway, i) => (
                  <div key={i} className="px-6 py-3 rounded-xl border border-white/10 bg-black/30 text-white/70 font-bold text-sm">
                    {gateway}
                  </div>
               ))}
             </div>
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

           {/* Infinite Marquee of niches */}
           <div className="relative flex w-[200%] md:w-auto overflow-hidden py-4 opacity-70">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#030814] to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#030814] to-transparent z-10" />
              
              <div className="flex items-center gap-4 px-4 animate-marquee whitespace-nowrap">
                {["Receitas fit", "Marketing digital", "Produtividade", "Emagrecimento", "Finanças pessoais", "Relacionamento", "Desenvolvimento pessoal", "Idiomas", "Maternidade", "Espiritualidade", "Pets", "Beleza e autocuidado"].map((nicho, i) => (
                   <div key={i} className="px-6 py-2.5 rounded-full border border-white/10 bg-[#0a0a0a] text-white/60 text-sm font-medium">
                     {nicho}
                   </div>
                ))}
                {/* Duplicate for infinite effect */}
                 {["Receitas fit", "Marketing digital", "Produtividade", "Emagrecimento", "Finanças pessoais", "Relacionamento", "Desenvolvimento pessoal", "Idiomas", "Maternidade", "Espiritualidade", "Pets", "Beleza e autocuidado"].map((nicho, i) => (
                   <div key={i+20} className="px-6 py-2.5 rounded-full border border-white/10 bg-[#0a0a0a] text-white/60 text-sm font-medium">
                     {nicho}
                   </div>
                ))}
              </div>
           </div>
        </section>

        {/* SECTION: DEPOIMENTOS */}
        <section className="py-24 px-4 border-t border-white/5 bg-[#061022]">
           <div className="max-w-[1000px] mx-auto text-center mb-16">
             <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-bold text-white/60 mb-6 uppercase tracking-wider">
               QUEM JÁ USOU
             </div>
             <h2 className="font-display text-4xl md:text-5xl font-black mb-4 text-white">Gente real criando e vendendo</h2>
             <p className="text-white/60 text-lg">Depoimentos de quem usou o EbookAI Builder pra tirar o ebook do papel.</p>
           </div>

           <div className="max-w-[1000px] mx-auto grid md:grid-cols-3 gap-6">
              {[
                { nome: "Mariana", nicho: "Nicho de emagrecimento", texto: "Criei o ebook com a IA em poucos minutos e já comecei a vender na mesma semana." },
                { nome: "Lucas", nicho: "Nicho de renda extra", texto: "Transformei uma ideia que tinha solta em um ebook completo, com oferta pronta pra venda. Recomendo demais!" },
                { nome: "Ana", nicho: "Nicho de beleza", texto: "Nunca fui boa com Canva, ChatGPT etc. A ferramenta resolveu meu problema: criei minha estrutura em minutos e já coloquei pra vender." }
              ].map((dep, i) => (
                 <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
                    <div>
                      <div className="text-yellow-400 font-serif text-4xl mb-4">"</div>
                      <p className="text-white/80 text-sm leading-relaxed mb-8">{dep.texto}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">{dep.nome.charAt(0)}</div>
                       <div>
                         <div className="text-white font-bold text-sm">{dep.nome}</div>
                         <div className="text-white/40 text-xs">{dep.nicho}</div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </section>

        {/* PRICING SECTION - Imitando estritamente a estrutura do print (Mensal lado esquerdo, Vitalicio lado direito com destaque) */}
        <section id="planos" className="py-24 md:py-32 px-4 relative bg-[#030814] border-t border-white/5">
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
                   <li key={i} className="flex items-start gap-3 text-white/70 text-sm">
                      <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> {item}
                   </li>
                 ))}
               </ul>
               
               <a href={CHECKOUT_LINKS.monthly} className="block w-full mt-auto">
                 <Button className="w-full h-14 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all">
                   COMEÇAR NO MENSAL
                 </Button>
               </a>
            </div>

            {/* PLANO VITALÍCIO */}
            <div className="bg-[#0c1322] border border-blue-500/50 rounded-3xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(59,130,246,0.15)] mt-4 md:mt-0">
               {/* Badge topo */}
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

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#030814] py-12 px-4">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden border border-white/10">
              <img src={saasLogo} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-base font-bold tracking-tight text-white">
              EbookAI Builder
            </span>
          </Link>
          
          <div className="flex items-center gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Políticas de Privacidade</a>
          </div>
          
          <div className="text-white/20 text-xs">
            © {new Date().getFullYear()} EbookAI Builder. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
