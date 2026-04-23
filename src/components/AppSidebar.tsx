import { LayoutDashboard, Plus, Wrench, LifeBuoy, User, Sparkles, LogOut } from "lucide-react";
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

type View = "dashboard" | "create" | "tools" | "support" | "profile";

interface Props {
  active: View;
  onChange: (v: View) => void;
}

const items: { id: View; title: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { id: "create", title: "Criar Ebook", icon: Plus },
  { id: "tools", title: "Ferramentas", icon: Wrench },
  { id: "support", title: "Suporte", icon: LifeBuoy },
  { id: "profile", title: "Perfil", icon: User },
];

export function AppSidebar({ active, onChange }: Props) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Você saiu da sua conta.");
    navigate("/", { replace: true });
  };


  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
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
              <p className="text-xs font-semibold text-foreground">Plano FREE</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Faça upgrade para ebooks ilimitados</p>
              <button className="mt-2 w-full rounded-lg gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90">
                Upgrade PRO
              </button>
            </div>
            {user && (() => {
              const username = (user.user_metadata?.username as string | undefined)?.trim();
              const display = username || user.email?.split("@")[0] || "Usuário";
              return (
              <div className="mx-2 mb-2 flex items-center justify-between gap-2 rounded-lg border bg-card p-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-primary text-[11px] font-bold text-primary-foreground">
                    {display[0]?.toUpperCase() ?? "U"}
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
