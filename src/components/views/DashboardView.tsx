import { useState, useEffect } from "react";
import { BookOpen, Eye, ShoppingCart, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { useEbooks } from "@/hooks/useEbooks";
import { useAuth } from "@/hooks/useAuth";

const statusLabel: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

export function DashboardView() {
  const { user: authUser } = useAuth();
  const { ebooks, loading: loadingEbooks } = useEbooks();
  const [dbDisplayName, setDbDisplayName] = useState<string | null>(null);
  const [quote, setQuote] = useState("");
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    views: "0",
  });
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const quotes = [
    "Sua criatividade é a única fronteira para o seu sucesso.",
    "Cada eBook é uma nova porta aberta para a sua liberdade digital.",
    "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    "Não espere pela inspiração, crie sua própria oportunidade.",
    "Seu conhecimento tem valor. Transforme-o em lucro hoje.",
    "A melhor forma de prever o futuro é criando-o.",
    "Grandes impérios começam com uma simples ideia.",
    "Foque no progresso, não na perfeição.",
    "Você está a um passo de mudar sua realidade financeira.",
    "A consistência é a chave que abre a porta da escala."
  ];

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  useEffect(() => {
    if (!authUser) return;

    const fetchDashboardData = async () => {
      setLoadingStats(true);
      try {
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", authUser.id)
          .maybeSingle();
        if (profile) setDbDisplayName(profile.display_name);

        // Vendas confirmadas dos eBooks deste autor
        // ebook_sales tem RLS "Owners can view sales of their ebooks" → filtra automático
        const { data: sales } = await supabase
          .from("ebook_sales")
          .select("amount_paid_cents, created_at, status")
          .eq("status", "paid");

        if (sales) {
          const totalSales = sales.length;
          const totalRevenue =
            sales.reduce((acc, s) => acc + (s.amount_paid_cents || 0), 0) / 100;

          setStats((prev) => ({
            ...prev,
            totalSales,
            totalRevenue,
          }));

          // Agrupa por mês (últimos 6 meses)
          const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return {
              month: date.toLocaleString("pt-BR", { month: "short" }),
              vendas: 0,
              timestamp: date.getTime(),
            };
          }).reverse();

          sales.forEach((s) => {
            if (!s.created_at) return;
            const d = new Date(s.created_at);
            const monthName = d.toLocaleString("pt-BR", { month: "short" });
            const m = last6Months.find((x) => x.month === monthName);
            if (m) m.vendas += 1;
          });

          setSalesHistory(last6Months);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardData();

    // Realtime: atualiza quando uma nova venda chegar
    const channel = supabase
      .channel(`dashboard-sales-${authUser.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ebook_sales" },
        () => fetchDashboardData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser]);

  const displayName =
    dbDisplayName ||
    (authUser?.user_metadata?.display_name as string | undefined) ||
    authUser?.email?.split("@")[0] ||
    "Usuário";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold">Olá, {displayName} 👋</h1>
        <p className="text-sm italic text-primary/80 animate-fade-in">"{quote}"</p>
        <p className="mt-2 text-muted-foreground text-sm">Aqui está o resumo do seu negócio hoje.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ebooks criados" value={String(ebooks.length)} delta={ebooks.length > 0 ? `+${ebooks.length}` : "0"} icon={BookOpen} tint="from-violet-500 to-purple-500" />
        <StatCard label="Visualizações" value={stats.views} delta="+0%" icon={Eye} tint="from-blue-500 to-cyan-500" />
        <StatCard label="Vendas" value={String(stats.totalSales)} delta={stats.totalSales > 0 ? `+${stats.totalSales}` : "0"} icon={ShoppingCart} tint="from-emerald-500 to-teal-500" />
        <StatCard label="Receita" value={`R$ ${stats.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} delta="0%" icon={DollarSign} tint="from-amber-500 to-orange-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Performance de vendas</h2>
              <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
            </div>
            {salesHistory.length === 0 && <Badge variant="secondary">Sem dados</Badge>}
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesHistory.length > 0 ? salesHistory : [{month: 'Jan', vendas: 0}, {month: 'Jun', vendas: 0}]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="vendas" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#colorVendas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Atividade rápida</h2>
          <p className="mb-4 text-sm text-muted-foreground">Novidades recentes</p>
          <ul className="space-y-3">
            {stats.totalSales > 0 ? (
               <li className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-sm">{stats.totalSales} vendas realizadas</span>
              </li>
            ) : (
              <li className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition">
                <span className="h-2 w-2 rounded-full bg-muted" />
                <span className="text-sm text-muted-foreground">Nenhuma venda ainda</span>
              </li>
            )}
            {ebooks.length > 0 && (
              <li className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">{ebooks[0].title} criado recentemente</span>
              </li>
            )}
            <li className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-sm">Sistema de suporte ativo</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Últimos ebooks criados</h2>
            <p className="text-sm text-muted-foreground">Gerencie seus produtos digitais</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr className="text-left text-xs font-medium uppercase text-muted-foreground">
                <th className="px-6 py-3">Título</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Criado em</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loadingEbooks && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              )}
              {!loadingEbooks && ebooks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    Nenhum ebook ainda. Crie seu primeiro na aba "Criar ebook".
                  </td>
                </tr>
              )}
              {!loadingEbooks && ebooks.map((e) => (
                <tr key={e.id} className="text-sm transition hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{e.title}</td>
                  <td className="px-6 py-4 text-muted-foreground">{e.category ?? "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(e.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={e.status === "published" ? "default" : "secondary"}
                      className={e.status === "published" ? "bg-success hover:bg-success" : ""}
                    >
                      {statusLabel[e.status] ?? e.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
