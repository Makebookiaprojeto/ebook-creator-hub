import { BookOpen, Download } from "lucide-react";
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
        <h3 key={i} className="font-display text-xl font-bold mt-8 mb-4 text-primary">
          {trimmed.replace(/^##\s+/, "")}
        </h3>
      );
    }
    if (trimmed.split("\n").every((l) => /^\s*[-•]\s+/.test(l))) {
      const items = trimmed.split("\n").map((l) => l.replace(/^\s*[-•]\s+/, ""));
      return (
        <ul key={i} className="my-4 ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground">
          {items.map((it, j) => <li key={j}>{it}</li>)}
        </ul>
      );
    }
    return (
      <p key={i} className="text-base leading-relaxed text-muted-foreground mb-4">
        {trimmed}
      </p>
    );
  });
}

export function EbookPreview({ title, subtitle, coverUrl, chapters, pdfUrl, showOnlyFirstChapter = false }: Props & { showOnlyFirstChapter?: boolean }) {
  const displayedChapters = showOnlyFirstChapter ? chapters.slice(0, 1) : chapters;

  return (
    <div className="rounded-2xl border bg-muted/20 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Cover page */}
        <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-background relative">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-24 w-24 text-primary-foreground/40" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-6 pt-20">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-white/80">{subtitle}</p>}
          </div>
        </div>

        {/* TOC - Always show all chapters in the table of contents */}
        <div className="rounded-xl bg-card border p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold">Sumário</h3>
          <div className="mt-1 h-0.5 w-12 bg-primary rounded-full" />
          <ol className="mt-4 space-y-2.5">
            {chapters.map((c, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="font-bold text-primary tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-medium">{c.title}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Chapters */}
        {displayedChapters.map((c, i) => (
          <article key={i} className="rounded-xl bg-card border p-8 sm:p-12 shadow-soft overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/80">Capítulo {i + 1}</p>
                <h3 className="mt-2 font-display text-3xl font-bold leading-tight text-foreground">{c.title}</h3>
                {c.subtitle && <p className="mt-2 text-md font-medium text-muted-foreground italic">{c.subtitle}</p>}
                
                <div className="mt-8 prose prose-invert max-w-none">
                  {renderContent(c.content || "_(gerando…)_")}
                </div>
              </div>
              
              {c.image_url && (
                <div className="w-full md:w-1/3 shrink-0">
                  <div className="sticky top-6">
                    <img
                      src={c.image_url}
                      alt={c.title}
                      className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg border-4 border-card"
                    />
                    <div className="mt-2 h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-1/3" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
