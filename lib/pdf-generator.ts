import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface Chapter {
  title: string;
  content: string;
}

export const generateEbookPDF = async (title: string, subtitle: string | null, chapters: Chapter[], ebookId: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let y = 40;

  // Title Page
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
  y += (titleLines.length * 12);

  if (subtitle) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    const subtitleLines = doc.splitTextToSize(subtitle, contentWidth);
    doc.text(subtitleLines, pageWidth / 2, y, { align: 'center' });
    y += (subtitleLines.length * 8);
  }

  // Chapters
  chapters.forEach((chapter, index) => {
    doc.addPage();
    y = 30;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(150);
    doc.text(`Capítulo ${index + 1}`, margin, y);
    y += 10;

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    const chapterTitleLines = doc.splitTextToSize(chapter.title, contentWidth);
    doc.text(chapterTitleLines, margin, y);
    y += (chapterTitleLines.length * 10) + 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Simple markdown-ish processing for the PDF
    const cleanContent = chapter.content
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*/g, '');    // Remove bold
    
    const lines = doc.splitTextToSize(cleanContent, contentWidth);
    
    lines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 30;
      }
      doc.text(line, margin, y);
      y += 7;
    });
  });

  const pdfBlob = doc.output('blob');
  const fileName = `${ebookId}/${Date.now()}-${title.replace(/\s+/g, '_')}.pdf`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('ebook-files')
    .upload(fileName, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('ebook-files')
    .getPublicUrl(fileName);

  // Update ebook with the new pdf_url
  const { error: updateError } = await supabase
    .from('ebooks')
    .update({ pdf_url: publicUrl })
    .eq('id', ebookId);

  if (updateError) throw updateError;

  return publicUrl;
};
