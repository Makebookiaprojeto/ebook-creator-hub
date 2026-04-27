import { LayoutDashboard, Plus, Wrench, LifeBuoy, User, Sparkles, LogOut, Library } from "lucide-react";
import saasLogo from "@/assets/saas-logo.jpg";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

type View = "dashboard" | "create" | "library" | "support" | "profile";

interface Props {
  active: View;
  onChange: (v: View) => void;
}

const items: { id: View; title: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { id: "create", title: "Criar Ebook", icon: Plus },
  { id: "library", title: "Biblioteca", icon: Library },
  { id: "support", title: "Suporte", icon: LifeBuoy },
  { id: "profile", title: "Perfil", icon: User },
];

export function AppSidebar({ active, onChange }: Props) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setAvatarUrl((data as any).avatar_url);
        setDisplayName((data as any).display_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Usuário");
      }
    };
    fetchProfile();

    // Subscribe to profile changes
    const channel = supabase
      .channel("profile-sidebar")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if ((payload.new as any).avatar_url !== undefined) setAvatarUrl((payload.new as any).avatar_url);
          if ((payload.new as any).display_name !== undefined) setDisplayName((payload.new as any).display_name);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Você saiu da sua conta.");
    navigate("/", { replace: true });
  };


  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-glow">
            <img src={saasLogo} alt="EbookAI Builder" className="h-full w-full object-cover" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold text-sidebar-foreground">EbookAI</span>
              <span className="text-[11px] text-muted-foreground">Builder</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = active === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onChange(item.id)}
                      className={
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/60"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <>
            <div className="m-2 rounded-xl gradient-hero p-3">
              <p className="text-xs font-semibold text-foreground">Plano PRO</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Aproveite todo o potencial da IA</p>
              <button 
                onClick={() => {
                  onChange("profile");
                  setSearchParams({ upgrade: "true" });
                }}
                className="mt-2 w-full rounded-lg gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
              >
                Ver Planos
              </button>
            </div>
            {user && (() => {
              const display = displayName || (user.user_metadata?.username as string | undefined)?.trim() || user.email?.split("@")[0] || "Usuário";

              return (
              <div className="mx-2 mb-2 flex items-center justify-between gap-2 rounded-lg border bg-card p-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-muted overflow-hidden gradient-primary text-[11px] font-bold text-primary-foreground shadow-glow">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={display} className="h-full w-full object-cover" />
                    ) : (
                      display[0]?.toUpperCase() ?? "U"
                    )}
                  </div>
                  <span className="truncate text-[11px] text-muted-foreground">{display}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sair"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-muted transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
              );
            })()}
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
