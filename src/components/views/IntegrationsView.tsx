const platforms = ["Kiwify", "Cakto", "Hotmart", "Applyfy", "PerfectPay"];

export function IntegrationsView() {
  return (
    <div className="space-y-8 animate-fade-in sm:-mt-6 mt-0">
      <div>
        <h1 className="font-display text-3xl font-bold">Integrações</h1>
        <p className="text-muted-foreground mt-2">
          Essa ferramenta possui integração com as seguintes plataformas:
        </p>
      </div>

      <div className="flex flex-col items-start gap-3.5 pt-4">
        {platforms.map((gateway) => (
          <div
            key={gateway}
            className="min-w-[200px] text-center px-6 py-2.5 rounded-2xl border border-black/10 dark:border-white/10 bg-[#000000] text-white font-bold text-base shadow-[0_0_15px_rgba(255,0,0,0.35)]"
          >
            {gateway}
          </div>
        ))}
      </div>

      <div className="pt-2 max-w-2xl">
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Basta conectar o link de checkout da plataforma que você utiliza na página de vendas que é gerada pela ferramenta.
        </p>
      </div>
    </div>
  );
}
