import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "./ui/button";

type Chapter = {
  title: string;
  subtitle?: string | null;
  content: string;
  image_url?: string | null;
};

type Props = {
  title: string;
  subtitle?: string;
  coverUrl?: string | null;
  chapters: Chapter[];
};

function renderPartialContent(content: string) {
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim().length > 0);

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <h4
              key={i}
              className="font-display text-base sm:text-lg font-bold mt-3 mb-1"
              style={{ color: "hsl(150 75% 32%)" }}
            >
              {trimmed.replace(/^##\s+/, "")}
            </h4>
          );
        }
        if (trimmed.split("\n").every((l) => /^\s*[-•]\s+/.test(l))) {
          const items = trimmed.split("\n").map((l) => l.replace(/^\s*[-•]\s+/, ""));
          return (
            <ul
              key={i}
              className="my-1 ml-1 space-y-1.5 text-[14px] sm:text-[15px] leading-relaxed"
              style={{ color: "hsl(0 0% 12%)" }}
            >
              {items.map((it, j) => {
                const isCheck = /^✓\s+/.test(it);
                const text = it.replace(/^✓\s+/, "");
                return (
                  <li key={j} className="flex gap-2">
                    <span className="shrink-0 font-bold" style={{ color: "hsl(150 75% 32%)" }}>
                      {isCheck ? "✓" : "•"}
                    </span>
                    <span>{text}</span>
                  </li>
                );
              })}
            </ul>
          );
        }
        return (
          <p
            key={i}
            className="text-[14px] sm:text-[15px] leading-relaxed"
            style={{ color: "hsl(0 0% 12%)" }}
          >
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export function EbookPreviewCarousel({ title, subtitle, coverUrl, chapters }: Props) {
  const displayedChapters = chapters.slice(0, 5);
  const totalPages = 1 + displayedChapters.length;

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 300 : -300, opacity: 0 }),
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    const newPage = page + newDirection;
    if (newPage >= 0 && newPage < totalPages) {
      setPage([newPage, newDirection]);
    }
  };

  const accent = "hsl(150 75% 32%)";
  const accentBg = "hsl(150 75% 35%)";

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 sm:px-12">
      <div
        className="overflow-hidden rounded-2xl border shadow-2xl min-h-[560px] sm:min-h-[640px] flex flex-col relative"
        style={{
          background: "hsl(0 0% 100%)",
          borderColor: "hsl(150 70% 38% / 0.28)",
          boxShadow: "0 30px 80px -30px hsl(150 70% 38% / 0.45)",
        }}
      >
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 w-full h-full p-5 sm:p-8"
            >
              {page === 0 && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 rounded-xl overflow-hidden shadow-2xl relative mb-4" style={{ background: accentBg }}>
                    {coverUrl ? (
                      <img src={coverUrl} alt={title} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-24 w-24 text-white/40" />
                      </div>
                    )}
                    <div
                      className="absolute inset-x-0 bottom-0 p-6 pt-24"
                      style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.78) 100%)" }}
                    >
                      <div className="h-1.5 w-16 rounded-full mb-4" style={{ background: accentBg }} />
                      <h2 className="font-display text-xl sm:text-3xl font-bold text-white leading-tight">{title}</h2>
                      {subtitle && <p className="mt-2 text-xs sm:text-base text-white/90">{subtitle}</p>}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "hsl(0 0% 45%)" }}>
                      Capa do Ebook
                    </p>
                  </div>
                </div>
              )}

              {page >= 1 && (
                <div className="h-full flex flex-col">
                  <div className="mb-4 shrink-0">
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: accent }}>
                      Capítulo {page}
                    </p>
                    <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight" style={{ color: "hsl(0 0% 7%)" }}>
                      {displayedChapters[page - 1]?.title}
                    </h3>
                    {displayedChapters[page - 1]?.subtitle && (
                      <p className="mt-1.5 text-xs sm:text-sm font-medium italic" style={{ color: "hsl(0 0% 30%)" }}>
                        {displayedChapters[page - 1]?.subtitle}
                      </p>
                    )}
                    <div className="mt-3 h-1 w-12 rounded-full" style={{ background: accentBg }} />
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-4 min-h-0">
                    {displayedChapters[page - 1]?.image_url && (
                      <div className="sm:col-span-2 rounded-xl overflow-hidden shadow-md max-h-[220px] sm:max-h-none" style={{ background: "hsl(0 0% 96%)" }}>
                        <img
                          src={displayedChapters[page - 1].image_url}
                          alt={displayedChapters[page - 1].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div
                      className={`${displayedChapters[page - 1]?.image_url ? "sm:col-span-3" : "sm:col-span-5"} overflow-y-auto pr-2 custom-scrollbar`}
                    >
                      {renderPartialContent(displayedChapters[page - 1]?.content || "(gerando…)")}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-4 border-t flex items-center justify-center" style={{ background: "hsl(0 0% 100%)", borderColor: "hsl(0 0% 90%)" }}>
          <div className="flex gap-1.5 px-4 overflow-x-auto no-scrollbar">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage([i, i > page ? 1 : -1])}
                className="h-1.5 rounded-full transition-all duration-300 shrink-0"
                style={{
                  width: i === page ? "1.5rem" : "0.375rem",
                  background: i === page ? accentBg : "hsl(0 0% 82%)",
                }}
                aria-label={`Ir para página ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-0 sm:-left-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => paginate(-1)}
          disabled={page === 0}
          className="rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-card shadow-lg disabled:opacity-30"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
        </Button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-0 sm:-right-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => paginate(1)}
          disabled={page === totalPages - 1}
          className="rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-card shadow-lg disabled:opacity-30"
          aria-label="Próxima página"
        >
          <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
        </Button>
      </div>

      <p className="text-center mt-4 text-xs text-muted-foreground font-medium uppercase tracking-widest">
        Página {page + 1} de {totalPages} • Use as setas para navegar
      </p>
    </div>
  );
}
