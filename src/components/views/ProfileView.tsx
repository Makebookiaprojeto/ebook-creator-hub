import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { plans } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crown,
  Mail,
  User as UserIcon,
  Sparkles,
  CreditCard,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ConnectStatus = {
  connected: boolean;
  charges_enabled: boolean;
  details_submitted: boolean;
  account_id?: string;
};

export function ProfileView() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);

  // Carrega o link externo salvo
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("external_checkout_url")
        .eq("user_id", user.id)
        .maybeSingle();
      const url = (data as any)?.external_checkout_url || "";
      setExternalUrl(url);
      setSavedUrl(url);
    })();
  }, [user]);

  const handleSaveExternalUrl = async () => {
    if (!user) return;
    const trimmed = externalUrl.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      toast.error("O link deve começar com http:// ou https://");
      return;
    }
    setSavingUrl(true);
    const { error } = await supabase
      .from("profiles")
      .update({ external_checkout_url: trimmed || null })
      .eq("user_id", user.id);
    setSavingUrl(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    setSavedUrl(trimmed);
    toast.success(trimmed ? "Link de checkout salvo!" : "Link removido");
  };

  const refreshStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-status");
      if (error) throw error;
      setStatus(data as ConnectStatus);
    } catch (e) {
      console.error(e);
      setStatus({ connected: false, charges_enabled: false, details_submitted: false });
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    if (user) refreshStatus();
  }, [user, refreshStatus]);

  // Quando volta do onboarding Stripe, atualiza status
  useEffect(() => {
    if (searchParams.get("stripe_return") === "1" || searchParams.get("stripe_refresh") === "1") {
      toast.info("Atualizando status da conta de pagamentos...");
      refreshStatus();
      const next = new URLSearchParams(searchParams);
      next.delete("stripe_return");
      next.delete("stripe_refresh");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, refreshStatus]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-onboard");
      if (error) throw error;
      if (!data?.url) throw new Error("Não foi possível iniciar a conexão");
      window.location.href = data.url;
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Falha ao conectar Stripe");
      setConnecting(false);
    }
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Usuário";
  const email = user?.email || "";

  const fullyConnected = status?.connected && status?.charges_enabled && status?.details_submitted;
  const pendingConnection = status?.connected && !fullyConnected;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Perfil</h1>
        <p className="mt-1 text-muted-foreground">Gerencie sua conta, pagamentos e plano.</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-primary-foreground shadow-glow">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-background p-4">
            <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
              <UserIcon className="h-3.5 w-3.5" /> Nome
            </div>
            <p className="mt-2 font-medium">{displayName}</p>
          </div>
          <div className="rounded-xl border bg-background p-4">
            <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> Email
            </div>
            <p className="mt-2 font-medium">{email}</p>
          </div>
        </div>
      </div>

      {/* Card de Stripe Connect */}
      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <CreditCard className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-xl font-semibold">Receber pagamentos</h2>
              {loadingStatus ? (
                <Badge variant="outline" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Verificando
                </Badge>
              ) : fullyConnected ? (
                <Badge className="bg-success text-success-foreground hover:bg-success gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Ativo
                </Badge>
              ) : pendingConnection ? (
                <Badge variant="outline" className="gap-1 border-warning text-warning">
                  <AlertCircle className="h-3 w-3" /> Cadastro incompleto
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <AlertCircle className="h-3 w-3" /> Não conectado
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Conecte sua conta Stripe para receber 100% do valor das vendas dos seus ebooks
              direto na sua conta bancária. Sem taxa da plataforma.
            </p>

            {!loadingStatus && !fullyConnected && (
              <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm">
                <p className="font-medium text-warning-foreground">
                  {pendingConnection
                    ? "Você já iniciou o cadastro na Stripe, mas faltam algumas informações."
                    : "Enquanto você não conectar uma conta de pagamentos, os botões de compra dos seus ebooks ficam indisponíveis."}
                </p>
              </div>
            )}

            {!loadingStatus && fullyConnected && (
              <div className="mt-4 rounded-xl border border-success/30 bg-success/5 p-3 text-sm text-success-foreground">
                <p className="font-medium">
                  ✅ Tudo certo! Você já pode vender e receber pagamentos.
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={handleConnect}
                disabled={connecting || loadingStatus}
                className="gradient-primary text-primary-foreground shadow-glow"
              >
                {connecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                {fullyConnected
                  ? "Gerenciar conta Stripe"
                  : pendingConnection
                  ? "Continuar cadastro"
                  : "Conectar Stripe"}
              </Button>
              {!loadingStatus && (
                <Button variant="outline" onClick={refreshStatus}>
                  Atualizar status
                </Button>
              )}
            </div>
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
