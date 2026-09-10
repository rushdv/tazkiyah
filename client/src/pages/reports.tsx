import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Printer, Share2, FileText, Trash2, Sparkles, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { downloadReportPdf, printReportElement, shareReportPdf, ReportSummaryData } from '@/lib/pdf-generator';
import { formatTime } from '@/lib/utils';
import { toast } from 'sonner';
import type { ApiResponse, Report } from '@tazkiyah/shared';

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const monthStartStr = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');

  const [titleInput, setTitleInput] = useState(`${format(new Date(), 'MMMM yyyy')} Progress Report`);
  const [startDateInput, setStartDateInput] = useState(monthStartStr);
  const [endDateInput, setEndDateInput] = useState(todayStr);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Report[]>>('/reports');
      return data.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report snapshot deleted');
      if (selectedReport) setSelectedReport(null);
    },
  });

  async function handleGenerateReport() {
    try {
      setIsGenerating(true);
      const { data } = await api.post<ApiResponse<Report>>('/reports/generate', {
        title: titleInput,
        periodType: 'custom',
        startDate: startDateInput,
        endDate: endDateInput,
      });

      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report generated successfully');
      if (data.data) {
        setSelectedReport(data.data);
      }
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  }

  const parsedSummary: ReportSummaryData | null = selectedReport
    ? JSON.parse(selectedReport.summaryData)
    : null;

  // Chunk daily journal into pages of ~7 days per page for A4 pdf pages
  const journalPages = parsedSummary?.dailyJournal
    ? Array.from({ length: Math.ceil(parsedSummary.dailyJournal.length / 6) }, (_, i) =>
        parsedSummary.dailyJournal!.slice(i * 6, (i + 1) * 6)
      )
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate and export personal spiritual and progress reports in PDF format.
          </p>
        </div>
      </div>

      {/* Generate Report Form Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Generate New PDF Report
          </CardTitle>
          <CardDescription className="text-xs">
            Select a title and date range to generate a comprehensive multi-page PDF document based on stored daily records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Report Title</label>
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Monthly Progress Report"
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Start Date</label>
              <Input
                type="date"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">End Date</label>
              <Input
                type="date"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating || !titleInput}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium gap-2 px-6"
          >
            <FileText className="h-4 w-4" />
            {isGenerating ? 'Generating Report...' : 'Generate Report Snapshot'}
          </Button>
        </CardContent>
      </Card>

      {/* Report History Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Generated Report Snapshots</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : reports?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <p className="font-medium text-base">No reports generated yet.</p>
              <p className="text-xs">Your first report will appear here after you generate one.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reports?.map((rep) => (
                <div
                  key={rep.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card transition-all hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{rep.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Generated on {format(new Date(rep.createdAt), 'MMM d, yyyy')} • Period:{' '}
                        {format(new Date(rep.startDate), 'MMM d')} – {format(new Date(rep.endDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedReport(rep)}
                      className="text-xs"
                    >
                      View Report
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        setSelectedReport(rep);
                        // allow DOM to render report modal — 500ms gives Dialog time to fully paint
                        setTimeout(async () => {
                          try {
                            toast.loading('Generating PDF...', { id: 'pdf-download' });
                            await downloadReportPdf('pdf-report-document', `${rep.title}.pdf`);
                            toast.success('PDF downloaded successfully!', { id: 'pdf-download' });
                          } catch (err: any) {
                            toast.error(err?.message || 'Failed to download PDF report', { id: 'pdf-download' });
                          }
                        }, 500);
                      }}
                      className="text-xs gap-1 bg-emerald-600/10 text-emerald-600 border-emerald-600/20 hover:bg-emerald-600 hover:text-white"
                    >
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(rep.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF View & Export Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader className="no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
              <DialogTitle className="text-lg font-bold">{selectedReport?.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      toast.loading('Generating PDF report...', { id: 'pdf-download' });
                      await downloadReportPdf('pdf-report-document', `${selectedReport?.title}.pdf`);
                      toast.success('PDF downloaded successfully!', { id: 'pdf-download' });
                    } catch (err: any) {
                      toast.error(err?.message || 'Failed to download PDF', { id: 'pdf-download' });
                    }
                  }}
                  className="gap-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 border-0"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => printReportElement('pdf-report-document')}
                  className="gap-1.5 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      toast.loading('Preparing report...', { id: 'pdf-download' });
                      await shareReportPdf(selectedReport?.title || 'Report', 'pdf-report-document');
                      toast.success('Action completed!', { id: 'pdf-download' });
                    } catch (err: any) {
                      toast.error(err?.message || 'Failed to share report', { id: 'pdf-download' });
                    }
                  }}
                  className="gap-1.5 text-xs"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </Button>
              </div>
            </div>
          </DialogHeader>

          {parsedSummary && (
            <div id="pdf-report-document" className="space-y-8 bg-slate-100 dark:bg-slate-900 p-4 rounded-xl text-slate-900 font-sans">
              {/* PAGE 1: COVER PAGE */}
              <div className="pdf-page w-[210mm] min-h-[297mm] p-10 bg-white shadow-md mx-auto flex flex-col justify-between rounded-lg">
                <div className="space-y-8">
                  <div className="border-b-2 border-emerald-800 pb-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-800">TAZKIYAH</span>
                      <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Monthly Spiritual & Personal Progress</h1>
                      <p className="text-xs text-slate-500 italic mt-1">“Build Better Habits. Strengthen Your Deen.”</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full">Official Report</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 p-6 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[10px]">User Account</span>
                      <span className="text-sm font-bold text-slate-900">{parsedSummary.userName}</span>
                      <span className="block text-slate-500">{parsedSummary.userEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[10px]">Report Period</span>
                      <span className="text-sm font-bold text-slate-900">{parsedSummary.gregorianRange || `${parsedSummary.startDate} – ${parsedSummary.endDate}`}</span>
                      <span className="block text-emerald-800 font-semibold">{parsedSummary.hijriRange}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Overall Consistency</span>
                      <span className="text-3xl font-extrabold text-emerald-900 mt-1 block">{parsedSummary.overallConsistency}%</span>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">Submitted Days</span>
                      <span className="text-3xl font-bold text-slate-800 mt-1 block">{parsedSummary.submittedDays ?? 0}</span>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">Tracked Days</span>
                      <span className="text-3xl font-bold text-slate-800 mt-1 block">{parsedSummary.trackedDays}</span>
                    </div>
                    <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-amber-800 block">Current Streak</span>
                      <span className="text-3xl font-bold text-amber-900 mt-1 block">{parsedSummary.currentStreak}d</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b pb-2">Spiritual & Wellness Time Totals</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-slate-500 font-medium block">Total Quran Reading</span>
                        <span className="text-lg font-bold text-emerald-800">{Math.floor(parsedSummary.quranTotalMinutes / 60)}h {parsedSummary.quranTotalMinutes % 60}m</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Total Exercise</span>
                        <span className="text-lg font-bold text-slate-800">{Math.floor(parsedSummary.exerciseTotalMinutes / 60)}h {parsedSummary.exerciseTotalMinutes % 60}m</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Total Islamic Learning</span>
                        <span className="text-lg font-bold text-slate-800">{Math.floor(parsedSummary.learningTotalMinutes / 60)}h {parsedSummary.learningTotalMinutes % 60}m</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t text-center text-[10px] text-slate-400">
                  Tazkiyah Personal Progress System • Page 1 of {2 + journalPages.length}
                </div>
              </div>

              {/* PAGE 2: PRACTICE BREAKDOWN */}
              <div className="pdf-page w-[210mm] min-h-[297mm] p-10 bg-white shadow-md mx-auto flex flex-col justify-between rounded-lg">
                <div className="space-y-6">
                  <div className="border-b pb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Practice Completion Breakdown</h2>
                    <span className="text-xs text-slate-500">{parsedSummary.periodTitle}</span>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200 bg-slate-100 text-slate-700">
                        <th className="p-3 font-bold">Practice</th>
                        <th className="p-3 font-bold">Type</th>
                        <th className="p-3 font-bold">Completed Days</th>
                        <th className="p-3 font-bold">Total Duration / Count</th>
                        <th className="p-3 font-bold text-right">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedSummary.habitBreakdown?.map((hb) => (
                        <tr key={hb.slug}>
                          <td className="p-3 font-semibold text-slate-800">{hb.label}</td>
                          <td className="p-3 text-slate-500 uppercase text-[10px] font-bold">{hb.type}</td>
                          <td className="p-3 text-slate-700 font-medium">{hb.completedDays} days</td>
                          <td className="p-3 text-slate-600">
                            {hb.totalDurationMinutes ? `${Math.floor(hb.totalDurationMinutes / 60)}h ${hb.totalDurationMinutes % 60}m` : hb.totalCount ? `${hb.totalCount} times` : '—'}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-800">{hb.completionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {parsedSummary.mostConsistentHabit && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800">Most Consistent Practice</span>
                        <p className="text-sm font-bold text-emerald-950 mt-0.5">{parsedSummary.mostConsistentHabit.label}</p>
                      </div>
                      <span className="text-xl font-extrabold text-emerald-900">{parsedSummary.mostConsistentHabit.completionRate}% Rate</span>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t text-center text-[10px] text-slate-400">
                  Tazkiyah Personal Progress System • Page 2 of {2 + journalPages.length}
                </div>
              </div>

              {/* PAGES 3+: DAY-BY-DAY JOURNAL */}
              {journalPages.map((pageDays, pageIdx) => (
                <div key={pageIdx} className="pdf-page w-[210mm] min-h-[297mm] p-10 bg-white shadow-md mx-auto flex flex-col justify-between rounded-lg">
                  <div className="space-y-5">
                    <div className="border-b pb-3 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-slate-900">Day-by-Day Journal</h2>
                      <span className="text-xs text-slate-500">Page {3 + pageIdx} of {2 + journalPages.length}</span>
                    </div>

                    <div className="space-y-4">
                      {pageDays.map((entry) => (
                        <div key={entry.date} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                            <div>
                              <span className="font-bold text-sm text-slate-900">{entry.gregorianDisplay}</span>
                              <span className="ml-2 text-emerald-800 font-medium">({entry.hijriDisplay})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {entry.isSubmitted ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                                  Submitted at {entry.submittedAt ? formatTime(entry.submittedAt) : 'end of day'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-[10px]">
                                  Progress Saved
                                </span>
                              )}
                              <span className="font-bold text-emerald-800">{entry.dailyScore}%</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            {entry.practices?.map((p) => (
                              <div key={p.habitId} className="flex items-center gap-1.5">
                                {p.status === 'completed' ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                ) : p.status === 'skipped' ? (
                                  <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                ) : (
                                  <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                )}
                                <span className={p.status === 'completed' ? 'font-medium text-slate-800' : 'text-slate-500'}>
                                  {p.label}
                                  {p.durationMinutes ? ` — ${p.durationMinutes}m` : ''}
                                </span>
                              </div>
                            ))}
                          </div>

                          {entry.reflection?.notes && (
                            <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-600 italic">
                              "{entry.reflection.notes}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t text-center text-[10px] text-slate-400">
                    Tazkiyah Personal Progress System • Page {3 + pageIdx} of {2 + journalPages.length}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
