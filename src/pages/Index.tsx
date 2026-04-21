import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardView } from "@/components/views/DashboardView";
import { CreateEbookView } from "@/components/views/CreateEbookView";
import { ToolsView } from "@/components/views/ToolsView";
import { SupportView } from "@/components/views/SupportView";
import { ProfileView } from "@/components/views/ProfileView";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type View = "dashboard" | "create" | "tools" | "support" | "profile";

const Index = () => {
  const [view, setView] = useState<View>("dashboard");

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
                className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm font-semibold text-primary-foreground shadow-glow"
              >
                L
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
            {view === "dashboard" && <DashboardView />}
            {view === "create" && <CreateEbookView />}
            {view === "tools" && <ToolsView />}
            {view === "support" && <SupportView />}
            {view === "profile" && <ProfileView />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
