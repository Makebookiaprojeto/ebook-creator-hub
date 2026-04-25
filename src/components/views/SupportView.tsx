import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { faqs } from "@/lib/mockData";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export function SupportView() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !msg) return;

    setLoading(true);
    
    // Configura o email de suporte aqui
    const supportEmail = "suporte@ebookai.com.br"; // Substitua pelo seu email real
    const subject = encodeURIComponent(`Suporte EbookAI - Mensagem de ${name}`);
    const body = encodeURIComponent(`Nome: ${name}\n\nMensagem:\n${msg}`);
    
    // Abre o cliente de email do usuário
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
    
    toast.success("Abrindo seu cliente de e-mail para enviar a mensagem!");
    
    setTimeout(() => {
      setName("");
      setMsg("");
      setLoading(false);
    }, 1000);
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
              <p className="text-xs text-muted-foreground">Resposta em até 24h</p>
            </div>
          </div>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium">Seu nome</label>
              <Input className="mt-1.5" placeholder="João Silva" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-medium">Mensagem</label>
              <Textarea className="mt-1.5 min-h-[120px]" placeholder="Como podemos ajudar?" value={msg} onChange={(e) => setMsg(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground shadow-glow">
              <Send className="mr-2 h-4 w-4" /> Enviar mensagem
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
