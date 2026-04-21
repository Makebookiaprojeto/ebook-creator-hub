import { BookOpen, Eye, ShoppingCart, DollarSign } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "@/components/StatCard";
import { recentEbooks, salesChartData, user } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

export function DashboardView() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Olá, {user.name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-muted-foreground">Aqui está o resumo do seu negócio hoje.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ebooks criados" value={String(user.ebooksCreated)} delta="+2" icon={BookOpen} tint="from-violet-500 to-purple-500" />
        <StatCard label="Visualizações" value="12.4k" delta="+18%" icon={Eye} tint="from-blue-500 to-cyan-500" />
        <StatCard label="Vendas" value={String(user.totalSales)} delta="+34%" icon={ShoppingCart} tint="from-emerald-500 to-teal-500" />
        <StatCard label="Receita" value={`R$ ${user.totalRevenue.toLocaleString("pt-BR")}`} delta="+27%" icon={DollarSign} tint="from-amber-500 to-orange-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Performance de vendas</h2>
              <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
            </div>
            <Badge variant="secondary">Mockado</Badge>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            {[
              { color: "bg-success", text: "3 vendas nas últimas 2h" },
              { color: "bg-primary", text: '"Renda Extra" foi publicado' },
              { color: "bg-amber-500", text: "Nova ferramenta disponível" },
              { color: "bg-blue-500", text: "240 visualizações hoje" },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                <span className="text-sm">{item.text}</span>
              </li>
            ))}
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
                <th className="px-6 py-3">Nicho</th>
                <th className="px-6 py-3">Preço</th>
                <th className="px-6 py-3">Vendas</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentEbooks.map((e) => (
                <tr key={e.id} className="text-sm transition hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{e.title}</td>
                  <td className="px-6 py-4 text-muted-foreground">{e.niche}</td>
                  <td className="px-6 py-4 font-medium">R$ {e.price}</td>
                  <td className="px-6 py-4">{e.sales}</td>
                  <td className="px-6 py-4">
                    <Badge variant={e.status === "Publicado" ? "default" : "secondary"} className={e.status === "Publicado" ? "bg-success hover:bg-success" : ""}>
                      {e.status}
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
