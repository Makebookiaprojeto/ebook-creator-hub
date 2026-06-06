import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import {
  Rocket,
  ShieldCheck,
  Lock as LockIcon,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Award,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type Ebook = Tables<"ebooks">;
type Chapter = Tables<"chapters">;

function formatPrice(cents?: number | null) {
  if (!cents || cents <= 0) return "Grátis";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export default function EbookSalesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const handleCheckout = async () => {
    if (!ebook) return;
    setCheckoutLoading(true);
    let checkoutUrl = (ebook as any).cakto_checkout_url || (ebook as any).checkout_url;
    if (checkoutUrl) {
      try {
        const url = new URL(checkoutUrl);
        url.searchParams.set("ebook_id", ebook.id);
        url.searchParams.set("seller_user_id", ebook.user_id);
        window.location.href = url.toString();
      } catch (e) {
        window.location.href = checkoutUrl;
      }
      return;
    }
    setCheckoutLoading(false);
    toast.error("Link de pagamento não configurado.");
  };

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data: ebookData } = await (supabase.from("public_ebooks" as any).select("*").eq("slug", slug).maybeSingle() as any);
      if (!ebookData) { setLoading(false); return; }
      const { data: chData } = await supabase.from("chapters").select("*").eq("ebook_id", ebookData.id).order("order_index", { ascending: true });
      setEbook(ebookData);
      setChapters(chData || []);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-orange-500" /></div>;
  if (!ebook) return <div className="min-h-screen flex items-center justify-center">eBook não encontrado.</div>;

  const price = formatPrice(ebook.price_cents);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] font-sans">
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 pb-32">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 font-bold text-sm uppercase tracking-wider">Conteúdo Premium</span>
              <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95]">{ebook.title}</h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">{ebook.subtitle}</p>
              <div className="flex items-center gap-6 pt-4">
                <Button size="lg" onClick={handleCheckout} className="h-16 px-10 text-xl font-bold bg-[#F97316] hover:bg-[#EA580C] rounded-full shadow-lg transition-all hover:scale-105">GARANTIR ACESSO IMEDIATO</Button>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Investimento</p>
                  <p className="text-3xl font-black">{price}</p>
                </div>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} className="relative aspect-[3/4] shadow-2xl rounded-2xl overflow-hidden">
              <img src={ebook.cover_url || ""} alt="Capa" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-4xl font-black text-center mb-16">Por que este material é indispensável?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Zap className="h-8 w-8 text-[#F97316] mb-4"/>
                <h3 className="font-bold text-lg mb-2">Diferencial {i + 1}</h3>
                <p className="text-sm text-gray-600">Descrição de impacto sobre este benefício profissional.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-4xl font-black text-center mb-16">Resultados e Transformação</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 bg-gray-100 rounded-3xl">
              <h3 className="text-xl font-bold mb-4 text-gray-600">ANTES</h3>
              <p>Processos manuais, falta de clareza e resultados abaixo do esperado.</p>
            </div>
            <div className="p-10 bg-[#111111] text-white rounded-3xl">
              <h3 className="text-xl font-bold mb-4 text-orange-500">DEPOIS</h3>
              <p>Autonomia, processos estruturados e escala de resultados.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#111111] text-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-5xl font-black mb-12">Garanta seu acesso hoje</h2>
          <div className="p-10 bg-white text-[#111111] rounded-[2rem] shadow-2xl">
            <p className="text-7xl font-black text-[#F97316] mb-8">{price}</p>
            <Button size="lg" onClick={handleCheckout} className="h-16 w-full text-xl font-bold bg-[#F97316] hover:bg-[#EA580C] rounded-full">GARANTIR MEU ACESSO</Button>
            <div className="mt-8 flex justify-center gap-8 text-sm text-gray-500">
              <span className="flex items-center gap-2"><ShieldCheck size={16}/> Compra Segura</span>
              <span className="flex items-center gap-2"><LockIcon size={16}/> Pagamento Protegido</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
