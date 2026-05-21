import { useState, useEffect } from "react";
import { BookOpen, ShoppingCart, DollarSign, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/StatCard";
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


        // 1. Vendas confirmadas
        const { data: sales } = await supabase
          .from("purchases")
          .select("amount_paid_cents, created_at, status")
          .eq("status", "paid");

        // 2. Visualizações
        const { count: viewsCount } = await supabase
          .from("ebook_views")
          .select("*", { count: 'exact', head: true });

        if (sales) {
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
          <p className="text-sm text-muted-foreground mt-1">Opções disponíveis para processamento das suas vendas</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {[
            { name: "Pix", icon: "https://cdn.brandfetch.io/pix.com.br/fallback/transparent/theme/dark/h/512/w/512/icon?c=1bfwsm9uY7-Tz55tM5C" },
            { name: "Cartão de crédito", icon: "https://img.icons8.com/color/96/visa.png" },
            { name: "Boleto", icon: "https://img.icons8.com/color/96/barcode.png" },
            { name: "Pix automático", icon: "https://cdn.brandfetch.io/pix.com.br/fallback/transparent/theme/dark/h/512/w/512/icon?c=1bfwsm9uY7-Tz55tM5C" },
            { name: "PicPay", icon: "https://img.icons8.com/color/96/picpay.png" },
            { name: "Google Pay", icon: "https://img.icons8.com/color/96/google-pay.png" },
            { name: "Apple Pay", icon: "https://img.icons8.com/color/96/apple-pay.png" }
          ].map((method) => (
            <div key={method.name} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border bg-muted/5 hover:bg-muted/10 transition-colors cursor-default group">
              <div className="h-12 w-12 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100">
                <img src={method.icon} alt={method.name} className="max-h-10 max-w-10 object-contain" />
              </div>
              <span className="text-[11px] font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">
                {method.name}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
