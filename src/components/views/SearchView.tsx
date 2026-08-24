import { useState } from "react";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function SearchView() {
  const [divulgacaoNiche, setDivulgacaoNiche] = useState("");

  const searchFacebookGroups = () => {
    const query = divulgacaoNiche.trim();
    if (!query) return toast.error("Digite o nicho para buscar");

    const termo = `grupos de ${query}`;
    const url = `https://www.facebook.com/search/top?q=${encodeURIComponent(termo)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold tracking-tight">Buscar Grupos</h1>
        <p className="text-muted-foreground mt-2">Encontre os melhores grupos para divulgar seu produto.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-6 rounded-lg border border-border bg-card/40 shadow-gold">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-1 text-[#FFFF00]">
            <Users className="h-5 w-5 text-primary" />
            Buscar grupos por nicho
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Encontre os melhores grupos para divulgar seu Ebook.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Ex: Emagrecimento, Finanças, Marketing Digital..."
              value={divulgacaoNiche}
              onChange={(e) => setDivulgacaoNiche(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  searchFacebookGroups();
                }
              }}
              className="flex-1 h-11 text-base"
            />

            <Button
              className="gradient-primary text-primary-foreground shadow-glow gap-2 h-11"
              onClick={searchFacebookGroups}
            >
              <Search className="h-4 w-4" />
              Buscar grupos
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
