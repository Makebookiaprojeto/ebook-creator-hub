import { LayoutDashboard, Plus, Wrench, LifeBuoy, User, Sparkles, LogOut, Library } from "lucide-react";
import saasLogo from "@/assets/saas-logo.jpg";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { resolveDisplayName, initialFromName } from "@/lib/userName";
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
  { id: "create", title: "Nova Estrutura", icon: Plus },
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
        setDisplayName(resolveDisplayName((data as any).display_name, user));
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
        <div className="flex items-center gap-2.5 px-2 py-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-glow group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
            <img src={saasLogo} alt="EbookAI Builder" className="h-full w-full object-cover" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-3 pb-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {items
                .filter((i) => i.id === "create")
                .map((item) => {
                  const isActive = active === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onChange(item.id)}
                        style={{ color: "#D4AF37", boxShadow: "0 0 14px rgba(212,175,55,0.6)" }}
                        className="bg-black hover:bg-black/90 font-bold text-[13px] h-9 py-1.5 border border-[#D4AF37]/40"
                      >
                        {collapsed && <item.icon className="h-3.5 w-3.5" />}
                        {!collapsed && <span className="text-[13px]" style={{ color: "#D4AF37" }}><span className="text-[17px] leading-none align-middle">+</span> NOVA ESTRUTURA</span>}

                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-0">

          <SidebarGroupLabel className="text-[13px]">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items
                .filter((i) => i.id !== "create")
                .map((item) => {
                  const isActive = active === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onChange(item.id)}
                        className={
                          (isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "hover:bg-sidebar-accent/60") + " text-[15px]"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span className="text-[15px]">{item.title}</span>}

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
            {user && (() => {
              const display = resolveDisplayName(displayName, user);

              return (
              <div className="mx-2 mb-2 flex items-center justify-between gap-2 rounded-lg border bg-card p-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-muted overflow-hidden gradient-primary text-[11px] font-bold text-primary-foreground shadow-glow">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={display} className="h-full w-full object-cover" />
                    ) : (
                      initialFromName(display)
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
