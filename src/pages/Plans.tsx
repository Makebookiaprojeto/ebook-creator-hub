import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Check, Crown, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { CHECKOUT_LINKS } from "@/config/checkoutLinks";

const BENEFITS = [
  "Criar eBooks ilimitados",
  "Editor com IA integrada",
  "Capa profissional automática",
  "Página de vendas pronta",
  "Receba pagamentos diretamente",
  "Suporte prioritário",
];

export default function Plans() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { loading: subLoading, isActive } = useSubscription();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Se já tem plano ativo, manda pro app
  useEffect(() => {
    if (!subLoading && isActive) {
      navigate("/app", { replace: true });
    }
  }, [subLoading, isActive, navigate]);

  // Se não está logado, manda pra auth
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleCheckout = (plan: "monthly" | "lifetime") => {
    const baseUrl = CHECKOUT_LINKS[plan];
    if (!baseUrl) return;
    // Passa o e-mail pra Cakto pré-preencher o checkout
    const url = new URL(baseUrl);
    if (user?.email) {
      url.searchParams.set("email", user.email);
    }
    window.location.href = url.toString();
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">Sua plataforma de eBooks</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Escolha seu plano para começar
          </h1>
          <p className="text-muted-foreground text-lg">
            Para acessar a plataforma e criar seus eBooks, escolha um dos planos abaixo.
          </p>
          {user?.email && (
            <p className="text-sm text-muted-foreground mt-3">
              Logado como <span className="font-medium text-foreground">{user.email}</span>
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Plano Mensal */}
          <Card className="p-8 border-border/60 flex flex-col">
            <div className="mb-6">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Mensal
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R$ 47</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Renovação automática a cada 30 dias.
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => handleCheckout("monthly")}
            >
              Assinar mensal
            </Button>
          </Card>

          {/* Plano Vitalício */}
          <Card className="p-8 border-primary/60 bg-primary/5 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded-full">
              <Crown className="h-3 w-3" /> Mais escolhido
            </div>

            <div className="mb-6">
              <div className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
                Vitalício
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R$ 297</span>
                <span className="text-muted-foreground">único</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Pague uma vez e use para sempre. Sem mensalidade.
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
              <li className="flex items-start gap-2 text-sm font-medium">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Acesso vitalício, sem renovações</span>
              </li>
            </ul>

            <Button
              size="lg"
              className="w-full"
              onClick={() => handleCheckout("lifetime")}
            >
              Assinar vitalício
            </Button>
          </Card>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-8 max-w-md mx-auto">
          ⚠️ Importante: use o mesmo e-mail do seu cadastro ({user?.email}) na hora de pagar,
          para liberarmos seu acesso automaticamente.
        </p>
      </main>
    </div>
  );
}
