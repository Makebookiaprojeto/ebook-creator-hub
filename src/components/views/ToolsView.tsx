import { Sparkles, PenLine, Lightbulb, Search, Image, TrendingUp, ArrowUpRight } from "lucide-react";
import { tools } from "@/lib/mockData";
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
    </div>
  );
}
