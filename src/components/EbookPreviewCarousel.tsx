import { useState, useEffect, useMemo, useCallback, memo } from "react";
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

const ACCENT = "hsl(150 75% 32%)";
const ACCENT_BG = "hsl(150 75% 35%)";

type Block =
  | { type: "h"; text: string }
  | { type: "ul"; items: { check: boolean; text: string }[] }
  | { type: "p"; text: string };

function optimizePexels(url: string | null | undefined, w: number): string | null | undefined {
  if (!url) return url;
  try {
    if (!/images\.pexels\.com/i.test(url)) return url;
    const u = new URL(url);
    u.searchParams.set("auto", "compress");
    u.searchParams.set("cs", "tinysrgb");
    u.searchParams.set("w", String(w));
    // dpr=1 keeps payload small; the visual sizes are modest so this is enough
    u.searchParams.set("dpr", "1");
    return u.toString();
  } catch {
    return url;
  }
}

function parseContent(content: string): Block[] {
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim().length > 0);
  return blocks.map<Block>((block) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return { type: "h", text: trimmed.replace(/^##\s+/, "") };
    }
    const lines = trimmed.split("\n");
    if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
      return {
        type: "ul",
        items: lines.map((l) => {
          const raw = l.replace(/^\s*[-•]\s+/, "");
          const check = /^✓\s+/.test(raw);
          return { check, text: raw.replace(/^✓\s+/, "") };
        }),
      };
    }
    return { type: "p", text: trimmed };
  });
}

const RenderedContent = memo(function RenderedContent({ content }: { content: string }) {
  const blocks = useMemo(() => parseContent(content), [content]);
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        if (b.type === "h") {
          return (
            <h4
              key={i}
              className="font-display text-base sm:text-lg font-bold mt-3 mb-1"
              style={{ color: ACCENT }}
            >
              {b.text}
            </h4>
          );
        }
        if (b.type === "ul") {
          return (
            <ul
              key={i}
              className="my-1 ml-1 space-y-1.5 text-[14px] sm:text-[15px] leading-relaxed"
              style={{ color: "hsl(0 0% 12%)" }}
            >
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-2">
                  <span className="shrink-0 font-bold" style={{ color: ACCENT }}>
                    {it.check ? "✓" : "•"}
                  </span>
                  <span>{it.text}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p
            key={i}
            className="text-[14px] sm:text-[15px] leading-relaxed"
            style={{ color: "hsl(0 0% 12%)" }}
          >
            {b.text}
          </p>
        );
      })}
    </div>
  );
});

const CoverPage = memo(function CoverPage({
  title,
  subtitle,
  coverUrl,
}: {
  title: string;
  subtitle?: string;
  coverUrl?: string | null;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 rounded-xl overflow-hidden shadow-2xl relative mb-4" style={{ background: ACCENT_BG }}>
        {coverUrl ? (
          <img
            src={optimizePexels(coverUrl, 800) ?? coverUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
            loading="eager"
            fetchPriority="high"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-24 w-24 text-white/40" />
          </div>
        )}
        <div
          className="absolute inset-x-0 bottom-0 p-6 pt-24"
          style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.78) 100%)" }}
        >
          <div className="h-1.5 w-16 rounded-full mb-4" style={{ background: ACCENT_BG }} />
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
  );
});

export function EbookPreviewCarousel({ title, subtitle, coverUrl, chapters }: Props) {
  const displayedChapters = useMemo(() => chapters.slice(0, 5), [chapters]);
  const totalPages = 1 + displayedChapters.length;

  const [page, setPage] = useState(0);

  // Preload images into the browser cache. We key the effect on the URL list
  // (not the array reference) so re-renders of the parent don't restart the
  // preload, and we do NOT clear img.src on cleanup — that was cancelling
  // in-flight requests and causing images to "not load" or reload on nav.
  const preloadKey = useMemo(() => {
    const urls = [optimizePexels(coverUrl, 1200), ...displayedChapters.map((c) => optimizePexels(c.image_url, 600))];
    return urls.filter(Boolean).join("|");
  }, [coverUrl, displayedChapters]);

  useEffect(() => {
    if (!preloadKey) return;
    const urls = preloadKey.split("|");
    urls.forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      img.decode?.().catch(() => {});
    });
  }, [preloadKey]);

  const paginate = useCallback(
    (newDirection: number) => {
      setPage((p) => {
        const np = p + newDirection;
        if (np < 0 || np >= totalPages) return p;
        return np;
      });
    },
    [totalPages],
  );

  const goTo = useCallback((i: number) => setPage(i), []);


  return (
    <div className="relative w-full max-w-4xl mx-auto px-3 sm:px-10">
      <div
        className="overflow-hidden rounded-2xl border shadow-2xl min-h-[560px] sm:min-h-[640px] flex flex-col relative"
        style={{
          background: "hsl(0 0% 100%)",
          borderColor: "hsl(150 70% 38% / 0.28)",
          boxShadow: "0 30px 80px -30px hsl(150 70% 38% / 0.45)",
          contain: "layout paint",
        }}
      >
        <div className="flex-1 relative overflow-hidden">
          {Array.from({ length: totalPages }).map((_, i) => {
            const active = i === page;
            return (
              <div
                key={i}
                aria-hidden={!active}
                className="absolute inset-0 w-full h-full p-5 sm:p-8 transition-opacity duration-150 ease-out"
                style={{
                  opacity: active ? 1 : 0,
                  pointerEvents: active ? "auto" : "none",
                  zIndex: active ? 1 : 0,
                }}
              >
                {i === 0 ? (
                  <CoverPage title={title} subtitle={subtitle} coverUrl={coverUrl} />
                ) : (
                  <ChapterPage index={i} chapter={displayedChapters[i - 1]} />
                )}
              </div>
            );
          })}
        </div>


        <div className="p-4 border-t flex items-center justify-center" style={{ background: "hsl(0 0% 100%)", borderColor: "hsl(0 0% 90%)" }}>
          <div className="flex gap-1.5 px-4 overflow-x-auto no-scrollbar">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="h-1.5 rounded-full transition-all duration-200 shrink-0"
                style={{
                  width: i === page ? "1.5rem" : "0.375rem",
                  background: i === page ? ACCENT_BG : "hsl(0 0% 82%)",
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

const ChapterPage = memo(function ChapterPage({
  index,
  chapter,
}: {
  index: number;
  chapter: Chapter;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 shrink-0">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: ACCENT }}>
          Capítulo {index}
        </p>
        <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight" style={{ color: "hsl(0 0% 7%)" }}>
          {chapter?.title}
        </h3>
        {chapter?.subtitle && (
          <p className="mt-1.5 text-xs sm:text-sm font-medium italic" style={{ color: "hsl(0 0% 30%)" }}>
            {chapter.subtitle}
          </p>
        )}
        <div className="mt-3 h-1 w-12 rounded-full" style={{ background: ACCENT_BG }} />
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-4 min-h-0">
        {chapter?.image_url && (
          <div className="sm:col-span-5 rounded-xl overflow-hidden shadow-md max-h-[240px] sm:max-h-none" style={{ background: "hsl(0 0% 96%)" }}>
            <img
              src={optimizePexels(chapter.image_url, 600) ?? chapter.image_url}
              alt={chapter.title}
              className="w-full h-full object-cover"
              decoding="async"
              loading="eager"
            />

          </div>
        )}
        <div className={`${chapter?.image_url ? "sm:col-span-7" : "sm:col-span-12"} overflow-y-auto pr-2 custom-scrollbar`}>
          <RenderedContent content={chapter?.content || "(gerando…)"} />
        </div>
      </div>
    </div>
  );
});
