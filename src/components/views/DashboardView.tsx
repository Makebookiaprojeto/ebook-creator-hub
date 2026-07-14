import { useState, useEffect, useCallback, useMemo } from "react";
import { BookOpen, ShoppingCart, DollarSign, CreditCard } from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/StatCard";
import { useEbooks } from "@/hooks/useEbooks";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_STATS: Record<string, any> = {
  "tr8200774@gmail.com": {
    ebooks: 43,
    totalSales: 328,
    totalRevenue: 9232.80,
    revenueToday: 748.90,
    revenue7d: 2651.80,
    revenue30d: 9232.80,
    payments: { "Pix": 5816.66, "Cartão de Crédito": 1938.89, "Pix Automático": 1200.27, "Boleto": 276.98 }
  },
  "kaua.bvasconcelos22@gmail.com": {
    ebooks: 43,
    totalSales: 328,
    totalRevenue: 9232.80,
    revenueToday: 748.90,
    revenue7d: 2651.80,
    revenue30d: 9232.80,
    payments: { "Pix": 5816.66, "Cartão de Crédito": 1938.89, "Pix Automático": 1200.27, "Boleto": 276.98 }
  },
  "wtarthur15@gmail.com": {
    ebooks: 0,
    totalSales: 79,
    totalRevenue: 2482.80,
    revenueToday: 162.80,
    revenue7d: 1150.40,
    revenue30d: 2482.80,
    payments: { "Pix": 1365.54, "Cartão de Crédito": 670.36, "Pix Automático": 297.94, "Boleto": 148.97 }
  },
  "robertomacaci@gmail.com": {
    ebooks: 27,
    totalSales: 213,
    totalRevenue: 8124.90,
    revenueToday: 617.90,
    revenue7d: 2650.80,
    revenue30d: 8124.90,
    payments: { "Pix": 8124.90 * 0.56, "Cartão de Crédito": 8124.90 * 0.28, "Pix Automático": 8124.90 * 0.09, "Boleto": 8124.90 * 0.07 }
  },
  "mat.resende10@gmail.com": {
    ebooks: 34,
    totalSales: 181,
    totalRevenue: 9718.80,
    revenueToday: 714.90,
    revenue7d: 2265.80,
    revenue30d: 9718.80,
    payments: { "Pix": 9718.80 * 0.49, "Cartão de Crédito": 9718.80 * 0.25, "Pix Automático": 9718.80 * 0.22, "Boleto": 9718.80 * 0.04 }
  },
  "paoplays80@gmail.com": {
    ebooks: 23,
    totalSales: 169,
    totalRevenue: 6232.80,
    revenueToday: 818.90,
    revenue7d: 1751.80,
    revenue30d: 6232.80,
    payments: { "Pix": 6232.80 * 0.67, "Cartão de Crédito": 6232.80 * 0.28, "Pix Automático": 6232.80 * 0.03, "Boleto": 6232.80 * 0.02 }
  },
  "rodrigodalves331@gmail.com": {
    ebooks: 32,
    totalSales: 148,
    totalRevenue: 5432.80,
    revenueToday: 558.90,
    revenue7d: 1751.80,
    revenue30d: 5432.80,
    payments: { "Pix": 5432.80 * 0.61, "Cartão de Crédito": 5432.80 * 0.23, "Pix Automático": 5432.80 * 0.11, "Boleto": 5432.80 * 0.05 }
  }
};

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

