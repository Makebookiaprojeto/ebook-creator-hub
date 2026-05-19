import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
const faqs = [
  { q: "Como funciona a geração de ebooks com IA?", a: "Nossa IA cria estrutura, capítulos e conteúdo a partir do seu nicho. Você edita tudo livremente antes de publicar." },
  { q: "Como recebo os pagamentos das vendas?", a: "Os pagamentos são processados por algum checkout de sua preferência, garantindo segurança e rapidez." },
  { q: "Existe limite de ebooks?", a: "Sim, para manter a qualidade e o custo acessível para todos, cada usuário pode gerar até 20 novos eBooks por mês." },
  { q: "Posso cancelar quando quiser?", a: "Sim, no plano mensal você pode cancelar a qualquer momento sem fidelidade ou multas." },
];
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export function SupportView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("send-support-email", {
        body: { name, email, message: msg },
      });

      if (error) throw error;

      toast.success("Mensagem enviada com sucesso! Responderemos em breve.");
      setName("");
      setEmail("");
      setMsg("");
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
      toast.error("Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Suporte</h1>
        <p className="mt-1 text-muted-foreground">Tire suas dúvidas ou fale com nosso time.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Perguntas frequentes</h2>
          <p className="text-sm text-muted-foreground">As dúvidas mais comuns dos nossos usuários.</p>
          <Accordion type="single" collapsible className="mt-4">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Fale conosco</h2>
              <p className="text-xs text-muted-foreground">Resposta em até 48h</p>
            </div>
          </div>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium">Seu nome</label>
              <Input className="mt-1.5" placeholder="João Silva" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-medium">Seu e-mail</label>
              <Input 
                className="mt-1.5" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="text-xs font-medium">Mensagem</label>
              <Textarea className="mt-1.5 min-h-[120px]" placeholder="Como podemos ajudar?" value={msg} onChange={(e) => setMsg(e.target.value)} required />
            </div>
            <Button 
              type="submit" 
              className="w-full gradient-primary text-primary-foreground shadow-glow"
              disabled={loading}
            >
              {loading ? (
                <>Processando...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Enviar mensagem
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
