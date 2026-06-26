import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { DashboardView } from "@/components/views/DashboardView";
import { CreateEbookView } from "@/components/views/CreateEbookView";
import { LibraryView } from "@/components/views/LibraryView";
// ToolsView removed
import { SupportView } from "@/components/views/SupportView";
import { ProfileView } from "@/components/views/ProfileView";
import {  } from "lucide-react";
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

  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

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


          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
            {view === "dashboard" && <DashboardView />}
            {view === "create" && <CreateEbookView />}
            {view === "library" && <LibraryView onCreateNew={() => setView("create")} />}
            {/* tools view removed */}
            {view === "support" && <SupportView />}
            {view === "profile" && <ProfileView />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
