import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { DashboardView } from "@/components/views/DashboardView";
import { CreateEbookView } from "@/components/views/CreateEbookView";
import { LibraryView } from "@/components/views/LibraryView";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SupportView } from "@/components/views/SupportView";
import { ProfileView } from "@/components/views/ProfileView";
import { LayoutDashboard, Library, Plus, LifeBuoy, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { resolveDisplayName, initialFromName } from "@/lib/userName";

type View = "dashboard" | "create" | "library" | "support" | "profile";

const Index = () => {
  const [view, setView] = useState<View>("dashboard");
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      // 1. Garantir que o perfil existe (fallback)
      await supabase.rpc('ensure_profile_exists', { p_user_id: user.id });

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

    const channel = supabase
      .channel("profile-header")
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

  // Theme is handled by ThemeToggle now
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar active={view} onChange={setView} />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 bg-background/80 backdrop-blur-md px-4 sm:px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            {view === "dashboard" && (
              <div className="ml-auto flex items-center gap-3">
                <ThemeToggle />
                <NotificationBell />
                <button
                  onClick={() => setView("profile")}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-muted overflow-hidden gradient-primary text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105 active:scale-95"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Perfil" className="h-full w-full object-cover" />
                  ) : (
                    initialFromName(displayName || resolveDisplayName(null, user))
                  )}
                </button>
              </div>
            )}
          </header>


          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto pb-32">
            {view === "dashboard" && <DashboardView />}
            {view === "create" && <CreateEbookView />}
            {view === "library" && <LibraryView onCreateNew={() => setView("create")} />}
            {/* tools view removed */}
            {view === "support" && <SupportView />}
            {view === "profile" && <ProfileView />}
            </main>
          
          {/* Dock Menu */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 sm:gap-4 bg-background/80 backdrop-blur-lg border border-[#D4AF37]/30 px-4 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(212,175,55,0.15)]">
              <button onClick={() => setView("dashboard")} className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${view === "dashboard" ? "text-[#D4AF37] bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`} title="Dashboard">
                <LayoutDashboard className="h-5 w-5" />
              </button>
              <button onClick={() => setView("library")} className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${view === "library" ? "text-[#D4AF37] bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`} title="Biblioteca">
                <Library className="h-5 w-5" />
              </button>
              
              <button onClick={() => setView("create")} className="flex items-center justify-center w-14 h-14 rounded-full transition-all bg-black border border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 text-[#D4AF37] -mt-6" title="Nova Estrutura">
                <Plus className="h-7 w-7" />
              </button>
              
              <button onClick={() => setView("support")} className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${view === "support" ? "text-[#D4AF37] bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`} title="Suporte">
                <LifeBuoy className="h-5 w-5" />
              </button>
              <button onClick={() => setView("profile")} className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${view === "profile" ? "text-[#D4AF37] bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`} title="Perfil">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
