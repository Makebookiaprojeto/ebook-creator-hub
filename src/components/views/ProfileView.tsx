import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
// import { plans } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
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
  const [activeSubscription, setActiveSubscription] = useState<{
    plan_type: string;
    status: string;
  } | null>(null);


  // Carrega dados do perfil
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      
      const profileData = data as any;
      if (profileData) {
        setAvatarUrl(profileData.avatar_url || null);
        setDisplayName(resolveDisplayName(profileData.display_name, user));
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

    // Inscrição para atualizações em tempo real do perfil
    const channel = supabase
      .channel("profile-usage")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        (payload) => {
          // No actions needed for removed fields
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

  

  const projectRef = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID ?? "";


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
    <div className="space-y-6 animate-fade-in -mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Perfil</h1>
          <p className="text-base text-muted-foreground mt-1">Configure seu perfil.</p>
        </div>
        
        <div className="flex-1" />

      </div>

      {/* Admin access removed based on user request */}

      <div className="rounded-2xl border bg-card p-6 shadow-[0_0_18px_rgba(212,175,55,0.35)]">
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
                    ? `Plano ${activeSubscription.plan_type === 'lifetime' ? 'Premium' : 'Mensal'}` 
                    : "Plano Gratuito"}

                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
                <Calendar className="h-3 w-3" />
                <span>Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '...'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="display-name" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <UserIcon className="h-3.5 w-3.5" /> Nome de Exibição
            </Label>
            <div className="flex gap-2">
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
                className="bg-background h-10"
              />
              <Button 
                onClick={handleSaveDisplayName}
                disabled={savingName}
                className="gradient-primary text-primary-foreground px-6"
              >
                {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de planos removida conforme solicitação do usuário para uma experiência mais limpa */}
    </div>
  );
}

