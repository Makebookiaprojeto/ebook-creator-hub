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
import { LayoutDashboard, Library, Plus, LifeBuoy, User, LogOut, Sliders, Search, Plug, Ticket, Copy, Check, Zap, Sparkles } from "lucide-react";
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
        <DialogContent className="sm:max-w-[440px] bg-[#0a0a0a] border border-white/10 text-white rounded-3xl p-6 sm:p-7 shadow-[0_0_60px_rgba(255,0,0,0.18)] overflow-hidden">
          {/* Subtle Top Red Ambient Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-32 bg-[#FF0000]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative text-center pt-2 sm:pt-3 mb-6">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#FF0000]/10 border border-[#FF0000]/25 text-[#FF0000] text-[11px] font-bold tracking-wider uppercase mb-6">
              Indicação Exclusiva
            </div>
            <DialogTitle className="text-2xl font-black text-white tracking-tight uppercase">
              INDIQUE AMIGOS
            </DialogTitle>
            <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-xs mx-auto leading-relaxed">
              Você possui <span className="text-[#FF0000] font-bold">5 cupons</span> de indicação de <span className="text-white font-bold">50% OFF</span> disponíveis para compartilhar com seus amigos!
            </p>
          </div>

          {/* Code Box with Quick Click-to-Copy (without enclosing gray border/field) */}
          <div 
            onClick={handleCopyCoupon}
            className="group cursor-pointer flex items-center justify-between px-2 py-2 mb-4 transition-all duration-200"
            title="Clique para copiar"
          >
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Código do Cupom</span>
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-white group-hover:text-[#FF0000] transition-colors">
                VIP50
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 group-hover:bg-[#FF0000]/10 group-hover:border-[#FF0000]/30 group-hover:text-white transition-all">
              {couponCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </div>
          </div>

          {/* Scarcity / Counter Banner */}
          <div className="relative flex items-center justify-between bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 mb-6">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF0000]"></span>
              </span>
              <span className="text-xs font-semibold text-white/90">
                CUPOM <span className="text-[#FF0000] font-bold">50% OFF</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FF0000]/15 border border-[#FF0000]/30 px-2.5 py-0.5 rounded-full">
              <span className="text-[11px] font-extrabold text-[#FF0000] uppercase tracking-wider">
                5 disponíveis
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            type="button"
            onClick={handleCopyCoupon}
            className={`w-full h-12 rounded-xl font-extrabold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] ${
              couponCopied
                ? "bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                : "bg-[#FF0000] hover:bg-[#E00000] text-white shadow-[0_0_25px_rgba(255,0,0,0.35)] hover:shadow-[0_0_35px_rgba(255,0,0,0.5)]"
            }`}
          >
            {couponCopied ? (
              <>
                <Check className="w-4 h-4 text-black stroke-[3]" /> Cupom VIP50 Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 stroke-[2.5]" /> Copiar Cupom
              </>
            )}
          </Button>
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
