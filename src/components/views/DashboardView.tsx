import { useState, useEffect } from "react";
import { BookOpen, ShoppingCart, DollarSign, CreditCard } from "lucide-react";
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
    payments: { "Pix": 5816.66, "Cartão de crédito": 1938.89, "Pix automático": 1200.27, "Boleto": 276.98 }
  },
  "wtarthur15@gmail.com": {
    ebooks: 0,
    totalSales: 79,
    totalRevenue: 2482.80,
    revenueToday: 162.80,
    revenue7d: 1150.40,
    revenue30d: 2482.80,
    payments: { "Pix": 1365.54, "Cartão de crédito": 670.36, "Pix automático": 297.94, "Boleto": 148.97 }
  },
  "robertomacaci@gmail.com": {
    ebooks: 27,
    totalSales: 213,
    totalRevenue: 8124.90,
    revenueToday: 617.90,
    revenue7d: 2650.80,
    revenue30d: 8124.90,
    payments: { "Pix": 8124.90 * 0.56, "Cartão de crédito": 8124.90 * 0.28, "Pix automático": 8124.90 * 0.09, "Boleto": 8124.90 * 0.07 }
  },
  "Mat.resende10@gmail.com": {
    ebooks: 34,
    totalSales: 181,
    totalRevenue: 9718.80,
    revenueToday: 714.90,
    revenue7d: 2265.80,
    revenue30d: 9718.80,
    payments: { "Pix": 9718.80 * 0.49, "Cartão de crédito": 9718.80 * 0.25, "Pix automático": 9718.80 * 0.22, "Boleto": 9718.80 * 0.04 }
  },
  "paoplays80@gmail.com": {
    ebooks: 23,
    totalSales: 169,
    totalRevenue: 6232.80,
    revenueToday: 818.90,
    revenue7d: 1751.80,
    revenue30d: 6232.80,
    payments: { "Pix": 6232.80 * 0.67, "Cartão de crédito": 6232.80 * 0.28, "Pix automático": 6232.80 * 0.03, "Boleto": 6232.80 * 0.02 }
  },
  "rodrigodalves331@gmail.com": {
    ebooks: 32,
    totalSales: 148,
    totalRevenue: 5432.80,
    revenueToday: 558.90,
    revenue7d: 1751.80,
    revenue30d: 5432.80,
    payments: { "Pix": 5432.80 * 0.61, "Cartão de crédito": 5432.80 * 0.23, "Pix automático": 5432.80 * 0.11, "Boleto": 5432.80 * 0.05 }
  }
};

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


  const quotes = [
...
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


        // 1. Vendas confirmadas
        const { data: sales } = await supabase
          .from("purchases")
          .select("amount_paid_cents, created_at, status, payment_method")
          .eq("status", "paid");

        // 2. Visualizações
        const { count: viewsCount } = await supabase
          .from("ebook_views")
          .select("*", { count: 'exact', head: true });

        const userEmail = authUser.email || "";
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
        const totalSales = realSales.length + base.totalSales;
        const realTotalRevenue = realSales.reduce((acc, s) => acc + (s.amount_paid_cents || 0), 0) / 100;
        const totalRevenue = realTotalRevenue + base.totalRevenue;

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

        setStats((prev) => ({
          ...prev,
          totalSales,
          totalRevenue,
          revenueToday: realRevenueToday + base.revenueToday,
          revenue7d: realRevenue7d + base.revenue7d,
          revenue30d: realRevenue30d + base.revenue30d,
          views: String((viewsCount || 0))
        }));

        // Histórico de vendas
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return {
            month: date.toLocaleString("pt-BR", { month: "short" }),
            vendas: Math.floor(base.totalSales / 6), // Base distribuída nos meses
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

        // Métodos de pagamento
        const methods = [
          "Pix",
          "Cartão de crédito",
          "Boleto",
          "Pix automático",
          "PicPay",
          "Google Pay",
          "Apple Pay"
        ];

        const calculatedPaymentStats = methods.map(method => {
          const methodSales = realSales.filter(s => (s as any).payment_method === method);
          const realMethodRevenue = methodSales.reduce((acc, s) => acc + (s.amount_paid_cents || 0), 0) / 100;
          const baseMethodRevenue = base.payments[method] || 0;
          const totalMethodRevenue = realMethodRevenue + baseMethodRevenue;
          
          const totalRevenueForConversion = totalRevenue || 1; // evitar divisão por zero
          const conversionRate = (totalMethodRevenue / totalRevenueForConversion) * 100;

          return {
            name: method,
            conversion: `${conversionRate.toFixed(0)}%`,
            value: `R$ ${totalMethodRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
          };
        });

        setPaymentStats(calculatedPaymentStats);

        } else {
          // If no sales, set all to zero
          const methods = ["Pix", "Cartão de crédito", "Boleto", "Pix automático", "PicPay", "Google Pay", "Apple Pay"];
          setPaymentStats(methods.map(m => ({ name: m, conversion: "0%", value: "R$ 0,00" })));
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardData();

    // Realtime: atualiza quando uma nova venda, visualização ou ebook chegar
    const channel = supabase
      .channel(`dashboard-updates-${authUser.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchases" },
        () => fetchDashboardData(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ebook_views" },
        () => fetchDashboardData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ebooks", filter: `user_id=eq.${authUser.id}` },
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
    <div className="space-y-10 animate-fade-in py-4">
      <div className="flex flex-col gap-1 border-b border-border/40 pb-6">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground/90">Olá, {displayName}</h1>
        <p className="text-sm font-medium text-primary/70 italic">"{quote}"</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard 
          label="Ebooks" 
          value={authUser.email === "tr8200774@gmail.com" ? "43" : authUser.email === "robertomacaci@gmail.com" ? "27" : authUser.email === "Mat.resende10@gmail.com" ? "34" : authUser.email === "paoplays80@gmail.com" ? "23" : authUser.email === "rodrigodalves331@gmail.com" ? "32" : String(ebooks.length)} 
          icon={BookOpen} 
          tint="from-primary/10 to-primary/5" 
        />
        <StatCard label="Vendas" value={String(stats.totalSales)} delta={stats.totalSales > 0 ? `+${stats.totalSales}` : "0"} icon={ShoppingCart} tint="from-primary/10 to-primary/5" />
        <StatCard 
          label="Lucro" 
          value={`R$ ${(profitPeriod === "today" ? stats.revenueToday : profitPeriod === "7d" ? stats.revenue7d : stats.revenue30d).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} 
          icon={DollarSign} 
          tint="from-primary/10 to-primary/5"
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

      <div className="rounded-2xl border bg-card p-8 shadow-soft">
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

    </div>
  );
}
