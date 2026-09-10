import React, { useEffect } from "react";
import { X, QrCode, CreditCard, ShieldCheck, Zap, Lock } from "lucide-react";
import { PlanId, getCheckoutUrl } from "@/config/checkoutLinks";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: PlanId;
  userEmail?: string;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  planId,
  userEmail,
}) => {
  // Fechar ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLifetime = planId === "lifetime";

  const handleSelectMethod = (method: "pix" | "card") => {
    const url = getCheckoutUrl(planId, method, userEmail);
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#000000] border-2 border-[#FF0000]/40 rounded-3xl p-6 sm:p-8 text-white shadow-[0_0_60px_rgba(255,0,0,0.25)] z-10 overflow-hidden">
        
        {/* Glow sutil no topo */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#FF0000]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF0000] text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" /> Escolha a Forma de Pagamento
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Como prefere pagar?
          </h3>
          <p className="text-white/60 text-sm">
            Você selecionou o{" "}
            <span className="text-white font-bold">
              {isLifetime ? "Plano Vitalício" : "Plano Mensal"}
            </span>
            {" — "}
            <span className="text-[#FF0000] font-bold">
              {isLifetime ? "R$ 247,90 (Único)" : "R$ 147,90/mês"}
            </span>
          </p>
        </div>

        {/* Opções de Pagamento */}
        <div className="space-y-4 mb-6">
          {/* Opção 1: PIX (PinguPag) */}
          <button
            onClick={() => handleSelectMethod("pix")}
            className="group w-full text-left bg-gradient-to-r from-white/[0.04] to-white/[0.02] hover:from-[#FF0000]/10 hover:to-[#FF0000]/5 border-2 border-white/10 hover:border-[#FF0000] rounded-2xl p-5 transition-all duration-300 shadow-md hover:shadow-[0_0_30px_rgba(255,0,0,0.3)] relative overflow-hidden flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/30 flex items-center justify-center text-[#FF0000] group-hover:scale-110 group-hover:bg-[#FF0000] group-hover:text-white transition-all duration-300 shrink-0">
                <QrCode className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg text-white group-hover:text-[#FF0000] transition-colors">
                    Pagar com PIX
                  </span>
                  <span className="bg-[#FF0000] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm">
                    Acesso Imediato
                  </span>
                </div>
                <p className="text-xs text-white/50 group-hover:text-white/80 transition-colors">
                  Aprovação instantânea • Liberação do SaaS em segundos
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all text-sm font-semibold pl-2">
              Pagar →
            </div>
          </button>

          {/* Opção 2: Cartão de Crédito (Applyfy) */}
          <button
            onClick={() => handleSelectMethod("card")}
            className="group w-full text-left bg-gradient-to-r from-white/[0.04] to-white/[0.02] hover:from-white/[0.08] hover:to-white/[0.04] border-2 border-white/10 hover:border-white/40 rounded-2xl p-5 transition-all duration-300 shadow-md hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] relative overflow-hidden flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-300 shrink-0">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg text-white transition-colors">
                    Pagar com Cartão de Crédito
                  </span>
                  <span className="bg-white/10 border border-white/20 text-white/90 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">
                    Até 12x
                  </span>
                </div>
                <p className="text-xs text-white/50 group-hover:text-white/80 transition-colors">
                  Parcele sua assinatura com total comodidade e segurança
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all text-sm font-semibold pl-2">
              Pagar →
            </div>
          </button>
        </div>

        {/* Rodapé de Segurança */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/40">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#FF0000]" />
            <span>Ambiente 100% Criptografado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF0000]" />
            <span>7 dias de garantia incondicional</span>
          </div>
        </div>
      </div>
    </div>
  );
};
