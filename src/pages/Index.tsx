import { useState, useEffect } from "react";
import { NotificationBell } from "@/components/NotificationBell";
import { DashboardView } from "@/components/views/DashboardView";
import { CreateEbookView } from "@/components/views/CreateEbookView";
import { LibraryView } from "@/components/views/LibraryView";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SupportView } from "@/components/views/SupportView";
import { ProfileView } from "@/components/views/ProfileView";
import { SearchView } from "@/components/views/SearchView";
import { IntegrationsView } from "@/components/views/IntegrationsView";
import { LayoutDashboard, Library, Plus, LifeBuoy, User, LogOut, Sliders, Search, Plug } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { resolveDisplayName, initialFromName } from "@/lib/userName";
import saasLogo from "@/assets/saas-logo.jpg";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getTestSaleConfig, setTestSaleConfig } from "@/lib/adminTestSales";

type View = "dashboard" | "create" | "library" | "support" | "profile" | "search" | "integrations";

const Index = () => {
  const [view, setView] = useState<View>("dashboard");
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testNiche, setTestNiche] = useState("");
  const [testPrice, setTestPrice] = useState("");
  const [simulatedSales, setSimulatedSales] = useState(0);

  const handleOpenTestModal = () => {
    const config = getTestSaleConfig();
    setTestNiche(config.niche);
    setTestPrice(config.price.toString());
    setTestModalOpen(true);
  };

  const handleSaveTestConfig = () => {
    const p = parseFloat(testPrice);
    if (isNaN(p) || p <= 0) {
      toast.error("Preço inválido.");
      return;
    }
    setTestSaleConfig(testNiche, p);
    setTestModalOpen(false);
    toast.success("Configuração de teste salva!");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Você saiu da sua conta.");
    navigate("/", { replace: true });
  };

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

  return (
    <div className="min-h-screen flex flex-col w-full bg-background relative">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 bg-background/80 backdrop-blur-md px-4 sm:px-6">
        {/* Logo at top left */}
        {view === "dashboard" && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-glow">
            <img src={saasLogo} alt="EbookAI Builder" className="h-full w-full object-cover" />
          </div>
        )}
        
        
        <div className="flex-1" />
        {view === "dashboard" && (
          <div className="ml-auto flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={handleOpenTestModal}
                title="Configurar Venda de Teste"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-card/50 backdrop-blur-sm border border-border hover:bg-muted transition text-foreground shadow-sm"
              >
                <Sliders className="h-3.5 w-3.5" />
              </button>
            )}
            <ThemeToggle />
            <NotificationBell />
          </div>
        )}
      </header>

      <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto pb-24 sm:pb-32 overflow-x-hidden">
        {view === "dashboard" && <DashboardView />}
        {view === "create" && <CreateEbookView />}
        {view === "library" && <LibraryView onCreateNew={() => setView("create")} />}
        {view === "support" && <SupportView />}
        {view === "profile" && <ProfileView />}
        {view === "search" && <SearchView />}
        {view === "integrations" && <IntegrationsView />}
      </main>

      {/* Dock Menu */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-4 w-full sm:w-auto px-2 sm:px-0 justify-center">
        <div className="flex items-center gap-1 sm:gap-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 px-2 sm:px-4 py-1.5 rounded-full shadow-md">
          <button onClick={() => setView("dashboard")} className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${view === "dashboard" ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"}`} title="Dashboard">
            <LayoutDashboard className="h-4 w-4" />
          </button>
          <button onClick={() => setView("library")} className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${view === "library" ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"}`} title="Biblioteca">
            <Library className="h-4 w-4" />
            </button>
          <button onClick={() => setView("search")} className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${view === "search" ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"}`} title="Buscar">
            <Search className="h-4 w-4" />
          </button>
          
          <button onClick={() => setView("create")} className="flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-full transition-all bg-white dark:bg-black border-2 border-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95 text-blue-600 -mt-4 sm:-mt-6 relative" title="Nova Estrutura">
            <Plus className="h-6 w-6" />
            </button>
          <button onClick={() => setView("integrations")} className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${view === "integrations" ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"}`} title="Integrações">
            <Plug className="h-4 w-4" />
          </button>
          
          <button onClick={() => setView("support")} className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${view === "support" ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"}`} title="Suporte">
            <LifeBuoy className="h-4 w-4" />
          </button>
          <button onClick={() => setView("profile")} className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${view === "profile" ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"}`} title="Perfil">
            <User className="h-4 w-4" />
          </button>
        </div>
      
        <button
          onClick={handleSignOut}
          title="Sair"
          className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400 shadow-md"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Modal de Configuração de Teste de Venda */}
      {isAdmin && (
        <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
          <DialogContent className="sm:max-w-[425px] border-border bg-card text-foreground">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" /> Configurar Venda de Teste
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="testNiche">Nicho do Ebook</Label>
                <Input
                  id="testNiche"
                  value={testNiche}
                  onChange={(e) => setTestNiche(e.target.value)}
                  placeholder="Ex: Receitas Fitness, Marketing..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="testPrice">Preço da Venda (R$)</Label>
                <Input
                  id="testPrice"
                  type="number"
                  step="0.01"
                  value={testPrice}
                  onChange={(e) => setTestPrice(e.target.value)}
                  placeholder="Ex: 97.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSaveTestConfig}
                className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
              >
                Salvar Configurações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Index;
