import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { plans } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  User as UserIcon,
  Loader2,
  Camera,
  Upload,
  Crown,
  Sparkles,
  Check,
  Settings,
  Link2,
  Lock,
  Copy,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CHECKOUT_LINKS } from "@/config/checkoutLinks";
import { resolveDisplayName } from "@/lib/userName";

export function ProfileView() {
  const plansRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usage, setUsage] = useState({ limit: 20, current: 0 });
  const [activeSubscription, setActiveSubscription] = useState<{
    plan_type: string;
    status: string;
  } | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<{
    platform: string;
    checkout_url: string;
    product_id: string;
    webhook_secret: string;
  }>({
    platform: "cakto",
    checkout_url: "",
    product_id: "",
    webhook_secret: "",
  });
  const [savingPayment, setSavingPayment] = useState(false);

  // Carrega dados do perfil
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, display_name, monthly_ebook_limit, ebooks_generated_this_month")
        .eq("user_id", user.id)
        .maybeSingle();
      
      const profileData = data as any;
      if (profileData) {
        setAvatarUrl(profileData.avatar_url || null);
        setDisplayName(resolveDisplayName(profileData.display_name, user));
        setUsage({
          limit: profileData.monthly_ebook_limit ?? 20,
          current: profileData.ebooks_generated_this_month ?? 0
        });
      }

      // Carregar configs de pagamento
      const { data: payData } = await supabase
        .from("user_payment_configs" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (payData) {
        const config = payData as any;
        setPaymentConfig({
          platform: config.payment_platform ?? "cakto",
          checkout_url: config.checkout_url ?? "",
          product_id: config.product_id ?? "",
          webhook_secret: config.webhook_secret ?? "",
        });
      }

      const { data: roleData } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(!!roleData);

      // Carregar assinatura ativa
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("plan_type, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (subData) {
        setActiveSubscription(subData);
      } else {
        // Tentar buscar por e-mail se não encontrar por user_id
        const { data: subEmailData } = await supabase
          .from("subscriptions")
          .select("plan_type, status")
          .eq("buyer_email", user.email)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (subEmailData) {
          setActiveSubscription(subEmailData);
        }
      }
    };


    loadData();

    // Inscrição para atualizações em tempo real do perfil (para o contador de uso)
    const channel = supabase
      .channel("profile-usage")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newData = payload.new as any;
          if (newData.monthly_ebook_limit !== undefined || newData.ebooks_generated_this_month !== undefined) {
            setUsage(prev => ({
              limit: newData.monthly_ebook_limit ?? prev.limit,
              current: newData.ebooks_generated_this_month ?? prev.current
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSubscribe = (planId: string) => {
    const url = CHECKOUT_LINKS[planId];
    if (url && /^https?:\/\//i.test(url) && !url.includes("SEU_LINK")) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.info("Checkout deste plano ainda não está configurado.");
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

  const email = user?.email || "";

  const handleSavePayment = async () => {
    if (!user) return;
    setSavingPayment(true);
    try {
      const { error } = await supabase
        .from("user_payment_configs" as any)
        .upsert({
          user_id: user.id,
          payment_platform: paymentConfig.platform,
          checkout_url: paymentConfig.checkout_url,
          product_id: paymentConfig.product_id,
          webhook_secret: paymentConfig.webhook_secret,
        }, { onConflict: "user_id" });

      if (error) throw error;
      toast.success("Configurações de pagamento atualizadas!");
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSavingPayment(false);
    }
  };

  const projectRef = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID ?? "";
  const getWebhookUrl = (platform: string) =>
    platform === "outro"
      ? ""
      : `https://${projectRef}.supabase.co/functions/v1/${platform}-webhook`;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Perfil</h1>
          <p className="mt-1 text-muted-foreground">Gerencie sua conta, pagamentos e plano.</p>
        </div>
        
        <div className="rounded-2xl border bg-card p-4 shadow-soft min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Uso Mensal</span>
            <span className="text-xs font-bold">{usage.current} / {usage.limit}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${usage.current >= usage.limit ? 'bg-destructive' : 'gradient-primary'}`}
              style={{ width: `${Math.min((usage.current / usage.limit) * 100, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground text-center">Ebooks gerados este mês</p>
        </div>
      </div>

      {/* Admin access removed based on user request */}

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
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Crown className="h-3 w-3 text-amber-500" />
                <span className="font-medium">
                  {activeSubscription 
                    ? `Plano ${activeSubscription.plan_type === 'lifetime' ? 'Vitalício' : 'Mensal'}` 
                    : `Plano ${usage.limit > 20 ? 'Premium' : 'Gratuito'}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
                <Calendar className="h-3 w-3" />
                <span>Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '...'}</span>
              </div>
            </div>
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

      {/* Payment Configuration */}
      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings className="h-4 w-4" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">Configuração de Pagamento (Global)</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">Plataforma de Checkout</Label>
              <select
                value={paymentConfig.platform}
                onChange={(e) => setPaymentConfig(prev => ({ ...prev, platform: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="cakto">Cakto</option>
                <option value="hotmart">Hotmart</option>
                <option value="kiwify">Kiwify</option>
                <option value="outro">Outro (Apenas link)</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground italic">
                Configure os links de checkout e IDs de produtos individualmente em cada eBook na sua Biblioteca.
              </p>
            </div>

            {paymentConfig.platform !== "outro" && (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" /> Token/Secret do Webhook (Global)
                  </Label>
                  <Input
                    type="password"
                    placeholder={
                      paymentConfig.platform === "hotmart" ? "HOTTOK" : 
                      paymentConfig.platform === "kiwify" ? "Webhook Token" : "Secret"
                    }
                    value={paymentConfig.webhook_secret}
                    onChange={(e) => setPaymentConfig(prev => ({ ...prev, webhook_secret: e.target.value }))}
                  />
                </div>
              </>
            )}

            <Button 
              onClick={handleSavePayment} 
              disabled={savingPayment}
              className="w-full gradient-primary text-primary-foreground"
            >
              {savingPayment ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              Salvar Configurações
            </Button>
          </div>

          <div className="space-y-4">
            {paymentConfig.platform !== "outro" && (
              <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase text-muted-foreground font-bold">Integração via Webhook</Label>
                  <Badge variant="outline" className="text-[10px]">Padrão</Badge>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Para liberar o eBook automaticamente após a compra, cole esta URL na sua conta {paymentConfig.platform.toUpperCase()}:
                  </p>
                  <div className="relative group">
                    <code className="block w-full rounded-lg bg-background p-3 text-[10px] font-mono break-all border border-primary/20">
                      {getWebhookUrl(paymentConfig.platform)}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition"
                      onClick={() => {
                        navigator.clipboard.writeText(getWebhookUrl(paymentConfig.platform));
                        toast.success("URL copiada!");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2 text-[10px] text-muted-foreground leading-relaxed">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <p>Crie um webhook na sua plataforma apontando para a URL acima.</p>
                  </div>
                  <div className="flex items-start gap-2 text-[10px] text-muted-foreground leading-relaxed">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <p>O eBook será enviado por email e liberado na biblioteca do cliente assim que o pagamento for aprovado.</p>
                  </div>
                </div>
              </div>
            )}
            
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

