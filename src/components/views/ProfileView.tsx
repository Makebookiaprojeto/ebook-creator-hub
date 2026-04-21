import { user, plans } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Mail, User as UserIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function ProfileView() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Perfil</h1>
        <p className="mt-1 text-muted-foreground">Gerencie sua conta e plano atual.</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-primary-foreground shadow-glow">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge className="mt-1.5 bg-accent text-accent-foreground hover:bg-accent">Plano {user.plan}</Badge>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-background p-4">
            <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
              <UserIcon className="h-3.5 w-3.5" /> Nome completo
            </div>
            <p className="mt-2 font-medium">{user.name}</p>
          </div>
          <div className="rounded-xl border bg-background p-4">
            <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> Email
            </div>
            <p className="mt-2 font-medium">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl gradient-hero p-4">
            <p className="text-xs text-muted-foreground">Ebooks</p>
            <p className="mt-1 font-display text-2xl font-bold">{user.ebooksCreated}</p>
          </div>
          <div className="rounded-xl gradient-hero p-4">
            <p className="text-xs text-muted-foreground">Vendas</p>
            <p className="mt-1 font-display text-2xl font-bold">{user.totalSales}</p>
          </div>
          <div className="rounded-xl gradient-hero p-4">
            <p className="text-xs text-muted-foreground">Receita</p>
            <p className="mt-1 font-display text-2xl font-bold">R$ {(user.totalRevenue / 1000).toFixed(1)}k</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold">Escolha seu plano</h2>
        <p className="mt-1 text-sm text-muted-foreground">Desbloqueie todo o potencial do EbookAI Builder.</p>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 shadow-soft transition hover:shadow-elevated ${
                plan.highlight ? "border-primary gradient-hero" : "border-border bg-card"
              }`}
            >
              {plan.highlight && (
                <Badge className="absolute -top-3 left-6 gradient-primary text-primary-foreground border-0">
                  <Sparkles className="mr-1 h-3 w-3" /> Mais escolhido
                </Badge>
              )}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
                <Crown className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold">
                  R$ {plan.price.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" /> {b}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => toast.info(`Plano ${plan.name} selecionado!`)}
                className={`mt-6 w-full ${plan.highlight ? "gradient-primary text-primary-foreground shadow-glow" : ""}`}
                variant={plan.highlight ? "default" : "outline"}
              >
                Assinar agora
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
