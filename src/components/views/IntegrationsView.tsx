import caktoLogo from "@/assets/integracao-cakto.jpeg";
import kiwifyLogo from "@/assets/integracao-kiwify.jpeg";

// Preload logos at module load so they're cached before the view mounts
if (typeof window !== "undefined") {
  [caktoLogo, kiwifyLogo].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

export function IntegrationsView() {
  return (
    <div className="space-y-12 animate-fade-in -mt-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Integrações</h1>
        <p className="text-muted-foreground mt-2">
          Essa ferramenta possui integração com as seguintes plataformas:
        </p>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-10 pt-16">
        <div className="rounded-2xl border bg-card p-8 shadow-[0_0_18px_rgba(212,175,55,0.35)]">
          <img src={caktoLogo} alt="Cakto" className="h-48 w-auto object-contain rounded-lg" />
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-[0_0_18px_rgba(212,175,55,0.35)]">
          <img src={kiwifyLogo} alt="Kiwify" className="h-48 w-auto object-contain rounded-lg" />
        </div>
      </div>
    </div>
  );
}
