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
        <h3 key={i} className="font-display text-lg font-bold mt-5 mb-2 text-foreground">
          {trimmed.replace(/^##\s+/, "")}
        </h3>
      );
    }
    if (trimmed.split("\n").every((l) => /^\s*[-•]\s+/.test(l))) {
      const items = trimmed.split("\n").map((l) => l.replace(/^\s*[-•]\s+/, ""));
      return (
        <ul key={i} className="my-3 ml-5 list-disc space-y-1.5 text-sm leading-relaxed">
          {items.map((it, j) => <li key={j}>{it}</li>)}
        </ul>
      );
    }
    return (
      <p key={i} className="text-sm leading-relaxed text-foreground/90 mb-3">
        {trimmed}
      </p>
    );
  });
}

export function EbookPreview({ title, subtitle, coverUrl, chapters, pdfUrl }: Props) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Cover page */}
        <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/80 to-primary relative">
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

        {/* TOC */}
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
        {chapters.map((c, i) => (
          <article key={i} className="rounded-xl bg-card border p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Capítulo {i + 1}</p>
            <h3 className="mt-1 font-display text-2xl font-bold leading-tight">{c.title}</h3>
            {c.subtitle && <p className="mt-1 text-sm italic text-muted-foreground">{c.subtitle}</p>}
            {c.image_url && (
              <img
                src={c.image_url}
                alt={c.title}
                className="mt-4 w-full h-48 object-cover rounded-lg"
              />
            )}
            <div className="mt-4">{renderContent(c.content || "_(gerando…)_")}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
