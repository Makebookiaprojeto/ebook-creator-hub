import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import React from "react";
import { ShoppingCart } from "lucide-react";

const NICHE_KEY = "admin_test_sale_niche";
const PRICE_KEY = "admin_test_sale_price";

export function getTestSaleConfig(): { niche: string; price: number } {
  const niche = localStorage.getItem(NICHE_KEY) || "Ebook High Ticket";
  const rawPrice = localStorage.getItem(PRICE_KEY);
  const price = rawPrice ? parseFloat(rawPrice) || 97 : 97;
  return { niche, price };
}

export function setTestSaleConfig(niche: string, price: number): void {
  localStorage.setItem(NICHE_KEY, niche);
  localStorage.setItem(PRICE_KEY, price.toString());
}

export async function triggerTestSale(userId: string): Promise<void> {
  const { niche, price } = getTestSaleConfig();
  const formattedPrice = price.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const displayDescription = `${niche} - R$ ${formattedPrice}`;

  // 1. Toca o som de venda
  try {
    const audio = new Audio("/sounds/sale.mp3?v=3");
    audio.volume = 0.4;
    audio.play().catch((err) => console.warn("Erro ao tocar som de venda de teste:", err));
  } catch (e) {
    console.warn("Erro ao inicializar áudio de teste:", e);
  }

  toast.custom((t) => (
    <div className="relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-green-500/30 bg-white p-4 shadow-[0_8px_30px_rgba(34,197,94,0.15)] dark:border-green-500/30 dark:bg-black dark:shadow-[0_8px_30px_rgba(34,197,94,0.15)]">
      <div className="absolute -left-4 -top-4 h-16 w-16 rounded-full bg-green-500/20 blur-xl dark:bg-green-500/10"></div>
      
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
        <ShoppingCart className="h-6 w-6" />
      </div>
      
      <div className="flex flex-col gap-0.5 z-10">
        <p className="text-[13px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
          Venda Realizada !!!
        </p>
        <p className="text-[14px] font-medium text-slate-600 dark:text-slate-300">
          {displayDescription}
        </p>
      </div>
    </div>
  ), {
    duration: 5000,
    position: "top-right",
  });

  // 3. Insere a notificação no Supabase (se falhar, o toast e o som já funcionaram)
  try {
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Venda realizada",
      message: displayDescription,
      type: "sale",
      read: false,
    });
  } catch (err) {
    console.warn("Erro ao salvar notificação de teste no Supabase:", err);
  }

  // 4. Notifica o Dashboard para atualizar métricas
  window.dispatchEvent(new CustomEvent("refresh-dashboard", { detail: { isTestSale: true, price: price } }));
}
