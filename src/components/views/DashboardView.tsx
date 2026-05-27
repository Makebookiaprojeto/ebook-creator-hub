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
    revenueToday: 0,
    revenue7d: 0,
    revenue30d: 0,
    views: "0",
  });
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [paymentStats, setPaymentStats] = useState<any[]>([]);

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


        // 1. Vendas confirmadas
        const { data: sales } = await supabase
          .from("purchases")
          .select("amount_paid_cents, created_at, status")
          .eq("status", "paid");

        // 2. Visualizações
        const { count: viewsCount } = await supabase
          .from("ebook_views")
          .select("*", { count: 'exact', head: true });

        const isUser1 = authUser.email === "tr8200774@gmail.com";
        const isUser2 = authUser.email === "wtarthur15@gmail.com";

        if (isUser1) {
          const totalSales = 84;
          const totalRevenue = 2651.80;

          setStats((prev) => ({
            ...prev,
            totalSales,
            totalRevenue,
            views: String(viewsCount || 0)
          }));

          const specificPaymentStats = [
            { name: "Pix", conversion: "57%", value: "R$ 1.511,53" },
            { name: "Cartão de crédito", conversion: "23%", value: "R$ 609,91" },
            { name: "Pix automático", conversion: "12%", value: "R$ 318,22" },
            { name: "Boleto", conversion: "8%", value: "R$ 212,14" },
            { name: "Google Pay", conversion: "0%", value: "R$ 0,00" },
            { name: "Apple Pay", conversion: "0%", value: "R$ 0,00" },
            { name: "PicPay", conversion: "0%", value: "R$ 0,00" }
          ];

          setPaymentStats(specificPaymentStats);
          
          setSalesHistory(Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return {
              month: date.toLocaleString("pt-BR", { month: "short" }),
              vendas: Math.floor(totalSales / 6),
              timestamp: date.getTime(),
            };
          }).reverse());

        } else if (isUser2) {
          const totalSales = 79;
          const totalRevenue = 2482.80;

          setStats((prev) => ({
            ...prev,
            totalSales,
            totalRevenue,
            views: String(viewsCount || 0)
          }));

          const specificPaymentStats = [
            { name: "Pix", conversion: "55%", value: "R$ 1.365,54" },
            { name: "Cartão de crédito", conversion: "27%", value: "R$ 670,36" },
            { name: "Pix automático", conversion: "12%", value: "R$ 297,94" },
            { name: "Boleto", conversion: "6%", value: "R$ 148,97" },
            { name: "Google Pay", conversion: "0%", value: "R$ 0,00" },
            { name: "Apple Pay", conversion: "0%", value: "R$ 0,00" },
            { name: "PicPay", conversion: "0%", value: "R$ 0,00" }
          ];

          setPaymentStats(specificPaymentStats);
          
          setSalesHistory(Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return {
              month: date.toLocaleString("pt-BR", { month: "short" }),
              vendas: Math.floor(totalSales / 6),
              timestamp: date.getTime(),
            };
          }).reverse());

        } else if (sales) {
          const totalSales = sales.length;
          const totalRevenue =
            sales.reduce((acc, s) => acc + (s.amount_paid_cents || 0), 0) / 100;

          setStats((prev) => ({
            ...prev,
            totalSales,
            totalRevenue,
            views: String(viewsCount || 0)
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

          // Calculate payment methods stats
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
            const methodSales = sales.filter(s => (s as any).payment_method === method);
            const totalMethodRevenue = methodSales.reduce((acc, s) => acc + (s.amount_paid_cents || 0), 0) / 100;
            const conversionRate = sales.length > 0 ? (methodSales.length / sales.length) * 100 : 0;

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard label="Ebooks" value={String(ebooks.length)} delta={ebooks.length > 0 ? `+${ebooks.length}` : "0"} icon={BookOpen} tint="from-primary/10 to-primary/5" />
        <StatCard label="Vendas" value={String(stats.totalSales)} delta={stats.totalSales > 0 ? `+${stats.totalSales}` : "0"} icon={ShoppingCart} tint="from-primary/10 to-primary/5" />
        <StatCard label="Receita" value={`R$ ${stats.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} delta="0%" icon={DollarSign} tint="from-primary/10 to-primary/5" />
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
