import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  Loader2,
  ShieldCheck,
  Star,
  Zap,
  CheckSquare,
  Award,
  Target,
  Rocket,
  MousePointer2,
  TrendingUp,
  Lock as LockIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

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
    toast.error("Este eBook ainda não tem link de pagamento configurado.");
  };

  useEffect(() => {
    let active = true;
    (async () => {
      if (!slug) return;
      setLoading(true);
      
      const { data: ebookData } = await (supabase
        .from("public_ebooks" as any)
        .select("*")
        .eq("slug", slug)
        .maybeSingle() as any);

      if (!active) return;
      if (!ebookData) {
        setLoading(false);
        return;
      }

      const { data: chData } = await supabase
        .from("chapters")
        .select("*")
        .eq("ebook_id", ebookData.id)
        .order("order_index", { ascending: true });

      setEbook(ebookData);
      setChapters(chData || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-orange-500" /></div>;
  if (!ebook) return <div className="min-h-screen flex items-center justify-center">eBook não encontrado.</div>;

  const price = formatPrice(ebook.price_cents);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] font-sans">
      {/* HERO PREMIUM */}
      <section className="pt-24 pb-32">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 font-bold text-sm uppercase tracking-wider">
                Conteúdo Premium
              </span>
              <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95]">
                {ebook.title}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                {ebook.subtitle || "Aprenda de forma prática e rápida com este guia definitivo."}
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Button 
                  size="lg" 
                  onClick={handleCheckout} 
                  className="h-16 px-10 text-xl font-bold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-full transition-all shadow-lg hover:shadow-orange-500/30"
                >
                  GARANTIR ACESSO IMEDIATO
                </Button>
                <div className="text-left">
                  <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Investimento</p>
                  <p className="text-3xl font-black text-[#111111]">{price}</p>
                </div>
              </div>
            </div>
            <div className="relative group perspective-1000">
              <div className="absolute inset-0 bg-orange-100 blur-3xl opacity-50 -z-10 rounded-full" />
              <div className="relative transform group-hover:rotate-2 transition-transform duration-500 shadow-2xl rounded-2xl overflow-hidden aspect-[3/4]">
                <img src={ebook.cover_url || ""} alt="Capa" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-4xl font-black text-center mb-16">Por que este material é indispensável?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-6">
                  <Rocket className="h-7 w-7 text-[#F97316]" />
                </div>
                <h3 className="text-xl font-bold mb-3">Resultado Prático {i}</h3>
                <p className="text-gray-600">Descrição curta de como este benefício transforma sua rotina e gera resultados rápidos.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O QUE VOCÊ VAI APRENDER */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-black">O que você vai aprender</h2>
              <p className="text-lg text-gray-600">Uma estrutura desenhada para levar você do zero ao nível avançado com clareza.</p>
              <ul className="space-y-4">
                {chapters.slice(0, 5).map((ch, i) => (
                  <li key={ch.id} className="flex gap-4 items-center">
                    <div className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">{i + 1}</div>
                    <span className="font-semibold text-lg">{ch.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[4/5] bg-gray-200 rounded-2xl shadow-inner border" />
              <div className="aspect-[4/5] bg-gray-200 rounded-2xl shadow-inner border mt-12" />
            </div>
          </div>
        </div>
      </section>

      {/* OFERTA FINAL */}
      <section className="py-24 bg-[#111111] text-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-5xl font-black mb-8">Acesso Imediato</h2>
          <p className="text-xl text-gray-400 mb-12">Garanta agora o seu eBook por um preço promocional especial.</p>
          <div className="p-10 bg-white rounded-[2rem] text-[#111111]">
            <p className="text-2xl font-bold mb-4">Investimento Total</p>
            <p className="text-7xl font-black text-[#F97316] mb-8">{price}</p>
            <Button 
              size="lg" 
              onClick={handleCheckout} 
              className="h-16 w-full max-w-md text-xl font-bold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-full transition-all shadow-lg hover:shadow-orange-500/30"
            >
              GARANTIR MEU ACESSO
            </Button>
            <div className="mt-8 flex justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2"><ShieldCheck size={16}/> Compra segura</span>
              <span className="flex items-center gap-2"><LockIcon size={16}/> Pagamento protegido</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
