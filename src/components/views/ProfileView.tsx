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

      const { data: roleData } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(!!roleData);
    };

    loadData();
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

