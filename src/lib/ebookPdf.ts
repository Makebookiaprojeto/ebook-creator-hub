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

// Premium palette: white bg, black text, green accent
const COLORS = {
  ink: [17, 17, 17] as const,
  muted: [60, 60, 65] as const,
  accent: [22, 145, 80] as const, // green (hsl ~150 75% 33%)
  soft: [245, 247, 248] as const,
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

function fmtOf(dataUrl: string): "JPEG" | "PNG" {
  return dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg") ? "JPEG" : "PNG";
}

// Draw image cover-style cropped into target rectangle (fills, no distortion)
function drawCover(doc: jsPDF, img: { dataUrl: string; w: number; h: number }, x: number, y: number, w: number, h: number) {
  const target = w / h;
  const source = img.w / img.h;
  let dw = w;
  let dh = h;
  let dx = x;
  let dy = y;
  if (source > target) {
    // image is wider — extend width
    dh = h;
    dw = h * source;
    dx = x - (dw - w) / 2;
  } else {
    dw = w;
    dh = w / source;
    dy = y - (dh - h) / 2;
  }
  // Clip via rectangle save/restore not available in jsPDF, so we draw a white mask after.
  doc.addImage(img.dataUrl, fmtOf(img.dataUrl), dx, dy, dw, dh, undefined, "FAST");
}

export async function generateEbookPdf(ebook: PdfEbook): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth(); // 210
  const pageH = doc.internal.pageSize.getHeight(); // 297
  const margin = 18;
  const contentW = pageW - margin * 2;

  // ---------- COVER ----------
  doc.setFillColor(...COLORS.white);
  doc.rect(0, 0, pageW, pageH, "F");

  // Top turquoise band
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, pageW, 6, "F");

  if (ebook.cover_url) {
    const img = await urlToDataUrl(ebook.cover_url);
    if (img) {
      const imgY = 22;
      const imgH = pageH * 0.5;
      const imgW = contentW;
      // crop via mask: draw image, then cover edges with white rects
      doc.addImage(img.dataUrl, fmtOf(img.dataUrl), margin, imgY, imgW, imgH, undefined, "FAST");
      // accent underline
      doc.setFillColor(...COLORS.accent);
      doc.rect(margin, imgY + imgH, 40, 1.4, "F");
    }
  }

  // Title block
  const titleY = pageH * 0.5 + 40;
  doc.setTextColor(...COLORS.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  const titleLines = doc.splitTextToSize(ebook.title, contentW);
  doc.text(titleLines, margin, titleY);

  let cy = titleY + titleLines.length * 11 + 4;
  if (ebook.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.muted);
    const subLines = doc.splitTextToSize(ebook.subtitle, contentW);
    doc.text(subLines, margin, cy);
    cy += subLines.length * 6 + 4;
  }

  if (ebook.author) {
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.accent);
    doc.setFont("helvetica", "bold");
    doc.text(`POR ${ebook.author.toUpperCase()}`, margin, pageH - 18);
  }

  // (No table of contents — go straight to chapters)


  // ---------- CHAPTERS ----------
  for (let i = 0; i < ebook.chapters.length; i++) {
    const ch = ebook.chapters[i];
    doc.addPage();
    doc.setFillColor(...COLORS.white);
    doc.rect(0, 0, pageW, pageH, "F");

    // LEFT image column (covers full height)
    const imgColW = pageW * 0.42;
    if (ch.image_url) {
      const img = await urlToDataUrl(ch.image_url);
      if (img) {
        drawCover(doc, img, 0, 0, imgColW, pageH);
        // mask overflow on right edge
        doc.setFillColor(...COLORS.white);
        doc.rect(imgColW, 0, pageW - imgColW, pageH, "F");
      }
    }

    // RIGHT text column
    const tx = imgColW + 10;
    const tw = pageW - tx - margin;
    let y = margin + 4;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.accent);
    doc.text(`CAPÍTULO ${String(i + 1).padStart(2, "0")}`, tx, y);
    y += 6;

    // accent rule
    doc.setFillColor(...COLORS.accent);
    doc.rect(tx, y, 18, 1, "F");
    y += 8;

    doc.setTextColor(...COLORS.ink);
    doc.setFontSize(22);
    const titleLs = doc.splitTextToSize(ch.title, tw);
    doc.text(titleLs, tx, y);
    y += titleLs.length * 9 + 2;

    if (ch.subtitle) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.muted);
      const subLs = doc.splitTextToSize(ch.subtitle, tw);
      doc.text(subLs, tx, y);
      y += subLs.length * 5 + 3;
    }
    y += 4;

    // Content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...COLORS.ink);

    const ensureSpace = (needed: number) => {
      if (y + needed > pageH - margin) {
        doc.addPage();
        doc.setFillColor(...COLORS.white);
        doc.rect(0, 0, pageW, pageH, "F");
        y = margin;
      }
    };

    const paragraphs = ch.content.split(/\n\s*\n/);
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("## ")) {
        ensureSpace(12);
        y += 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...COLORS.accent);
        const hLs = doc.splitTextToSize(trimmed.replace(/^##\s+/, ""), tw);
        doc.text(hLs, tx, y);
        y += hLs.length * 6 + 3;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(...COLORS.ink);
        continue;
      }

      if (trimmed.split("\n").every((l) => /^\s*[-•]\s+/.test(l))) {
        const items = trimmed.split("\n").map((l) => l.replace(/^\s*[-•]\s+/, ""));
        for (const item of items) {
          const lines = doc.splitTextToSize(item, tw - 5);
          ensureSpace(lines.length * 5.5 + 1);
          doc.setTextColor(...COLORS.accent);
          doc.text("•", tx, y);
          doc.setTextColor(...COLORS.ink);
          doc.text(lines, tx + 4, y);
          y += lines.length * 5.5 + 1;
        }
        y += 2;
        continue;
      }

      const lines = doc.splitTextToSize(trimmed, tw);
      ensureSpace(lines.length * 5.5);
      doc.text(lines, tx, y, { lineHeightFactor: 1.55 });
      y += lines.length * 5.5 + 4;
    }
  }

  // Page numbers (skip cover)
  const pages = doc.getNumberOfPages();
  for (let p = 2; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.text(`${p - 1}`, pageW - margin, pageH - 8, { align: "right" });
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
