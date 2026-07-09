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
const COVER_PREVIEW_WIDTH = 800;
const CHAPTER_PREVIEW_WIDTH = 500;
const previewImageCache = new Map<string, Promise<boolean>>();
const decodedPreviewImages = new Map<string, HTMLImageElement>();
const failedPreviewImages = new Set<string>();

type Block =
  | { type: "h"; text: string }
  | { type: "ul"; items: { check: boolean; text: string }[] }
  | { type: "p"; text: string };

export function optimizePreviewImageUrl(url: string | null | undefined, w: number): string | null | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (/images\.pexels\.com/i.test(url)) {
      u.searchParams.set("auto", "compress");
      u.searchParams.set("cs", "tinysrgb");
      u.searchParams.set("w", String(w));
      u.searchParams.set("dpr", "1");
    } else if (u.pathname.includes("/storage/v1/object/public/") && /\.(jpe?g|png|webp)$/i.test(u.pathname)) {
      u.pathname = u.pathname.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
      u.searchParams.set("width", String(w));
      u.searchParams.set("quality", "72");
      u.searchParams.set("resize", "cover");
    } else {
      return url;
    }
    return u.toString();
  } catch {
    return url;
  }
}

function loadPreviewImage(src: string, priority: "high" | "auto" = "auto"): Promise<boolean> {
  if (failedPreviewImages.has(src)) return Promise.resolve(false);
  const cached = previewImageCache.get(src);
  if (cached) return cached;

  const promise = new Promise<boolean>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    (img as HTMLImageElement & { fetchPriority?: "high" | "auto" }).fetchPriority = priority;
    img.onload = () => {
      decodedPreviewImages.set(src, img);
      if (img.decode) {
        img.decode().then(
          () => resolve(true),
          () => resolve(true),
        );
        return;
      }
      resolve(true);
    };
    img.onerror = () => {
      decodedPreviewImages.delete(src);
      previewImageCache.delete(src);
      failedPreviewImages.add(src);
      resolve(false);
    };
    img.src = src;
  });

  previewImageCache.set(src, promise);
  return promise;
}

async function preloadPreviewUrl(url: string | null | undefined, width: number, priority: "high" | "auto") {
  if (!url) return;
  const optimizedUrl = optimizePreviewImageUrl(url, width) ?? url;
  const loaded = await loadPreviewImage(optimizedUrl, priority);
  if (!loaded && optimizedUrl !== url) {
    await loadPreviewImage(url, priority);
  }
}

export async function preloadEbookPreviewImages({
  coverUrl,
  chapters,
}: {
  coverUrl?: string | null;
  chapters: Chapter[];
}) {
  const displayedChapters = chapters.slice(0, 5);
  await preloadPreviewUrl(coverUrl, COVER_PREVIEW_WIDTH, "high");
  await Promise.all(
    displayedChapters.map((chapter) => preloadPreviewUrl(chapter.image_url, CHAPTER_PREVIEW_WIDTH, "auto")),
  );
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
    <div className="h-full rounded-xl overflow-hidden shadow-2xl relative" style={{ background: ACCENT_BG }}>
      {coverUrl ? (
        <>
          <PreviewImage
            src={coverUrl}
            width={COVER_PREVIEW_WIDTH}
            alt=""
            className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-60"
            fetchPriority="high"
          />
          <PreviewImage
            src={coverUrl}
            width={COVER_PREVIEW_WIDTH}
            alt={title}
            className="absolute inset-0 h-full w-full object-contain"
            fetchPriority="high"
          />
        </>
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
  );
});

export function EbookPreviewCarousel({ title, subtitle, coverUrl, chapters }: Props) {
  const displayedChapters = useMemo(() => chapters.slice(0, 5), [chapters]);
  const totalPages = 1 + displayedChapters.length;

  const [page, setPage] = useState(0);

  const preloadKey = useMemo(() => {
    const urls = [
      optimizePreviewImageUrl(coverUrl, COVER_PREVIEW_WIDTH),
      ...displayedChapters.map((c) => optimizePreviewImageUrl(c.image_url, CHAPTER_PREVIEW_WIDTH)),
    ];
    return urls.filter(Boolean).join("|");
  }, [coverUrl, displayedChapters]);

  useEffect(() => {
    if (!preloadKey) return;
    let cancelled = false;
    preloadEbookPreviewImages({ coverUrl, chapters: displayedChapters }).then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
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
                  visibility: active ? "visible" : "hidden",
                  zIndex: active ? 1 : 0,
                  willChange: "opacity",
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
          <div className="sm:col-span-5 rounded-xl overflow-hidden shadow-md h-56 sm:h-full relative" style={{ background: "hsl(0 0% 96%)" }}>
            <PreviewImage
              src={chapter.image_url}
              width={CHAPTER_PREVIEW_WIDTH}
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
            />
            <PreviewImage
              src={chapter.image_url}
              width={CHAPTER_PREVIEW_WIDTH}
              alt={chapter.title}
              className="absolute inset-0 w-full h-full object-contain"
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

const PreviewImage = memo(function PreviewImage({
  src,
  width,
  alt,
  className,
  fetchPriority = "auto",
}: {
  src: string;
  width: number;
  alt: string;
  className: string;
  fetchPriority?: "high" | "auto";
}) {
  const optimizedSrc = useMemo(() => optimizePreviewImageUrl(src, width) ?? src, [src, width]);
  const safeInitialSrc = failedPreviewImages.has(optimizedSrc) ? src : optimizedSrc;
  const [currentSrc, setCurrentSrc] = useState(safeInitialSrc);

  useEffect(() => {
    setCurrentSrc(failedPreviewImages.has(optimizedSrc) ? src : optimizedSrc);
  }, [optimizedSrc, src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      decoding="async"
      loading="eager"
      fetchPriority={fetchPriority}
      onError={() => {
        if (currentSrc !== src) setCurrentSrc(src);
      }}
      style={{ transform: "translateZ(0)" }}
    />
  );
});
