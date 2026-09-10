import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';

export interface ReportJournalEntry {
  date: string;
  dayName: string;
  gregorianDisplay: string;
  gregorianShort: string;
  hijriDisplay: string;
  isSubmitted: boolean;
  submittedAt: string | null;
  dailyScore: number;
  completedCount: number;
  totalHabitsCount: number;
  practices: {
    habitId: string;
    slug: string;
    label: string;
    type: string;
    status: string;
    durationMinutes: number | null;
    actualCount: number | null;
    notes: string | null;
  }[];
  reflection: {
    mood?: string;
    notes?: string | null;
    improvement?: string | null;
  } | null;
}

export interface ReportSummaryData {
  userName: string;
  userEmail?: string;
  periodTitle: string;
  periodType: string;
  startDate: string;
  endDate: string;
  gregorianRange?: string;
  hijriRange?: string;
  overallConsistency: number;
  submittedDays?: number;
  trackedDays: number;
  totalDaysInRange?: number;
  currentStreak: number;
  longestStreak: number;
  quranTotalMinutes: number;
  exerciseTotalMinutes: number;
  learningTotalMinutes: number;
  mostConsistentHabit?: { label: string; completionRate: number } | null;
  habitBreakdown: {
    slug: string;
    label: string;
    type: string;
    completedDays: number;
    totalDurationMinutes: number;
    totalCount: number;
    completionRate: number;
  }[];
  reflectionCount?: number;
  recentReflections?: { date: string; mood: string; notes?: string | null; improvement?: string | null }[];
  dailyJournal?: ReportJournalEntry[];
}

export async function downloadReportPdf(
  elementId: string,
  filename: string = 'Tazkiyah-Progress-Report.pdf',
) {
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error('Report container element not found');
  }

  const pageElements = Array.from(container.querySelectorAll<HTMLElement>('.pdf-page'));
  const targetElements = pageElements.length > 0 ? pageElements : [container];

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < targetElements.length; i++) {
    if (i > 0) pdf.addPage();
    const el = targetElements[i];

    // html-to-image handles modern CSS color functions (oklab, oklch, etc.) natively
    const dataUrl = await toJpeg(el, {
      quality: 0.95,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      style: {
        // Ensure the element renders at A4 width
        width: '794px', // ~210mm at 96dpi
        boxSizing: 'border-box',
        transform: 'none',
      },
    });

    pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  }

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(cleanFilename);
}

export function printReportElement(_elementId: string) {
  window.print();
}

export async function shareReportPdf(filename: string, elementId: string) {
  try {
    if (navigator.share && navigator.canShare) {
      const element = document.getElementById(elementId);
      if (element) {
        const { toPng } = await import('html-to-image');
        const dataUrl = await toPng(element, {
          backgroundColor: '#ffffff',
          pixelRatio: 2,
        });

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${filename}.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Tazkiyah Progress Report',
            text: 'Check out my Tazkiyah spiritual and personal progress report.',
            files: [file],
          });
          return;
        }
      }
    }
  } catch {}
  await downloadReportPdf(elementId, `${filename}.pdf`);
}
