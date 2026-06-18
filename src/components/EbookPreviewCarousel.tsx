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
  // Take first 3 paragraphs to fill the medium area
  const blocks = content.split(/\n\s*\n/).filter(b => b.trim().length > 0);
  const previewBlocks = blocks.slice(0, 3); // Reduced from 4 to 3 blocks
  
  return (
    <div className="space-y-4">
      {previewBlocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <h4 key={i} className="font-display text-lg font-bold mt-4 mb-2 text-primary">
              {trimmed.replace(/^##\s+/, "")}
            </h4>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-muted-foreground">
            {trimmed}
          </p>
        );
      })}
      {blocks.length > 3 && (
        <div className="pt-4 border-t border-dashed border-border">
          <p className="text-xs italic text-muted-foreground/60">Continua no ebook completo...</p>
        </div>
      )}
    </div>
  );
}

export function EbookPreviewCarousel({ title, subtitle, coverUrl, chapters }: Props) {
  const [currentPage, setCurrentPage] = useState(0);

  const displayedChapters = chapters.slice(0, 6);
  const totalPages = 1 + displayedChapters.length;

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 0));

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    const newPage = page + newDirection;
    if (newPage >= 0 && newPage < totalPages) {
      setPage([newPage, newDirection]);
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-12">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-xl min-h-[600px] sm:min-h-[700px] flex flex-col relative">
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
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0 w-full h-full p-6 sm:p-10"
            >
              {page === 0 && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/80 to-primary relative mb-4">
                    {coverUrl ? (
                      <img 
                        src={coverUrl} 
                        alt={title} 
                        className="absolute inset-0 h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-24 w-24 text-primary-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-6 pt-20">
                      <h2 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight">{title}</h2>
                      {subtitle && <p className="mt-2 text-sm sm:text-lg text-white/90">{subtitle}</p>}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-widest">Capa do Ebook</p>
                  </div>
                </div>
              )}

              {page >= 1 && (
                <div className="h-full flex flex-col">
                  <div className="mb-5 shrink-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Capítulo {page}</p>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                      {displayedChapters[page - 1]?.title}
                    </h3>
                    {displayedChapters[page - 1]?.subtitle && (
                      <p className="mt-2 text-sm sm:text-base font-medium text-muted-foreground italic">
                        {displayedChapters[page - 1]?.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-6 min-h-0">
                    {displayedChapters[page - 1]?.image_url && (
                      <div className="sm:col-span-2 rounded-xl overflow-hidden shadow-md bg-background flex items-center justify-center max-h-[260px] sm:max-h-none">
                        <img
                          src={displayedChapters[page - 1].image_url}
                          alt={displayedChapters[page - 1].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className={`${displayedChapters[page - 1]?.image_url ? "sm:col-span-3" : "sm:col-span-5"} overflow-y-auto pr-2 custom-scrollbar`}>
                      <div className="prose prose-invert max-w-none">
                        {renderPartialContent(displayedChapters[page - 1]?.content || "_(gerando…)_")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation Dots Only */}
        <div className="p-4 border-t flex items-center justify-center bg-card">
          <div className="flex gap-1.5 px-4 overflow-x-auto no-scrollbar">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage([i, i > page ? 1 : -1])}
                className={`h-1.5 rounded-full transition-all duration-300 shrink-0 ${
                  i === page ? "w-6 bg-primary" : "w-1.5 bg-muted hover:bg-muted-foreground/30"
                }`}
                aria-label={`Ir para página ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Side Navigation Arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 sm:-left-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => paginate(-1)}
          disabled={page === 0}
          className="rounded-full h-10 w-10 sm:h-12 sm:w-12 border-border bg-card shadow-lg text-muted-foreground hover:bg-secondary hover:text-primary disabled:opacity-30 transition-all"
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
          className="rounded-full h-10 w-10 sm:h-12 sm:w-12 border-border bg-card shadow-lg text-muted-foreground hover:bg-secondary hover:text-primary disabled:opacity-30 transition-all"
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
