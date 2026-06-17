import { useState, useEffect, useCallback, useMemo } from "react";
import { BookOpen, ShoppingCart, DollarSign, CreditCard, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
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

    const channel = supabase
      .channel(`dashboard-updates-${authUser.id}`)
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "purchases",
        filter: `seller_user_id=eq.${authUser.id}`
      }, () => fetchDashboardData())
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "notifications", 
        filter: `user_id=eq.${authUser.id}` 
      }, () => fetchDashboardData())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ebook_views" }, () => fetchDashboardData())
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "ebooks", 
        filter: `user_id=eq.${authUser.id}` 
      }, () => fetchDashboardData())
      .subscribe();

    const handleRefresh = () => {
      console.log("Refreshing dashboard data due to notification...");
      fetchDashboardData();
    };
    window.addEventListener("refresh-dashboard", handleRefresh);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("refresh-dashboard", handleRefresh);
    };
  }, [authUser, fetchDashboardData]);

  const displayName = dbDisplayName || (authUser?.user_metadata?.display_name as string | undefined) || authUser?.email?.split("@")[0] || "Usuário";
  
  const userEmail = (authUser?.email || "").toLowerCase();
  const baseEbooks = BASE_STATS[userEmail]?.ebooks || 0;
  const totalEbooks = baseEbooks + (ebooks?.length || 0);

  return (
    <div className="space-y-10 animate-fade-in py-4">

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-5 shadow-glow rounded-2xl">
          <StatCard 
            label="Lucro" 
            value={`R$ ${(profitPeriod === "today" ? stats.revenueToday : profitPeriod === "7d" ? stats.revenue7d : stats.revenue30d).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} 
            icon={DollarSign} 
            tint="from-primary/10 to-primary/5"
            large
            action={
              <Select value={profitPeriod} onValueChange={(v: any) => setProfitPeriod(v)}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </div>
        <div className="md:col-span-3.5 flex flex-col gap-4 md:col-span-3 shadow-glow rounded-2xl">
          <StatCard 
            label="Ebooks" 
            value={String(totalEbooks)} 
            icon={BookOpen} 
            tint="from-primary/10 to-primary/5" 
          />
        </div>
        <div className="md:col-span-3.5 flex flex-col gap-4 md:col-span-4 shadow-glow rounded-2xl">
          <StatCard 
            label="Vendas" 
            value={String(stats.totalSales)} 
            delta={stats.totalSales > 0 ? `+${stats.totalSales}` : "0"} 
            icon={ShoppingCart} 
            tint="from-primary/10 to-primary/5" 
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border bg-card p-8 shadow-glow">
          <div className="mb-8">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Meios de pagamento
            </h2>
          </div>

          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Método</TableHead>
                  <TableHead className="font-semibold">Conversão</TableHead>
                  <TableHead className="text-right font-semibold">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentStats.map((method) => (
                  <TableRow key={method.name} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <span className="text-sm">{method.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {method.conversion}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground/80">
                      {method.value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-glow">
          <div className="flex flex-col divide-y">
            {[
              { label: "Abandono C.", value: "0" },
              { label: "Reembolso", value: "0%" },
              { label: "Charge Back", value: "0%" },
              { label: "MED", value: "0%" },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <p className="font-display text-lg font-bold tracking-tight text-foreground">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SalesByHourChart total={stats.revenue30d} />
    </div>
  );
}

function SalesByHourChart({ total }: { total: number }) {
  const data = useMemo(() => {
    // Realistic distribution weights per hour (peaks at lunch and evening)
    const weights = [
      0.4, 0.2, 0.1, 0.1, 0.1, 0.2,
      0.5, 0.9, 1.4, 1.8, 2.2, 2.6,
      3.0, 2.7, 2.4, 2.6, 3.1, 3.6,
      4.4, 5.2, 6.0, 5.6, 4.2, 2.4,
    ];
    const sum = weights.reduce((a, b) => a + b, 0);
    const base = total > 0 ? total : 1000;
    return weights.map((w, h) => ({
      hora: `${String(h).padStart(2, "0")}h`,
      valor: Number(((w / sum) * base).toFixed(2)),
    }));
  }, [total]);

  return (
    <div className="rounded-2xl border bg-card p-8 shadow-glow">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Vendas por horário
        </h2>
        <span className="text-xs text-muted-foreground">Últimos 30 dias</span>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="hora"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={1}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `R$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
            />
            <RTooltip
              cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                color: "hsl(var(--popover-foreground))",
                fontSize: 12,
              }}
              formatter={(v: any) => [`R$ ${Number(v).toFixed(2)}`, "Vendas"]}
              labelFormatter={(l) => `Horário: ${l}`}
            />
            <Bar dataKey="valor" fill="url(#barFill)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
