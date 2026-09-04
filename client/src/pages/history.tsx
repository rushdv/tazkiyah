import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, Pencil, Calendar, HeartHandshake, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CalendarHeatmap } from '@/components/habits/calendar-heatmap';
import type { DayDetail } from '@tazkiyah/shared';
import { toast } from 'sonner';

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<{ id: string; notes: string; durationMinutes?: number | null } | null>(null);
  const queryClient = useQueryClient();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-heatmap', currentYear, currentMonth],
    queryFn: async () => {
      const { data } = await api.get(`/records/analytics/${currentYear}/${currentMonth}`);
      return data.data;
    },
  });

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['history', page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '15' });
      if (search) params.set('search', search);
      if (status !== 'all') params.set('status', status);
      const { data: res } = await api.get(`/records/history?${params}`);
      return res;
    },
  });

  const { data: dayDetail } = useQuery({
    queryKey: ['day-detail', selectedDayDate],
    queryFn: async () => {
      if (!selectedDayDate) return null;
      const { data } = await api.get(`/records/day/${selectedDayDate}`);
      return data.data as DayDetail;
    },
    enabled: !!selectedDayDate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, notes, durationMinutes }: { id: string; notes: string; durationMinutes?: number | null }) => {
      return api.patch(`/records/${id}`, { notes, durationMinutes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['day-detail'] });
      toast.success('Record updated successfully');
      setEditingRecord(null);
    },
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
      <div className="flex items-center justify-between border-b border-border/60 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review past daily records, reflections, and consistency patterns.
          </p>
        </div>
      </div>

      {/* GitHub-style Consistency Heatmap */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Consistency Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarHeatmap
            data={analyticsData?.dailyData || []}
            selectedDate={selectedDayDate}
            onSelectDate={(date) => setSelectedDayDate(date)}
            daysCount={120}
          />
        </CardContent>
      </Card>

      {/* Records History Table */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notes or habits..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 text-sm"
              />
            </div>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[150px] text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : historyData?.data?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <p className="font-medium text-base">Your journey starts with today.</p>
              <p className="text-xs">No matching historical records found.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {historyData?.data?.map((record: any) => (
                <div
                  key={record.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-3.5 transition-all hover:bg-muted/40"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {record.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : record.status === 'skipped' ? (
                        <XCircle className="h-5 w-5 text-destructive/70" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{record.habit.label}</span>
                        <Badge
                          variant={
                            record.status === 'completed'
                              ? 'success'
                              : record.status === 'skipped'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {record.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(record.date), 'EEEE, MMM d, yyyy')}
                        {record.durationMinutes && ` • ${record.durationMinutes} mins`}
                        {record.skipReason && ` • Reason: ${record.skipReason}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-border/40">
                    {record.notes && (
                      <span className="text-xs text-muted-foreground italic bg-muted/30 px-2.5 py-1 rounded-lg max-w-[220px] truncate">
                        "{record.notes}"
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setEditingRecord({
                          id: record.id,
                          notes: record.notes || '',
                          durationMinutes: record.durationMinutes || null,
                        })
                      }
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {historyData?.meta && historyData.meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                Page {historyData.meta.page} of {historyData.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-8 px-3 text-xs"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= historyData.meta.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-8 px-3 text-xs"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={!!selectedDayDate} onOpenChange={(open) => !open && setSelectedDayDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {selectedDayDate && format(new Date(selectedDayDate + 'T00:00:00Z'), 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/10 border border-accent/20">
              <span className="text-xs font-semibold text-accent uppercase">Daily Progress</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {dayDetail?.completion ?? 0}%
              </span>
            </div>

            <div className="space-y-2">
              {dayDetail?.habits?.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{h.label}</span>
                    {h.record?.durationMinutes && (
                      <span className="text-xs text-muted-foreground">({h.record.durationMinutes} min)</span>
                    )}
                  </div>
                  <Badge
                    variant={
                      h.record?.status === 'completed'
                        ? 'success'
                        : h.record?.status === 'skipped'
                        ? 'destructive'
                        : 'outline'
                    }
                    className="text-[10px]"
                  >
                    {h.record?.status || 'pending'}
                  </Badge>
                </div>
              ))}
            </div>

            {dayDetail?.reflection && (
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <HeartHandshake className="h-4 w-4 text-accent" />
                  Daily Reflection ({dayDetail.reflection.mood})
                </div>
                {dayDetail.reflection.notes && (
                  <p className="text-xs text-foreground italic">"{dayDetail.reflection.notes}"</p>
                )}
                {dayDetail.reflection.improvement && (
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Improvement:</strong> {dayDetail.reflection.improvement}
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Habit Record</DialogTitle>
            <DialogDescription>Update notes or logged duration for this past entry.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Duration (Minutes)</label>
              <Input
                type="number"
                placeholder="Minutes spent..."
                value={editingRecord?.durationMinutes?.toString() || ''}
                onChange={(e) =>
                  setEditingRecord((prev) =>
                    prev ? { ...prev, durationMinutes: e.target.value ? parseInt(e.target.value) : null } : null,
                  )
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Notes</label>
              <Input
                placeholder="Add notes..."
                value={editingRecord?.notes || ''}
                onChange={(e) =>
                  setEditingRecord((prev) => (prev ? { ...prev, notes: e.target.value } : null))
                }
              />
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground"
              onClick={() =>
                editingRecord &&
                updateMutation.mutate({
                  id: editingRecord.id,
                  notes: editingRecord.notes,
                  durationMinutes: editingRecord.durationMinutes,
                })
              }
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
