import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardView } from "@/components/views/DashboardView";
import { CreateEbookView } from "@/components/views/CreateEbookView";
import { LibraryView } from "@/components/views/LibraryView";
// ToolsView removed
import { SupportView } from "@/components/views/SupportView";
import { ProfileView } from "@/components/views/ProfileView";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
            <SidebarTrigger />
            <div className="relative hidden sm:block flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar ebooks, ferramentas..." className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:bg-background" />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
              </button>
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
