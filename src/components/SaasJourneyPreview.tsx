import { useEffect, useState } from "react";
import step1Asset from "@/assets/preview/step-1.png.asset.json";
import step2Asset from "@/assets/preview/step-2.png.asset.json";
import step3Asset from "@/assets/preview/step-3.png.asset.json";
import step4Asset from "@/assets/preview/step-4.png.asset.json";
import step5Asset from "@/assets/preview/step-5.png.asset.json";

const STEPS = [
  { label: "Passo 1 — Escolha o Nicho", url: step1Asset.url },
  { label: "Passo 2 — Defina o Preço", url: step2Asset.url },
  { label: "Passo 3 — Geração do Ebook", url: step3Asset.url },
  { label: "Passo 4 — Geração da Página de Vendas", url: step4Asset.url },
  { label: "Passo 5 — Divulgação e Venda", url: step5Asset.url },
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
              className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
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
