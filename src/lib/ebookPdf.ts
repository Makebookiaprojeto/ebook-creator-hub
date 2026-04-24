import { jsPDF } from "jspdf";

export type PdfChapter = {
  title: string;
  subtitle?: string | null;
  content: string;
  image_url?: string | null;
};

export type PdfEbook = {
  title: string;
  subtitle?: string | null;
  cover_url?: string | null;
  author?: string;
  chapters: PdfChapter[];
};

// Brand HSL → RGB (matches index.css design tokens loosely)
const COLORS = {
  ink: [24, 24, 27] as const,
  muted: [113, 113, 122] as const,
  primary: [139, 92, 246] as const,
  accent: [245, 245, 250] as const,
  white: [255, 255, 255] as const,
};

async function urlToDataUrl(url: string): Promise<{ dataUrl: string; w: number; h: number } | null> {
  try {
    const resp = await fetch(url, { mode: "cors" });
    if (!resp.ok) return null;
    const blob = await resp.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    });
    return { dataUrl, ...dims };
  } catch (e) {
    console.warn("Failed to fetch image for PDF:", url, e);
    return null;
  }
}

export async function generateEbookPdf(ebook: PdfEbook): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth(); // 210
  const pageH = doc.internal.pageSize.getHeight(); // 297
  const margin = 20;
  const contentW = pageW - margin * 2;

  // ---------- COVER ----------
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageW, pageH, "F");

  if (ebook.cover_url) {
    const img = await urlToDataUrl(ebook.cover_url);
    if (img) {
      // fit image into top 60% of page, centered
      const maxW = pageW - 40;
      const maxH = pageH * 0.55;
      const ratio = img.w / img.h;
      let w = maxW;
      let h = w / ratio;
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      const x = (pageW - w) / 2;
      const y = 25;
      const fmt = img.dataUrl.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
      doc.addImage(img.dataUrl, fmt, x, y, w, h, undefined, "FAST");
    }
  }

  // Title block
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(margin, pageH - 95, contentW, 75, 4, 4, "F");
  doc.setTextColor(...COLORS.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  const titleLines = doc.splitTextToSize(ebook.title, contentW - 16);
  doc.text(titleLines, pageW / 2, pageH - 75, { align: "center" });

  if (ebook.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.muted);
    const subLines = doc.splitTextToSize(ebook.subtitle, contentW - 24);
    doc.text(subLines, pageW / 2, pageH - 75 + titleLines.length * 9 + 4, { align: "center" });
  }

  if (ebook.author) {
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.muted);
    doc.text(`por ${ebook.author}`, pageW / 2, pageH - 28, { align: "center" });
  }

  // ---------- TABLE OF CONTENTS ----------
  doc.addPage();
  doc.setTextColor(...COLORS.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Sumário", margin, 30);
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(margin, 33, margin + 20, 33);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  let tocY = 50;
  ebook.chapters.forEach((c, i) => {
    if (tocY > pageH - margin) {
      doc.addPage();
      tocY = 30;
    }
    doc.setTextColor(...COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text(String(i + 1).padStart(2, "0"), margin, tocY);
    doc.setTextColor(...COLORS.ink);
    doc.setFont("helvetica", "normal");
    const title = doc.splitTextToSize(c.title, contentW - 18)[0];
    doc.text(title, margin + 12, tocY);
    tocY += 9;
  });

  // ---------- CHAPTERS ----------
  for (let i = 0; i < ebook.chapters.length; i++) {
    const ch = ebook.chapters[i];
    doc.addPage();
    let y = margin;

    // Chapter header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.primary);
    doc.text(`CAPÍTULO ${i + 1}`, margin, y);
    y += 8;

    doc.setTextColor(...COLORS.ink);
    doc.setFontSize(22);
    const titleLs = doc.splitTextToSize(ch.title, contentW);
    doc.text(titleLs, margin, y);
    y += titleLs.length * 9 + 2;

    if (ch.subtitle) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.muted);
      const subLs = doc.splitTextToSize(ch.subtitle, contentW);
      doc.text(subLs, margin, y);
      y += subLs.length * 6 + 2;
    }
    y += 4;

    // Chapter image
    if (ch.image_url) {
      const img = await urlToDataUrl(ch.image_url);
      if (img) {
        const w = contentW;
        const h = Math.min((w * img.h) / img.w, 80);
        const fmt = img.dataUrl.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
        doc.addImage(img.dataUrl, fmt, margin, y, w, h, undefined, "FAST");
        y += h + 6;
      }
    }

    // Content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.ink);

    const paragraphs = ch.content.split(/\n\s*\n/);
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      // Subtítulo (## )
      if (trimmed.startsWith("## ")) {
        if (y > pageH - margin - 14) {
          doc.addPage();
          y = margin;
        }
        y += 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.ink);
        const hLs = doc.splitTextToSize(trimmed.replace(/^##\s+/, ""), contentW);
        doc.text(hLs, margin, y);
        y += hLs.length * 7 + 3;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        continue;
      }

      // Bullet list block
      if (trimmed.split("\n").every((l) => /^\s*[-•]\s+/.test(l))) {
        const items = trimmed.split("\n").map((l) => l.replace(/^\s*[-•]\s+/, ""));
        for (const item of items) {
          const lines = doc.splitTextToSize(item, contentW - 6);
          if (y + lines.length * 6 > pageH - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text("•", margin, y);
          doc.text(lines, margin + 5, y);
          y += lines.length * 6 + 1;
        }
        y += 2;
        continue;
      }

      const lines = doc.splitTextToSize(trimmed, contentW);
      if (y + lines.length * 6 > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines, margin, y, { lineHeightFactor: 1.45 });
      y += lines.length * 6 + 4;
    }
  }

  // Page numbers
  const pages = doc.getNumberOfPages();
  for (let p = 2; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.text(`${p - 1}`, pageW - margin, pageH - 10, { align: "right" });
  }

  return doc.output("blob");
}

export function downloadPdf(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
