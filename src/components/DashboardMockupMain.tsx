import { BookOpen, ShoppingCart, DollarSign, Bell, CreditCard } from "lucide-react";

/**
 * Réplica visual fiel da DashboardView atual (Pure Black + dourado).
 * Usada nas seções "Veja por dentro" das páginas Landing e Plans.
 */
export function DashboardMockupMain() {
  const stats = [
    { icon: DollarSign, label: "Lucro", value: "R$ 617,90", badge: "Hoje" },
    { icon: BookOpen, label: "Ebooks", value: "27" },
    { icon: ShoppingCart, label: "Vendas", value: "213" },
  ];

  const payments = [
    { name: "Pix", conv: "56%", value: "R$ 4.549,94" },
    { name: "Cartão de Crédito", conv: "28%", value: "R$ 2.274,97" },
    { name: "Pix Automático", conv: "9%", value: "R$ 731,24" },
    { name: "Boleto", conv: "7%", value: "R$ 568,74" },
  ];

  const sideMetrics = [
    { label: "Abandono C.", value: "0" },
    { label: "Reembolso", value: "0%" },
    { label: "Charge Back", value: "0%" },
    { label: "MED", value: "0%" },
  ];

  return (
    <main className="col-span-9 lg:col-span-10 bg-background/20">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/40">
        <div className="text-xs text-muted-foreground">Dashboard</div>
        <div className="flex items-center gap-3">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <div className="h-7 w-7 rounded-full gradient-primary shadow-glow" />
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Stat cards com sombra dourada */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border/40 bg-card p-3 shadow-[0_0_18px_rgba(255,255,0,0.22)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold tracking-tight">{s.value}</p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                  <s.icon className="h-3.5 w-3.5" />
                </div>
              </div>
              {s.badge && (
                <span className="mt-2 inline-block rounded-md bg-muted/40 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                  {s.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Linha de pagamentos + métricas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 rounded-2xl border border-border/40 bg-card p-3 shadow-[0_0_18px_rgba(255,255,0,0.22)]">
            <div className="mb-2 flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              <h4 className="text-xs font-semibold">Meios de pagamento</h4>
            </div>
            <div className="overflow-hidden rounded-lg border border-border/40">
              <div className="grid grid-cols-3 bg-muted/40 px-2 py-1 text-[9px] font-semibold uppercase text-muted-foreground">
                <span>Método</span>
                <span>Conversão</span>
                <span className="text-right">Valor</span>
              </div>
              {payments.map((p) => (
                <div
                  key={p.name}
                  className="grid grid-cols-3 items-center px-2 py-1.5 text-[10px] border-t border-border/30"
                >
                  <span className="font-medium">{p.name}</span>
                  <span>
                    <span className="inline-flex items-center rounded-full bg-[#D4AF37]/10 px-1.5 py-0.5 text-[9px] font-medium text-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.45)]">
                      {p.conv}
                    </span>
                  </span>
                  <span className="text-right font-semibold text-foreground/80">{p.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/40 bg-card p-3 shadow-[0_0_18px_rgba(255,255,0,0.22)]">
            <div className="flex flex-col divide-y divide-border/40">
              {sideMetrics.map((m) => (
                <div key={m.label} className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  <p className="font-display text-xs font-bold">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico de receita por hora (dourado) */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/40 p-4 shadow-[0_0_24px_rgba(212,175,55,0.18)]">
          <div className="mb-2 flex items-end justify-between">
            <div>
              <h3 className="text-xs font-semibold tracking-tight">Receita por hora</h3>
              <p className="text-[9px] text-muted-foreground">Distribuição de vendas nas últimas 24h</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-2 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
              <span className="text-[9px] font-medium text-muted-foreground">Últimos 30 dias</span>
            </div>
          </div>
          <svg viewBox="0 0 400 90" className="w-full h-24">
            <defs>
              <linearGradient id="dashStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#B8860B" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#F5D27A" />
              </linearGradient>
              <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,80 L20,78 L40,75 L60,72 L80,68 L100,60 L120,55 L140,50 L160,52 L180,45 L200,40 L220,38 L240,35 L260,28 L280,22 L300,18 L320,14 L340,20 L360,30 L380,45 L400,55 L400,90 L0,90 Z"
              fill="url(#dashFill)"
            />
            <path
              d="M0,80 L20,78 L40,75 L60,72 L80,68 L100,60 L120,55 L140,50 L160,52 L180,45 L200,40 L220,38 L240,35 L260,28 L280,22 L300,18 L320,14 L340,20 L360,30 L380,45 L400,55"
              fill="none"
              stroke="url(#dashStroke)"
              strokeWidth="2.25"
            />
          </svg>
        </div>
      </div>
    </main>
  );
}
