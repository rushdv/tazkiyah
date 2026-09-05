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
import { Download, Printer, Share2, FileText, Trash2, Sparkles } from 'lucide-react';
import { downloadReportPdf, printReportElement, shareReportPdf, ReportSummaryData } from '@/lib/pdf-generator';
import { toast } from 'sonner';
import type { ApiResponse, Report } from '@tazkiyah/shared';

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form for custom report generation
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

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate and export personal progress reports in PDF format.
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
            Select a title and date range to generate a comprehensive 5-page PDF document based on your actual stored data.
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="no-print">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <DialogTitle className="text-lg">{selectedReport?.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadReportPdf('pdf-report-document', `${selectedReport?.title}.pdf`)}
                  className="gap-1.5 text-xs"
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
                  onClick={() => shareReportPdf(selectedReport?.title || 'Report', 'pdf-report-document')}
                  className="gap-1.5 text-xs"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </Button>
              </div>
            </div>
          </DialogHeader>

          {parsedSummary && (
            <div id="pdf-report-document" className="p-8 bg-white text-slate-900 space-y-8 font-sans border rounded-xl">
              {/* PAGE 1: TITLE & COVER */}
              <div className="border-b-2 border-emerald-900/20 pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-widest text-emerald-800">TAZKIYAH</span>
                    <h1 className="text-2xl font-bold text-slate-900 mt-1">Personal Progress Report</h1>
                    <p className="text-xs text-slate-500 italic mt-0.5">“Build Better Habits. Strengthen Your Deen.”</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">{parsedSummary.userName}</p>
                    <p className="text-xs text-slate-500">{parsedSummary.periodTitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-4 rounded-lg bg-emerald-50 text-center">
                    <p className="text-xs uppercase text-emerald-800 font-semibold">Overall Consistency</p>
                    <p className="text-3xl font-extrabold text-emerald-900 mt-1">{parsedSummary.overallConsistency}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 text-center">
                    <p className="text-xs uppercase text-slate-600 font-semibold">Tracked Days</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{parsedSummary.trackedDays} Days</p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-50 text-center">
                    <p className="text-xs uppercase text-amber-800 font-semibold">Current Streak</p>
                    <p className="text-3xl font-bold text-amber-900 mt-1">{parsedSummary.currentStreak} Days</p>
                  </div>
                </div>
              </div>

              {/* PAGE 2: MONTH AT A GLANCE */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm uppercase font-bold tracking-wider text-slate-700 border-b pb-2">
                  Month at a Glance & Duration Totals
                </h3>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="p-3 border rounded-lg bg-slate-50/50">
                    <span className="font-semibold text-slate-600 block">Quran Reading</span>
                    <span className="text-lg font-bold text-slate-900">{Math.floor(parsedSummary.quranTotalMinutes / 60)}h {parsedSummary.quranTotalMinutes % 60}m</span>
                  </div>
                  <div className="p-3 border rounded-lg bg-slate-50/50">
                    <span className="font-semibold text-slate-600 block">Exercise Time</span>
                    <span className="text-lg font-bold text-slate-900">{Math.floor(parsedSummary.exerciseTotalMinutes / 60)}h {parsedSummary.exerciseTotalMinutes % 60}m</span>
                  </div>
                  <div className="p-3 border rounded-lg bg-slate-50/50">
                    <span className="font-semibold text-slate-600 block">Islamic Learning</span>
                    <span className="text-lg font-bold text-slate-900">{Math.floor(parsedSummary.learningTotalMinutes / 60)}h {parsedSummary.learningTotalMinutes % 60}m</span>
                  </div>
                </div>
              </div>

              {/* PAGE 3: HABIT BREAKDOWN TABLE */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm uppercase font-bold tracking-wider text-slate-700 border-b pb-2">
                  Habit Consistency Breakdown
                </h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-100 text-slate-700">
                      <th className="p-2 font-semibold">Habit</th>
                      <th className="p-2 font-semibold">Completed Days</th>
                      <th className="p-2 font-semibold">Total Time</th>
                      <th className="p-2 font-semibold text-right">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedSummary.habitBreakdown?.map((hb) => (
                      <tr key={hb.slug}>
                        <td className="p-2 font-medium text-slate-800">{hb.label}</td>
                        <td className="p-2 text-slate-600">{hb.completedDays} days</td>
                        <td className="p-2 text-slate-600">{hb.totalDurationMinutes ? `${Math.floor(hb.totalDurationMinutes / 60)}h ${hb.totalDurationMinutes % 60}m` : '—'}</td>
                        <td className="p-2 text-right font-bold text-emerald-700">{hb.completionRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGE 4: REFLECTION & ENCOURAGEMENT */}
              <div className="space-y-4 pt-2 border-t">
                <h3 className="text-sm uppercase font-bold tracking-wider text-slate-700 border-b pb-2">
                  Reflective Insights & Next Focus
                </h3>
                {parsedSummary.recentReflections && parsedSummary.recentReflections.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {parsedSummary.recentReflections.map((rf, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between text-slate-500 font-medium">
                          <span>{rf.date}</span>
                          <span className="uppercase text-[10px] font-bold text-emerald-800">{rf.mood}</span>
                        </div>
                        {rf.notes && <p className="text-slate-700 mt-1 italic">"{rf.notes}"</p>}
                        {rf.improvement && <p className="text-slate-600 mt-1">Focus: {rf.improvement}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Consistency is a journey of small daily steps. Keep striving for Allah's pleasure.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t text-center text-[10px] text-slate-400">
                Generated deterministically by Tazkiyah • Private Personal Progress Report
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
