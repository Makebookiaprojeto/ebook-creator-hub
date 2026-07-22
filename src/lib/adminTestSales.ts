import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import React from "react";
import { ShoppingCart } from "lucide-react";

const ADMIN_EMAIL = "tr8200774@gmail.com";
const NICHE_KEY = "admin_test_sale_niche";
const PRICE_KEY = "admin_test_sale_price";

export function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

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

  // 2. Dispara o toast imediato na tela
  toast.success("VENDA REALIZADA !!!", {
    description: displayDescription,
    duration: 5000,
    position: "top-right",
    icon: React.createElement(ShoppingCart, { className: "h-4 w-4 text-primary" }),
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
  window.dispatchEvent(new CustomEvent("refresh-dashboard"));
}
