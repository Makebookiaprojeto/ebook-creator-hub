import caktoLogo from "@/assets/integracao-cakto.jpeg";
import kiwifyLogo from "@/assets/integracao-kiwify.jpeg";

export function IntegrationsView() {
  return (
    <div className="space-y-6 animate-fade-in -mt-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Integrações</h1>
        <p className="text-muted-foreground mt-2">
          Essa ferramenta possui integração com as seguintes plataformas:
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="rounded-2xl border bg-card p-4 shadow-[0_0_18px_rgba(212,175,55,0.35)]">
          <img src={caktoLogo} alt="Cakto" className="h-32 w-auto object-contain rounded-lg" />
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-[0_0_18px_rgba(212,175,55,0.35)]">
          <img src={kiwifyLogo} alt="Kiwify" className="h-32 w-auto object-contain rounded-lg" />
        </div>
      </div>
    </div>
  );
}
