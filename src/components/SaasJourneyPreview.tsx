import { useEffect, useState } from "react";
import passo1 from "@/assets/preview-steps/PASSO-1.png?url";
import passo2 from "@/assets/preview-steps/PASSO-2.png?url";
import passo3 from "@/assets/preview-steps/PASSO-3.png?url";
import passo4 from "@/assets/preview-steps/PASSO-4.png?url";
import passo5 from "@/assets/preview-steps/PASSO-5.png?url";
import passo5b from "@/assets/preview-steps/PASSO-5b.png?url";

const STEPS = [
  { label: "Passo 1 — Selecione o Nicho", url: passo1 },
  { label: "Passo 2 — Defina o Preço", url: passo2 },
  { label: "Passo 3 — Gere o Ebook", url: passo3 },
  { label: "Passo 4 — Configure a Página de Vendas", url: passo4 },
  { label: "Passo 5 — Divulgue seu Produto", url: passo5 },
  { label: "Passo 5 — Vídeos prontos para divulgação", url: passo5b },
];

const INTERVAL_MS = 1000;

export function SaasJourneyPreview() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % STEPS.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-12 mx-auto max-w-5xl px-4">
      <div className="text-center mb-5">
        <p className="text-sm md:text-base font-semibold text-primary">
          {STEPS[index].label}
        </p>
      </div>
      <div className="relative rounded-2xl border border-border/40 bg-card/60 shadow-2xl overflow-hidden backdrop-blur">
        <div className="relative aspect-[16/9] w-full bg-background">
          {STEPS.map((s, i) => (
            <img
              key={s.url}
              src={s.url}
              alt={s.label}
              className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2">
        {STEPS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir para ${STEPS[i].label}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
