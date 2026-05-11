import { Sparkles, PenLine, Lightbulb, Search, Image, TrendingUp, ArrowUpRight } from "lucide-react";
// tools from mockData removed
import { toast } from "sonner";

const iconMap = { Sparkles, PenLine, Lightbulb, Search, Image, TrendingUp };

export function ToolsView() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Ferramentas</h1>
        <p className="mt-1 text-muted-foreground">Recursos extras para acelerar a criação dos seus ebooks.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { id: 1, name: "Gerador de Títulos", desc: "Crie títulos magnéticos com IA", icon: "Sparkles", color: "from-violet-500 to-purple-500" },
          { id: 2, name: "Gerador de Copy", desc: "Textos persuasivos para vendas", icon: "PenLine", color: "from-pink-500 to-rose-500" },
          { id: 3, name: "Ideias de Nicho", desc: "Descubra nichos lucrativos", icon: "Lightbulb", color: "from-amber-500 to-orange-500" },
          { id: 4, name: "Analisador de Concorrência", desc: "Estude o mercado em segundos", icon: "Search", color: "from-blue-500 to-cyan-500" },
          { id: 5, name: "Gerador de Capas", desc: "Capas profissionais com IA", icon: "Image", color: "from-emerald-500 to-teal-500" },
          { id: 6, name: "Otimizador SEO", desc: "Melhore seu posicionamento", icon: "TrendingUp", color: "from-indigo-500 to-violet-500" },
        ].map((t) => {
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
    </div>
  );
}
