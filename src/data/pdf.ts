import { jsPDF } from "jspdf";
import type { Project, ProposalDraft, ContractorVisualization } from '../types';
import { formatEuro } from './projects';
import { estimateDisclaimer } from './proposals';
import { visualizationDisclaimer } from './visualization';

/**
 * Generate a professional A4 PDF from a proposal draft.
 * Returns the jsPDF instance so callers can save or open it.
 * No external services — fully client-side.
 */
export function generateProposalPDF(project: Project, draft: ProposalDraft, visualizations: ContractorVisualization[] = []): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  /* ---------- Letterhead ---------- */
  doc.setFillColor(15, 23, 42); // navy-900
  doc.roundedRect(margin, y, 10, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('R', margin + 5, y + 6.5, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.text('RenovAIte', margin + 13, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('AI Renovation Assistant', margin + 13, y + 9);

  // right side: date + project ref
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const dateStr = new Date(draft.updatedAt).toLocaleDateString('en-GB');
  doc.text(dateStr, pageW - margin, y + 4, { align: 'right' });
  doc.text(`${project.id} — ${project.city}`, pageW - margin, y + 8, { align: 'right' });

  y += 16;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  /* ---------- Title ---------- */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(draft.title, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Prepared for ${project.customerName} — ${project.address}`, margin, y);
  y += 8;

  /* ---------- Summary box ---------- */
  const boxH = 14;
  doc.setFillColor(248, 250, 252); // navy-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentW, boxH, 1.5, 1.5, 'FD');

  const colW = contentW / 3;
  const labels: [string, string][] = [
    ['Price range', `${formatEuro(draft.priceMin)} – ${formatEuro(draft.priceMax)}`],
    ['Duration', draft.timeline],
    ['Package', draft.selectedTier.charAt(0).toUpperCase() + draft.selectedTier.slice(1)],
  ];
  labels.forEach(([label, val], i) => {
    const cx = margin + colW * i + 3;
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'bold');
    doc.text(label.toUpperCase(), cx, y + 5);
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(val, cx, y + 10);
  });
  y += boxH + 6;

  /* ---------- Section helper ---------- */
  function sectionHeading(text: string) {
    checkSpace(8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(text.toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  }

  function checkSpace(needed: number) {
    if (y + needed > pageH - margin - 12) {
      doc.addPage();
      y = margin;
    }
  }

  /* ---------- Scope ---------- */
  sectionHeading('Scope of work');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const scopeLines = doc.splitTextToSize(draft.scope ?? '', contentW);
  doc.text(scopeLines, margin, y);
  y += scopeLines.length * 4.5 + 3;

  /* ---------- Work steps table ---------- */
  sectionHeading('Work steps');
  const steps = (draft.workSteps ?? []).filter(s => s.title.trim());
  if (steps.length > 0) {
    // table header
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'bold');
    doc.text('#', margin, y);
    doc.text('Step', margin + 10, y);
    doc.text('Description', margin + 60, y);
    doc.text('Duration', pageW - margin, y, { align: 'right' });
    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageW - margin, y);
    y += 2;

    steps.forEach((step, i) => {
      checkSpace(10);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.text(String(i + 1), margin, y);
      doc.setTextColor(15, 23, 42);
      const stepLines = doc.splitTextToSize(step.title, 45);
      doc.text(stepLines, margin + 10, y);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(step.description, 75);
      doc.text(descLines, margin + 60, y);
      doc.text(step.duration, pageW - margin, y, { align: 'right' });
      y += Math.max(stepLines.length, descLines.length) * 4 + 2;
    });
    y += 3;
  }

  /* ---------- Materials table ---------- */
  sectionHeading('Materials');
  const mats = (draft.materials ?? []).filter(m => m.name.trim());
  if (mats.length > 0) {
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'bold');
    doc.text('Material', margin, y);
    doc.text('Specification', margin + 70, y);
    doc.text('Quantity', pageW - margin, y, { align: 'right' });
    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageW - margin, y);
    y += 2;

    mats.forEach((mat) => {
      checkSpace(8);
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      const nameLines = doc.splitTextToSize(mat.name, 60);
      doc.text(nameLines, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const specLines = doc.splitTextToSize(mat.spec, 65);
      doc.text(specLines, margin + 70, y);
      doc.text(mat.quantity, pageW - margin, y, { align: 'right' });
      y += Math.max(nameLines.length, specLines.length) * 4 + 2;
    });
    y += 3;
  }

  /* ---------- Assumptions ---------- */
  sectionHeading('Assumptions');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  (draft.assumptions ?? []).filter(a => a.trim()).forEach((a, i) => {
    checkSpace(6);
    const lines = doc.splitTextToSize(`${i + 1}. ${a}`, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 1;
  });
  y += 3;

  /* ---------- Before & After visualization (approved only) ---------- */
  const approvedViz = (visualizations ?? []).filter(v => v.approved);
  if (approvedViz.length > 0) {
    sectionHeading('Before & After — AI Concept Visualization');
    const imgW = (contentW - 6) / 2;
    const imgH = imgW * (2 / 3);
    approvedViz.forEach((viz, idx) => {
      checkSpace(imgH + 18);
      try {
        const beforeData = (window as any).__vizImageCache?.[viz.id + '_before'] as string | undefined;
        const afterData = (window as any).__vizImageCache?.[viz.id + '_after'] as string | undefined;
        if (beforeData) {
          doc.addImage(beforeData, 'JPEG', margin, y, imgW, imgH);
        }
        if (afterData) {
          doc.addImage(afterData, 'JPEG', margin + imgW + 6, y, imgW, imgH);
        }
      } catch {
        /* image add may fail for remote URLs without proxy; skip gracefully */
      }
      // labels under images
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'bold');
      doc.text('BEFORE', margin, y + imgH + 4);
      doc.text('AFTER (CONCEPT)', margin + imgW + 6, y + imgH + 4);
      y += imgH + 7;

      // prompt
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      const promptLines = doc.splitTextToSize(`Concept ${idx + 1}: ${viz.prompt}`, contentW);
      doc.text(promptLines, margin, y);
      y += promptLines.length * 3.5 + 2;
    });
    // disclaimer
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    const vizDisc = doc.splitTextToSize(visualizationDisclaimer(), contentW);
    doc.text(vizDisc, margin, y);
    y += vizDisc.length * 3 + 4;
  }

  /* ---------- Footer disclaimer ---------- */
  checkSpace(14);
  y = pageH - margin - 14;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 4;
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'italic');
  const footer = doc.splitTextToSize(
    `${estimateDisclaimer()} This document is a draft generated by the RenovAIte AI Proposal Generator. Prices, timelines, and specifications are illustrative and have not been verified against supplier quotations or on-site conditions. Final pricing is subject to formal quotation.`,
    contentW,
  );
  doc.text(footer, margin, y);

  return doc;
}

/**
 * Preload a remote image as a data URL for embedding into the PDF.
 * jsPDF's addImage needs a data URL or same-origin image. This fetches and
 * converts to base64. Returns null on failure (cross-origin or network).
 */
export function fetchImageAsDataURL(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 800;
          canvas.height = img.naturalHeight || 600;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

/**
 * Preload all approved visualization images into a cache for PDF embedding.
 */
export async function preloadVisualizationImages(visualizations: ContractorVisualization[]): Promise<void> {
  const cache = (window as any).__vizImageCache ?? {};
  for (const v of visualizations) {
    if (!cache[v.id + '_before']) cache[v.id + '_before'] = await fetchImageAsDataURL(v.beforePhotoUrl);
    if (!cache[v.id + '_after']) cache[v.id + '_after'] = await fetchImageAsDataURL(v.afterPhotoUrl);
  }
  (window as any).__vizImageCache = cache;
}

export function pdfFilename(project: Project, draft: ProposalDraft): string {
  const safe = project.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  return `RenovAIte_${project.id}_${draft.selectedTier}_${safe}.pdf`;
}
