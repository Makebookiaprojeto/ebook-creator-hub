import { useEffect, useState, useCallback, useRef } from "react";
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
  Camera,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CHECKOUT_LINKS } from "@/config/checkoutLinks";

type ConnectStatus = {
  connected: boolean;
  charges_enabled: boolean;
  details_submitted: boolean;
  account_id?: string;
};

export function ProfileView() {
  const plansRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega o link externo salvo
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("external_checkout_url, avatar_url, display_name, monthly_checkout_url, lifetime_checkout_url")
        .eq("user_id", user.id)
        .maybeSingle();
      const profileData = data as any;
      const urlValue = profileData?.external_checkout_url || "";
      const avatarValue = profileData?.avatar_url || null;
      const nameValue = profileData?.display_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Usuário";
      setExternalUrl(urlValue);
      setSavedUrl(urlValue);
      setAvatarUrl(avatarValue);
      setDisplayName(nameValue);
      const m = profileData?.monthly_checkout_url || "";
      const l = profileData?.lifetime_checkout_url || "";
      setMonthlyUrl(m);
      setSavedMonthlyUrl(m);
      setLifetimeUrl(l);
      setSavedLifetimeUrl(l);
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

  const handleSavePlanUrl = async (planId: "monthly" | "lifetime") => {
    if (!user) return;
    const value = planId === "monthly" ? monthlyUrl : lifetimeUrl;
    const trimmed = value.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      toast.error("O link deve começar com http:// ou https://");
      return;
    }
    const setSaving = planId === "monthly" ? setSavingMonthly : setSavingLifetime;
    const setSaved = planId === "monthly" ? setSavedMonthlyUrl : setSavedLifetimeUrl;
    const column = planId === "monthly" ? "monthly_checkout_url" : "lifetime_checkout_url";
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ [column]: trimmed || null } as any)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    setSaved(trimmed);
    toast.success(trimmed ? "Link salvo!" : "Link removido");
  };

  const handleSubscribe = (planId: string) => {
    const url = planId === "monthly" ? savedMonthlyUrl : planId === "lifetime" ? savedLifetimeUrl : "";
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.info("Configure o link de checkout deste plano no card 'Links de checkout dos planos' acima.");
    }
  };

  const handleSaveDisplayName = async () => {
    if (!user) return;
    const trimmed = displayName.trim();
    if (!trimmed) {
      toast.error("O nome não pode estar vazio");
      return;
    }
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("user_id", user.id);
    
    // Also update auth metadata for consistency
    await supabase.auth.updateUser({
      data: { display_name: trimmed }
    });

    setSavingName(false);
    if (error) {
      toast.error("Erro ao salvar nome: " + error.message);
      return;
    }
    toast.success("Nome de exibição atualizado!");
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      const file = event.target.files?.[0];
      if (!file || !user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Foto de perfil atualizada!");
    } catch (error: any) {
      toast.error("Erro ao subir foto: " + error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Usuário"; // Replaced by state
  const email = user?.email || "";

  const fullyConnected = status?.connected && status?.charges_enabled && status?.details_submitted;
  const pendingConnection = status?.connected && !fullyConnected;

  useEffect(() => {
    if (searchParams.get("upgrade") === "true") {
      setTimeout(() => {
        plansRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("upgrade");
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Perfil</h1>
        <p className="mt-1 text-muted-foreground">Gerencie sua conta, pagamentos e plano.</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-6 flex-wrap sm:flex-nowrap">
          <div className="relative group">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/20 bg-muted overflow-hidden shadow-glow">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center gradient-primary text-3xl font-bold text-primary-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition active:scale-95"
              title="Mudar foto"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">{displayName}</h2>
            <p className="text-muted-foreground">{email}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Nova Foto
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="display-name" className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
              <UserIcon className="h-3.5 w-3.5" /> Nome de Exibição
            </Label>
            <div className="flex gap-2">
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
                className="bg-background"
              />
              <Button 
                size="sm" 
                onClick={handleSaveDisplayName}
                disabled={savingName}
                className="gradient-primary text-primary-foreground"
              >
                {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> Email
            </Label>
            <Input
              value={email}
              disabled
              className="bg-muted/50 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Card de Link de Checkout Externo */}
      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <ExternalLink className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-xl font-semibold">Link de checkout externo</h2>
              {savedUrl ? (
                <Badge className="bg-success text-success-foreground hover:bg-success gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Configurado
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <AlertCircle className="h-3 w-3" /> Não configurado
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Cole aqui o link do seu checkout (Hotmart, Kiwify, Mercado Pago, Stripe Payment Link, etc).
              O botão "Comprar" dos seus ebooks vai redirecionar para esse link.
            </p>

            <div className="mt-4 space-y-2">
              <Label htmlFor="external-checkout-url">URL do checkout</Label>
              <Input
                id="external-checkout-url"
                type="url"
                placeholder="https://pay.hotmart.com/..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={handleSaveExternalUrl}
                disabled={savingUrl || externalUrl === savedUrl}
                className="gradient-primary text-primary-foreground shadow-glow"
              >
                {savingUrl && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar link
              </Button>
              {savedUrl && (
                <Button variant="outline" asChild>
                  <a href={savedUrl} target="_blank" rel="noopener noreferrer">
                    Testar link
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card: Links de checkout dos planos (Cakto, Hotmart, etc) */}
      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <Crown className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold">Links de checkout dos planos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure um link de checkout (Cakto, Hotmart, Kiwify, Stripe Payment Link, etc) para cada plano.
              O botão "Assinar agora" de cada plano vai abrir o link correspondente.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-xl border bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="monthly-url" className="font-semibold">Plano Mensal</Label>
                  {savedMonthlyUrl ? (
                    <Badge className="bg-success text-success-foreground gap-1"><CheckCircle2 className="h-3 w-3" /> Ok</Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" /> Vazio</Badge>
                  )}
                </div>
                <Input
                  id="monthly-url"
                  type="url"
                  placeholder="https://pay.cakto.com.br/..."
                  value={monthlyUrl}
                  onChange={(e) => setMonthlyUrl(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSavePlanUrl("monthly")}
                    disabled={savingMonthly || monthlyUrl === savedMonthlyUrl}
                    className="gradient-primary text-primary-foreground"
                  >
                    {savingMonthly && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                  </Button>
                  {savedMonthlyUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={savedMonthlyUrl} target="_blank" rel="noopener noreferrer">Testar</a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2 rounded-xl border bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lifetime-url" className="font-semibold">Acesso Vitalício</Label>
                  {savedLifetimeUrl ? (
                    <Badge className="bg-success text-success-foreground gap-1"><CheckCircle2 className="h-3 w-3" /> Ok</Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" /> Vazio</Badge>
                  )}
                </div>
                <Input
                  id="lifetime-url"
                  type="url"
                  placeholder="https://pay.cakto.com.br/..."
                  value={lifetimeUrl}
                  onChange={(e) => setLifetimeUrl(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSavePlanUrl("lifetime")}
                    disabled={savingLifetime || lifetimeUrl === savedLifetimeUrl}
                    className="gradient-primary text-primary-foreground"
                  >
                    {savingLifetime && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                  </Button>
                  {savedLifetimeUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={savedLifetimeUrl} target="_blank" rel="noopener noreferrer">Testar</a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


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

      <div ref={plansRef}>
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
                onClick={() => handleSubscribe(plan.id)}
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
