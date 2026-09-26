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
import { LayoutDashboard, Library, Plus, LifeBuoy, User, LogOut, Sliders, Search, Plug, Ticket, Copy, Check, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testNiche, setTestNiche] = useState("");
  const [testPrice, setTestPrice] = useState("");
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("VIP50");
    setCouponCopied(true);
    toast.success("Cupom VIP50 copiado com sucesso!");
    setTimeout(() => setCouponCopied(false), 2000);
  };

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
    // Garantir que o perfil existe (fallback de segurança)
    supabase.rpc("ensure_profile_exists", { p_user_id: user.id });
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
        {view === "create" && (
          <CreateEbookView
            onComplete={() => setView("dashboard")}
            onCancel={() => setView("dashboard")}
          />
        )}
        {view === "library" && <LibraryView onCreateNew={() => setView("create")} />}
        {view === "support" && <SupportView />}
        {view === "profile" && <ProfileView />}
        {view === "search" && <SearchView />}
        {view === "integrations" && <IntegrationsView />}
      </main>

      {/* Dock Menu */}
      {view !== "create" && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-4 w-full sm:w-auto px-2 sm:px-0 justify-center">
          <div className="flex items-center gap-1 sm:gap-6 bg-white dark:bg-black border border-gray-200 dark:border-white/10 px-2 sm:px-4 py-1.5 rounded-full shadow-md">
            <button onClick={() => setView("dashboard")} className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${view === "dashboard" ? "text-[#FF0000] bg-red-50 dark:bg-red-950/30" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"}`} title="Dashboard">
              <LayoutDashboard className="h-4 w-4" />
            </button>
            <button onClick={() => setView("library")} className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${view === "library" ? "text-[#FF0000] bg-red-50 dark:bg-red-950/30" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"}`} title="Biblioteca">
              <Library className="h-4 w-4" />
              </button>
            <button onClick={() => setView("search")} className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${view === "search" ? "text-[#FF0000] bg-red-50 dark:bg-red-950/30" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"}`} title="Buscar">
              <Search className="h-4 w-4" />
            </button>
            
            <button onClick={() => setView("create")} className="flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-full transition-all bg-white dark:bg-black border-2 border-[#FF0000] shadow-[0_0_16px_rgba(255,0,0,0.45)] hover:scale-105 active:scale-95 text-[#FF0000] -mt-4 sm:-mt-6 relative" title="Nova Estrutura">
              <Plus className="h-6 w-6" />
            </button>
            <button onClick={() => setView("integrations")} className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${view === "integrations" ? "text-[#FF0000] bg-red-50 dark:bg-red-950/30" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"}`} title="Integrações">
              <Plug className="h-4 w-4" />
            </button>
            <button
              onClick={() => setReferralModalOpen(true)}
              className="flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all text-gray-500 dark:text-gray-400 hover:text-[#FF0000] dark:hover:text-[#FF0000] hover:bg-gray-100 dark:hover:bg-white/5"
              title="CUPONS"
            >
              <Ticket className="h-4 w-4" />
            </button>
            <button onClick={() => setView("support")} className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${view === "support" ? "text-[#FF0000] bg-red-50 dark:bg-red-950/30" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"}`} title="Suporte">
              <LifeBuoy className="h-4 w-4" />
            </button>
            <button onClick={() => setView("profile")} className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${view === "profile" ? "text-[#FF0000] bg-red-50 dark:bg-red-950/30" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"}`} title="Perfil">
              <User className="h-4 w-4" />
            </button>
          </div>
        
          <button
            onClick={handleSignOut}
            title="Sair"
            className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition text-gray-500 dark:text-gray-400 shadow-md"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* MODAL INDIQUE AMIGOS / CUPONS */}
      <Dialog open={referralModalOpen} onOpenChange={setReferralModalOpen}>
        <DialogContent className="sm:max-w-[420px] bg-[#000000] border-2 border-[#FF0000]/40 text-white rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(255,0,0,0.25)]">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/30 flex items-center justify-center text-[#FF0000] mb-3">
              <Ticket className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Indique Amigos
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF0000] text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> 50% OFF Disponível
            </div>

            <p className="text-sm text-white/80 leading-relaxed font-medium">
              Você possui <span className="text-[#FF0000] font-bold">5 cupons</span> de indicação de <span className="text-white font-bold">50% OFF</span> disponíveis para compartilhar com seus amigos!
            </p>

            {/* BOX DO CÓDIGO DO CUPOM */}
            <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/10 relative overflow-hidden">
              <div className="text-[11px] text-white/40 uppercase font-semibold tracking-wider mb-1.5">
                Código do Cupom de Desconto
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-widest text-[#FF0000] selection:bg-[#FF0000] selection:text-white">
                VIP50
              </div>
              <div className="text-[11px] text-white/40 mt-1">
                Válido para o Plano Mensal e Vitalício
              </div>
            </div>

            {/* BOTÃO COPIAR */}
            <Button
              type="button"
              onClick={handleCopyCoupon}
              className="w-full h-12 rounded-xl font-bold text-sm bg-[#FF0000] hover:bg-[#CC0000] text-white shadow-[0_0_25px_rgba(255,0,0,0.35)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {couponCopied ? (
                <>
                  <Check className="w-4 h-4 text-white" /> Cupom Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" /> Copiar Cupom
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
