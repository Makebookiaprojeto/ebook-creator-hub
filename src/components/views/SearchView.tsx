import { useState, useRef, memo } from "react";
import { Users, Search, Quote, Video, Copy, Play, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

const divulgacaoMensagens = [
  {
    id: 1,
    title: "Opção 1",
    text: "Pessoal, encontrei esse e-book esses dias e achei o conteúdo bem interessante. É bem direto e fácil de entender. Acho que pode ajudar quem está começando nesse assunto.\n\nVou deixar o link aqui para quem tiver interesse 👇",
  },
  {
    id: 2,
    title: "Opção 2",
    text: "Não sei se alguém aqui já conhece, mas encontrei esse e-book e achei que valia a pena compartilhar. O conteúdo é bem prático e não fica só naquela teoria toda.\n\nVou deixar o link para quem tiver interesse 👇",
  },
  {
    id: 3,
    title: "Opção 3",
    text: "Gente, achei esse material bem interessante e resolvi compartilhar aqui. Principalmente pra quem está começando, acho que pode ser útil.\n\nQuem quiser conferir, vou deixar o link aqui embaixo 👇",
  },
];

const DivulgacaoVideoCard = memo(function DivulgacaoVideoCard({
  title,
  src,
  filename,
  script,
}: {
  title: string;
  src: string;
  filename: string;
  script: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = async () => {
    if (!src) {
      toast.info("Vídeo será disponibilizado em breve.");
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    try {
      setPlaying(true);
      el.muted = false;
      await el.play();
    } catch {
      try {
        el.muted = true;
        await el.play();
      } catch {
        setPlaying(false);
        toast.error("Não foi possível reproduzir o vídeo neste navegador.");
      }
    }
  };

  const handleDownload = () => {
    if (!src) {
      toast.info("Vídeo será disponibilizado em breve.");
      return;
    }
    const link = document.createElement("a");
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Iniciando download do vídeo...");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 rounded-xl border border-white/30 bg-background/40 p-4">
      <div className="relative shrink-0 mx-auto sm:mx-0 w-[140px] aspect-[9/16] rounded-lg overflow-hidden bg-black border border-white/30">
        {src ? (
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-cover"
            controls={playing}
            playsInline
            preload="metadata"
            onPause={() => setPlaying(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center px-2">
            Vídeo em breve
          </div>
        )}
        {!playing && (
          <button
            type="button"
            onClick={handlePlay}
            aria-label="Reproduzir vídeo"
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
          >
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm">
              <Play className="h-5 w-5 ml-0.5" />
            </span>
          </button>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        <h4 className="text-base font-semibold mb-2 text-primary">{title}</h4>
        <div className="flex-1 flex flex-col justify-start pt-4 sm:pt-8">
          <p className="text-base text-muted-foreground whitespace-pre-line leading-relaxed">
            <span className="font-semibold text-[#FFFF00]">Roteiro: </span>
            {script}
          </p>
        </div>

        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            className="gradient-primary text-primary-foreground shadow-glow gap-2"
            onClick={handleDownload}
          >
            <Download className="h-3.5 w-3.5" />
            Baixar Vídeo
          </Button>
        </div>
      </div>
    </div>
  );
});

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
        <h1 className="text-3xl font-display font-bold tracking-tight">Buscar e Divulgar</h1>
        <p className="text-muted-foreground mt-2">
          Encontre os melhores grupos, copie mensagens prontas e baixe vídeos para divulgar seus e-books.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 1. Buscar Grupos por Nicho */}
        <div className="p-6 rounded-lg border border-border bg-card/40 shadow-gold">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-1 text-[#FFFF00]">
            <Users className="h-5 w-5 text-primary" />
            Buscar grupos por nicho
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Encontre os melhores grupos no Facebook para divulgar seu Ebook.
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

        {/* 2. Mensagens Prontas para Divulgação */}
        <div className="p-6 rounded-lg border border-border bg-card/40 shadow-gold space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-1 text-[#FFFF00]">
              <Quote className="h-5 w-5 text-primary" />
              Mensagens prontas para Divulgação
            </h3>
            <p className="text-sm text-muted-foreground">
              Use estas opções de mensagens persuasivas para divulgar nos grupos:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {divulgacaoMensagens.map((item) => (
              <div
                key={item.id}
                className="relative rounded-xl border border-border/80 bg-background/50 p-4 pb-14 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                    {item.title}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed">
                  {item.text}
                </pre>
                <Button
                  size="sm"
                  className="absolute bottom-3 right-3 gradient-primary text-primary-foreground shadow-sm gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(item.text);
                    toast.success(`${item.title} copiada!`);
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copiar Mensagem
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Vídeos Prontos para Divulgação */}
        <div className="p-6 rounded-lg border border-border bg-card/40 shadow-gold">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-1 text-[#FFFF00]">
            <Video className="h-5 w-5 text-primary" />
            Vídeos prontos para divulgação
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Use estes vídeos persuasivos para gerar interesse nos grupos:
          </p>
          <div className="flex flex-col gap-4">
            {[
              {
                title: "Vídeo 1",
                src: "/videos/video-divulgacao-1.mp4",
                filename: "video-divulgacao-1.mp4",
                script:
                  "Comprei esse ebook sem muita expectativa, mas me surpreendi. O conteúdo é direto, fácil de aplicar e realmente valeu cada centavo.",
              },
              {
                title: "Vídeo 2",
                src: "/videos/video-divulgacao-2.mp4",
                filename: "video-divulgacao-2.mp4",
                script:
                  "Sinceramente, esse ebook superou minhas expectativas. Aprendi coisas que consegui colocar em prática na hora e já vi resultados.",
              },
            ].map((v, i) => (
              <DivulgacaoVideoCard key={i} {...v} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
