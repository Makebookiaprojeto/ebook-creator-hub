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
  // Take first 4-5 paragraphs or more blocks to fill the larger area
  const blocks = content.split(/\n\s*\n/).filter(b => b.trim().length > 0);
  const previewBlocks = blocks.slice(0, 4); // Increased from 2 to 4 blocks
  
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
          <p key={i} className="text-sm sm:text-base leading-relaxed text-slate-700">
            {trimmed}
          </p>
        );
      })}
      {blocks.length > 4 && (
        <div className="pt-4 border-t border-dashed border-slate-200">
          <p className="text-xs italic text-slate-400">Continua no ebook completo...</p>
        </div>
      )}
    </div>
  );
}

export function EbookPreviewCarousel({ title, subtitle, coverUrl, chapters }: Props) {
  const [currentPage, setCurrentPage] = useState(0);

  const displayedChapters = chapters.slice(0, 6);
  const totalPages = 2 + displayedChapters.length;

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
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="overflow-hidden rounded-2xl border bg-white shadow-xl min-h-[750px] sm:min-h-[850px] flex flex-col relative">
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
                  <div className="flex-1 rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/80 to-primary relative mb-6">
                    {coverUrl ? (
                      <img src={coverUrl} alt={title} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-24 w-24 text-primary-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-6 pt-20">
                      <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">{title}</h2>
                      {subtitle && <p className="mt-4 text-base sm:text-lg text-white/90">{subtitle}</p>}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Capa do Ebook</p>
                  </div>
                </div>
              )}

              {page === 1 && (
                <div className="h-full flex flex-col">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 border-b pb-4 mb-6">Sumário</h3>
                  <div className="flex-1">
                    <ol className="space-y-5">
                      {chapters.map((c, i) => (
                        <li key={i} className="flex items-center gap-4 text-slate-700">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="font-medium text-lg truncate">{c.title}</span>
                          <div className="flex-1 border-b border-dotted border-slate-300 mx-2" />
                          <span className="text-slate-400 text-sm">pág. {i + 3}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {page >= 2 && (
                <div className="h-full flex flex-col overflow-y-auto pr-2 custom-scrollbar">
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Capítulo {page - 1}</p>
                    <h3 className="font-display text-2xl font-bold text-slate-900 leading-tight">
                      {displayedChapters[page - 2]?.title}
                    </h3>
                    {displayedChapters[page - 2]?.subtitle && (
                      <p className="mt-2 text-sm font-medium text-slate-500 italic">
                        {displayedChapters[page - 2]?.subtitle}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    {displayedChapters[page - 2]?.image_url && (
                      <div className="mb-6 rounded-xl overflow-hidden shadow-md">
                        <img 
                          src={displayedChapters[page - 2].image_url} 
                          alt={displayedChapters[page - 2].title}
                          className="w-full aspect-video object-cover"
                        />
                      </div>
                    )}
                    <div className="prose prose-slate max-w-none">
                      {renderPartialContent(displayedChapters[page - 2]?.content || "_(gerando…)_")}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t flex items-center justify-between bg-white">
          <Button
            variant="outline"
            size="icon"
            onClick={() => paginate(-1)}
            disabled={page === 0}
            className="rounded-full h-10 w-10 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <div className="flex gap-1.5 px-4 overflow-x-auto no-scrollbar">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage([i, i > page ? 1 : -1])}
                className={`h-1.5 rounded-full transition-all duration-300 shrink-0 ${
                  i === page ? "w-6 bg-primary" : "w-1.5 bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => paginate(1)}
            disabled={page === totalPages - 1}
            className="rounded-full h-10 w-10 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-30 transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      <p className="text-center mt-4 text-xs text-muted-foreground font-medium uppercase tracking-widest">
        Página {page + 1} de {totalPages} • Use as setas para navegar
      </p>
    </div>
  );
}
