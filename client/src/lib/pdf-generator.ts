import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportSummaryData {
  userName: string;
  periodTitle: string;
  startDate: string;
  endDate: string;
  overallConsistency: number;
  trackedDays: number;
  currentStreak: number;
  longestStreak: number;
  quranTotalMinutes: number;
  exerciseTotalMinutes: number;
  learningTotalMinutes: number;
  mostConsistentHabit?: { label: string; completionRate: number } | null;
  habitBreakdown: {
    slug: string;
    label: string;
    completedDays: number;
    totalDurationMinutes: number;
    completionRate: number;
  }[];
  reflectionCount?: number;
  recentReflections?: { date: string; mood: string; notes?: string | null; improvement?: string | null }[];
}

export async function downloadReportPdf(elementId: string, filename: string = 'Tazkiyah-Progress-Report.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Report container element not found');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}

export function printReportElement(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;
  window.print();
}

export async function shareReportPdf(filename: string, elementId: string) {
  if (navigator.share && navigator.canShare) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (blob) {
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
  // Fallback to download
  await downloadReportPdf(elementId, `${filename}.pdf`);
}
