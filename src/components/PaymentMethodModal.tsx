import React, { useEffect } from "react";
import { X, CreditCard, ShieldCheck, Zap, Lock } from "lucide-react";
import { PlanId, getCheckoutUrl } from "@/config/checkoutLinks";

// Símbolo minimalista oficial do PIX (Banco Central do Brasil)
const PixIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.917 11.71a2.046 2.046 0 0 1-1.454-.602l-2.1-2.1a.4.4 0 0 0-.551 0l-2.108 2.108a2.044 2.044 0 0 1-1.454.602h-.414l2.66 2.66c.83.83 2.177.83 3.007 0l2.667-2.668h-.253zM4.25 4.282c.55 0 1.066.214 1.454.602l2.108 2.108a.39.39 0 0 0 .552 0l2.1-2.1a2.044 2.044 0 0 1 1.453-.602h.253L9.503 1.623a2.127 2.127 0 0 0-3.007 0l-2.66 2.66h.414z" />
    <path d="m14.377 6.496-1.612-1.612a.307.307 0 0 1-.114.023h-.733c-.379 0-.75.154-1.017.422l-2.1 2.1a1.005 1.005 0 0 1-1.425 0L5.268 5.32a1.448 1.448 0 0 0-1.018-.422h-.9a.306.306 0 0 1-.109-.021L1.623 6.496c-.83.83-.83 2.177 0 3.008l1.618 1.618a.305.305 0 0 1 .108-.022h.901c.38 0 .75-.153 1.018-.421L7.375 8.57a1.034 1.034 0 0 1 1.426 0l2.1 2.1c.267.268.638.421 1.017.421h.733c.04 0 .079.01.114.024l1.612-1.612c.83-.83.83-2.178 0-3.008z" />
  </svg>
);

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
      <div className="relative w-full max-w-md bg-[#000000] border-2 border-[#FF0000]/40 rounded-3xl p-6 sm:p-7 text-white shadow-[0_0_60px_rgba(255,0,0,0.25)] z-10 overflow-hidden">
        
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF0000] text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" /> Escolha a Forma de Pagamento
          </div>
          <p className="text-center font-bold text-base sm:text-lg text-white tracking-tight">
            <span>
              {isLifetime ? "Plano Vitalício" : "Plano Mensal"}
            </span>
            {" — "}
            <span className="text-[#FF0000]">
              {isLifetime ? "R$ 247,90 (Único)" : "R$ 147,90/mês"}
            </span>
          </p>
        </div>

        {/* Opções Minimalistas de Pagamento */}
        <div className="space-y-3 mb-6">
          {/* Opção 1: PIX (PinguPag) - Branco minimalista */}
          <button
            onClick={() => handleSelectMethod("pix")}
            className="w-full flex items-center justify-center gap-2.5 bg-white text-black font-extrabold text-sm sm:text-base tracking-wide rounded-xl py-3.5 px-4 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-neutral-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
          >
            <PixIcon className="w-5 h-5 text-black shrink-0" />
            <span>PAGAR COM PIX</span>
          </button>

          {/* Opção 2: Cartão de Crédito (Applyfy) - Vermelho minimalista */}
          <button
            onClick={() => handleSelectMethod("card")}
            className="w-full flex items-center justify-center gap-2.5 bg-[#FF0000] text-white font-extrabold text-sm sm:text-base tracking-wide rounded-xl py-3.5 px-4 shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:bg-[#E60000] hover:shadow-[0_0_30px_rgba(255,0,0,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
          >
            <CreditCard className="w-5 h-5 text-white shrink-0" />
            <span>PAGAR COM CARTÃO DE CRÉDITO</span>
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
