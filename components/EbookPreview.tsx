import { BookOpen } from "lucide-react";
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
  pdfUrl?: string | null;
};

function renderContent(content: string) {
  const blocks = content.split(/\n\s*\n/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) {
      return (
        <h3 key={i} className="ebook-paper-accent font-display text-xl font-bold mt-8 mb-4">
          {trimmed.replace(/^##\s+/, "")}
        </h3>
      );
    }
    if (trimmed.split("\n").every((l) => /^\s*[-•]\s+/.test(l))) {
      const items = trimmed.split("\n").map((l) => l.replace(/^\s*[-•]\s+/, ""));
      return (
        <ul key={i} className="ebook-paper-muted my-4 ml-6 list-disc space-y-2 text-base leading-relaxed">
          {items.map((it, j) => <li key={j}>{it}</li>)}
        </ul>
      );
    }
    return (
      <p key={i} className="ebook-paper-muted text-base leading-relaxed mb-4">
        {trimmed}
      </p>
    );
  });
}

export function EbookPreview({ title, subtitle, coverUrl, chapters, pdfUrl, showOnlyFirstChapter = false }: Props & { showOnlyFirstChapter?: boolean }) {
  const displayedChapters = showOnlyFirstChapter ? chapters.slice(0, 1) : chapters;

  return (
    <div className="ebook-preview-shell rounded-2xl border p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Cover page */}
        <div className="ebook-paper aspect-[2/3] rounded-xl overflow-hidden relative">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-24 w-24 text-primary/40" />
            </div>
          )}
          <div className="ebook-cover-gradient absolute inset-x-0 bottom-0 p-6 pt-20">
            <div className="ebook-paper-accent-bg mb-4 h-1.5 w-16 rounded-full" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-primary-foreground">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-primary-foreground/80">{subtitle}</p>}
          </div>
        </div>

        {/* Title page (no TOC) */}
        <div className="ebook-paper rounded-xl border p-8 text-center">
          <p className="ebook-paper-accent text-xs font-bold uppercase tracking-widest">Ebook</p>
          <h3 className="mt-3 font-display text-3xl font-bold leading-tight">{title}</h3>
          {subtitle && <p className="ebook-paper-muted mt-3 text-base">{subtitle}</p>}
          <div className="ebook-paper-accent-bg mx-auto mt-5 h-1 w-16 rounded-full" />
        </div>

        {/* Chapters */}
        {displayedChapters.map((c, i) => (
          <article key={i} className="ebook-paper rounded-xl border p-6 sm:p-8 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8">
              {c.image_url && (
                <div className="w-full md:w-[42%] shrink-0">
                  <img
                    src={c.image_url}
                    alt={c.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full min-h-72 w-full rounded-lg object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                <p className="ebook-paper-accent text-xs font-bold uppercase tracking-widest">Capítulo {i + 1}</p>
                <h3 className="mt-2 font-display text-3xl font-bold leading-tight">{c.title}</h3>
                {c.subtitle && <p className="ebook-paper-muted mt-2 text-md font-medium italic">{c.subtitle}</p>}
                <div className="ebook-paper-accent-bg mt-5 h-1 w-14 rounded-full" />
                
                <div className="mt-6 max-w-none">
                  {renderContent(c.content || "_(gerando…)_")}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
