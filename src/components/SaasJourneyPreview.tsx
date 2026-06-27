import { useEffect, useState } from "react";

const V = "20260627c";
const STEPS = [
  { label: "Passo 1 — Escolha o Nicho", url: `/preview/saas-journey-step-1-current-20260627.png?v=${V}` },
  { label: "Passo 2 — Defina o Preço", url: `/preview/saas-journey-step-2-current-20260627.png?v=${V}` },
  { label: "Passo 3 — Geração do Ebook", url: `/preview/saas-journey-step-3-current-20260627.png?v=${V}` },
  { label: "Passo 4 — Geração da Página de Vendas", url: `/preview/saas-journey-step-4-current-20260627.png?v=${V}` },
  { label: "Passo 5 — Divulgação e Venda", url: `/preview/saas-journey-step-5-current-20260627.png?v=${V}` },
];

const INTERVAL_MS = 4000;

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