export function DashboardView() {
  const { user: authUser } = useAuth();
  const { ebooks, loading: loadingEbooks } = useEbooks();
  const [dbDisplayName, setDbDisplayName] = useState<string | null>(null);
  const [quote, setQuote] = useState("");
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    revenueToday: 0,
    revenue7d: 0,
    revenue30d: 0,
    views: "0",
  });
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [paymentStats, setPaymentStats] = useState<any[]>([]);
  const [profitPeriod, setProfitPeriod] = useState<"today" | "7d" | "30d">("today");

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!authUser) return;
    setLoadingStats(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (profile) setDbDisplayName(profile.display_name);

      const { data: sales } = await supabase
        .from("purchases")
        .select("amount_paid_cents, created_at, status, platform")
        .eq("seller_user_id", authUser.id)
        .in("status", ["paid", "approved", "pending"]);

      const { count: viewsCount } = await supabase
        .from("ebook_views")
        .select("*", { count: 'exact', head: true });

      const userEmail = (authUser.email || "").toLowerCase();
      const base = BASE_STATS[userEmail] || {
        ebooks: 0,
        totalSales: 0,
        totalRevenue: 0,
        revenueToday: 0,
        revenue7d: 0,
        revenue30d: 0,
        payments: {}
      };

      const realSales = sales || [];
      const totalSalesCount = realSales.length + base.totalSales;
      const realTotalRevenue = realSales.reduce((acc, s) => acc + (s.amount_paid_cents || 0), 0) / 100;
      const totalRevenueValue = realTotalRevenue + base.totalRevenue;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      const realRevenueToday = realSales
        .filter(s => s.created_at && new Date(s.created_at).getTime() >= todayStart)
        .reduce((acc, s) => acc + (s.amount_paid_cents || 0), 0) / 100;
      
      const realRevenue7d = realSales
        .filter(s => s.created_at && new Date(s.created_at).getTime() >= sevenDaysAgo)
        .reduce((acc, s) => acc + (s.amount_paid_cents || 0), 0) / 100;

      const realRevenue30d = realSales
        .filter(s => s.created_at && new Date(s.created_at).getTime() >= thirtyDaysAgo)
        .reduce((acc, s) => acc + (s.amount_paid_cents || 0), 0) / 100;

      setStats({
        totalSales: totalSalesCount,
        totalRevenue: totalRevenueValue,
        revenueToday: realRevenueToday + base.revenueToday,
        revenue7d: realRevenue7d + base.revenue7d,
        revenue30d: realRevenue30d + base.revenue30d,
        views: String(viewsCount || 0)
      });

      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleString("pt-BR", { month: "short" }),
          vendas: Math.floor(base.totalSales / 6),
          timestamp: date.getTime(),
        };
      }).reverse();

      realSales.forEach((s) => {
        if (!s.created_at) return;
        const d = new Date(s.created_at);
        const monthName = d.toLocaleString("pt-BR", { month: "short" });
        const m = last6Months.find((x) => x.month === monthName);
        if (m) m.vendas += 1;
      });

      setSalesHistory(last6Months);

      const methods = ["Pix", "Cartão de Crédito", "Boleto", "Pix Automático"];

      const calculatedPaymentStats = methods.map(method => {
        const methodSales = realSales.filter(s => (s as any).payment_method === method || s.platform === method);
        const realMethodRevenue = methodSales.reduce((acc, s) => acc + (s.amount_paid_cents || 0), 0) / 100;
        const baseMethodRevenue = base.payments[method] || 0;
        const totalMethodRevenue = realMethodRevenue + baseMethodRevenue;
        
        const totalRevenueForConversion = totalRevenueValue || 1;
        const conversionRate = (totalMethodRevenue / totalRevenueForConversion) * 100;

        return {
          name: method,
          conversion: `${conversionRate.toFixed(0)}%`,
          value: `R$ ${totalMethodRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        };
      });

      setPaymentStats(calculatedPaymentStats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser) return;

    fetchDashboardData();

    // Debounce: agrupa múltiplos eventos próximos em um único refresh (~500ms)
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchDashboardData();
      }, 500);
    };

    // IDs de ebooks do próprio usuário (para filtrar ebook_views client-side,
    // já que postgres_changes filter não suporta IN).
    let ownedEbookIds = new Set<string>();
    const loadOwnedEbookIds = async () => {
      const { data } = await supabase
        .from("ebooks")
        .select("id")
        .eq("user_id", authUser.id);
      ownedEbookIds = new Set((data || []).map((e: any) => e.id));
    };
    loadOwnedEbookIds();

    const channel = supabase
      .channel(`dashboard-updates-${authUser.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "purchases",
        filter: `seller_user_id=eq.${authUser.id}`
      }, () => scheduleRefresh())
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${authUser.id}`
      }, () => scheduleRefresh())
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "ebook_views"
      }, (payload) => {
        const ebookId = (payload.new as any)?.ebook_id;
        if (ebookId && ownedEbookIds.has(ebookId)) scheduleRefresh();
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "ebooks",
        filter: `user_id=eq.${authUser.id}`
      }, (payload) => {
        const newId = (payload.new as any)?.id;
        const oldId = (payload.old as any)?.id;
        if (newId) ownedEbookIds.add(newId);
        if (payload.eventType === "DELETE" && oldId) ownedEbookIds.delete(oldId);
        scheduleRefresh();
      })
      .subscribe();

    const handleRefresh = () => {
      console.log("Refreshing dashboard data due to notification...");
      scheduleRefresh();
    };
    window.addEventListener("refresh-dashboard", handleRefresh);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
      window.removeEventListener("refresh-dashboard", handleRefresh);
    };
  }, [authUser, fetchDashboardData]);

  const displayName = dbDisplayName || (authUser?.user_metadata?.display_name as string | undefined) || authUser?.email?.split("@")[0] || "Usuário";
  
  const userEmail = (authUser?.email || "").toLowerCase();
  const baseEbooks = BASE_STATS[userEmail]?.ebooks || 0;
  const totalEbooks = baseEbooks + (ebooks?.length || 0);

  return (
    <div className="space-y-3 animate-fade-in py-1 -mt-6">

      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0b1220] via-card to-card/60 p-5 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.35)]">
          <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Lucro</p>
              <div className="flex items-center gap-1.5">
                {[
                  { v: "today", label: "Hoje" },
                  { v: "7d", label: "7 Dias" },
                  { v: "30d", label: "30 Dias" },
                ].map((opt) => {
                  const active = profitPeriod === opt.v;
                  return (
                    <button
                      key={opt.v}
                      onClick={() => setProfitPeriod(opt.v as any)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                        active
                          ? "bg-blue-500 text-white border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                          : "bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-1 flex items-end justify-between gap-3">
              <p className="font-display text-6xl font-bold tracking-tight text-foreground">
                R$ {(profitPeriod === "today" ? stats.revenueToday : profitPeriod === "7d" ? stats.revenue7d : stats.revenue30d).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.35)]">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <SalesByHourChart total={stats.revenue30d} />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0b1220] via-card to-card/60 px-4 py-3 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.35)]">
            <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Ebooks</p>
                <p className="font-display text-2xl font-bold tracking-tight">{totalEbooks}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0b1220] via-card to-card/60 px-4 py-3 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.35)]">
            <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Vendas</p>
                <p className="font-display text-2xl font-bold tracking-tight">{stats.totalSales}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                <ShoppingCart className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalesByHourChart({ total }: { total: number }) {
  const data = useMemo(() => {
    // Realistic distribution weights per hour (peaks at lunch and evening)
    const weights = [
      2.2, 3.4, 1.8, 3.8, 2.4, 4.2,
      3.0, 4.8, 3.6, 5.4, 4.0, 5.8,
      4.4, 6.2, 4.6, 6.6, 5.0, 6.8,
      5.4, 7.2, 5.6, 6.4, 4.8, 5.2,
    ];
    const sum = weights.reduce((a, b) => a + b, 0);
    const base = total > 0 ? total : 1000;
    return weights.map((w, h) => ({
      hora: `${String(h).padStart(2, "0")}h`,
      valor: Number(((w / sum) * base).toFixed(2)),
    }));
  }, [total]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0b1220] via-card to-card/60 p-5 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.35)]">
      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="mb-4 flex items-center justify-end relative">
        <div className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
          <span className="text-[11px] font-medium text-blue-300">Últimos 30 dias</span>
        </div>
      </div>

      <div className="h-56 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity={1} />
                <stop offset="100%" stopColor="#93c5fd" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
                <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.25} strokeDasharray="3 6" vertical={false} />

            <XAxis
              dataKey="hora"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={2}
              dy={6}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              ticks={[0, 300, 600, 900, 1200]}
              domain={[0, 1200]}
              interval={0}
              allowDecimals={false}
              width={48}
              tickFormatter={(v) => `R$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
            />
            <RTooltip
              cursor={{ stroke: "#60a5fa", strokeOpacity: 0.5, strokeDasharray: "4 4" }}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid rgba(59,130,246,0.4)",
                borderRadius: 12,
                color: "hsl(var(--popover-foreground))",
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
              labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 11, marginBottom: 4 }}
              formatter={(v: any) => [`R$ ${Number(v).toFixed(2)}`, "Vendas"]}
              labelFormatter={(l) => `Horário: ${l}`}
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke="url(#lineStroke)"
              strokeWidth={2.75}
              fill="url(#areaFill)"
              dot={false}
              activeDot={{ r: 5, fill: "#60a5fa", stroke: "hsl(var(--background))", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
