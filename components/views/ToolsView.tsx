import { useState } from "react";
import { 
  Sparkles, 
  PenLine, 
  Lightbulb, 
  Search, 
  Image, 
  TrendingUp, 
  ArrowUpRight, 
  Share2, 
  Users, 
  Facebook, 
  Globe 
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const iconMap = { Sparkles, PenLine, Lightbulb, Search, Image, TrendingUp };

interface FacebookGroup {
  nome: string;
  link: string;
  membros?: string;
}

export function ToolsView() {
  const [nicho, setNicho] = useState("");
  const [grupos, setGrupos] = useState<FacebookGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const buscaGruposPorNicho = (nicho: string): FacebookGroup[] => {
    // Função mockada para simular busca de grupos
    return [
      { 
        nome: `Marketing de Afiliados - ${nicho}`, 
        link: `https://www.facebook.com/groups/search/groups/?q=${encodeURIComponent(nicho + " marketing")}`,
        membros: "45k membros"
      },
      { 
        nome: `Ebooks e Infoprodutos: ${nicho}`, 
        link: `https://www.facebook.com/groups/search/groups/?q=${encodeURIComponent(nicho + " ebooks")}`,
        membros: "12k membros"
      },
      { 
        nome: `Vendas Online Brasil (${nicho})`, 
        link: `https://www.facebook.com/groups/search/groups/?q=${encodeURIComponent(nicho + " vendas")}`,
        membros: "89k membros"
      },
      { 
        nome: `Divulgação de Projetos - ${nicho}`, 
        link: `https://www.facebook.com/groups/search/groups/?q=${encodeURIComponent(nicho + " divulgação")}`,
        membros: "23k membros"
      },
    ];
  };

  const handleSearch = () => {
    if (!nicho.trim()) {
      toast.error("Por favor, insira um nicho para buscar.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    // Simulando um pequeno delay para o loading
    setTimeout(() => {
      const gruposSugeridos = buscaGruposPorNicho(nicho);
      setGrupos(gruposSugeridos);
      setLoading(false);
      toast.success(`Encontramos sugestões para o nicho ${nicho}!`);
    }, 800);
  };

  const handleGoogleSearch = () => {
    if (!nicho.trim()) {
      toast.error("Por favor, insira um nicho.");
      return;
    }
    const query = `site:facebook.com/groups "${nicho}"`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
  };

  const tools = [
    { id: 1, name: "Gerador de Títulos", desc: "Crie títulos magnéticos com IA", icon: "Sparkles", color: "from-violet-500 to-purple-500" },
    { id: 2, name: "Gerador de Copy", desc: "Textos persuasivos para vendas", icon: "PenLine", color: "from-pink-500 to-rose-500" },
    { id: 3, name: "Ideias de Nicho", desc: "Descubra nichos lucrativos", icon: "Lightbulb", color: "from-amber-500 to-orange-500" },
    { id: 4, name: "Analisador de Concorrência", desc: "Estude o mercado em segundos", icon: "Search", color: "from-blue-500 to-cyan-500" },
    { id: 5, name: "Gerador de Capas", desc: "Capas profissionais com IA", icon: "Image", color: "from-emerald-500 to-teal-500" },
    { id: 6, name: "Otimizador SEO", desc: "Melhore seu posicionamento", icon: "TrendingUp", color: "from-indigo-500 to-violet-500" },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Ferramentas</h1>
        <p className="mt-1 text-muted-foreground">Recursos extras para acelerar a criação dos seus ebooks.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => {
          const Icon = iconMap[t.icon as keyof typeof iconMap];
          return (
            <button
              key={t.id}
              onClick={() => toast.success(`${t.name} em breve!`)}
              className="group relative overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-soft transition hover:shadow-elevated hover:-translate-y-1"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${t.color} text-white shadow-md`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">Divulgação</h2>
            <p className="text-muted-foreground">Encontre onde promover seu ebook para maximizar vendas.</p>
          </div>
        </div>

        <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Onde divulgar seu ebook?</CardTitle>
            <CardDescription>Digite o nicho do seu ebook e encontraremos os melhores grupos no Facebook para você.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ex: Emagrecimento, Investimentos, Culinária..."
                  className="pl-10 h-12"
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                className="h-12 px-8 gradient-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Buscando...
                  </span>
                ) : (
                  "Buscar Grupos"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Sugestões para "{nicho}"
                </h3>
                <Button variant="outline" size="sm" onClick={handleGoogleSearch} className="text-xs">
                  <Globe className="w-3 h-3 mr-2" />
                  Ver no Google
                </Button>
              </div>

              {grupos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {grupos.map((grupo, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:border-primary/50 transition-colors">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between">
                            <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                              <Facebook className="w-4 h-4" />
                            </div>
                            {grupo.membros && (
                              <span className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full uppercase">
                                {grupo.membros}
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <CardTitle className="text-base line-clamp-1">{grupo.nome}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">Grupo público no Facebook</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-between hover:bg-primary/10 hover:text-primary transition-all group"
                            asChild
                          >
                            <a href={grupo.link} target="_blank" rel="noopener noreferrer">
                              Acessar Grupo
                              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 p-10 text-center">
                  <p className="text-muted-foreground italic">Nenhum grupo encontrado especificamente para "{nicho}". Tente um termo mais amplo.</p>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
