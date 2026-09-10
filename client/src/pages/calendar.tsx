import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, BookmarkCheck, ExternalLink, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn, formatTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { DayDetail, MonthlyAnalytics, ApiResponse } from '@tazkiyah/shared';
import { getDateInfo } from '@tazkiyah/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthStr = format(currentMonth, 'yyyy-MM');
  const [year, month] = monthStr.split('-').map(Number);

  const { data: monthData, isLoading: isMonthLoading } = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MonthlyAnalytics>>(`/records/analytics/${year}/${month}`);
      return data.data!;
    },
  });

  const { data: dayDetail, isLoading: isDayLoading } = useQuery({
    queryKey: ['day-detail', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return null;
      const { data } = await api.get<ApiResponse<DayDetail>>(`/records/day/${selectedDate}`);
      return data.data!;
    },
    enabled: !!selectedDate,
  });

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const start = startOfWeek(monthStart);
    const end = endOfWeek(monthEnd);
    const result: Date[] = [];
    let day = start;
    while (day <= end) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [currentMonth]);

  const dailyMap = useMemo(() => {
    const map = new Map<string, { completion: number; isSubmitted: boolean; submittedAt: string | null }>();
    (monthData?.dailyData || []).forEach((d) => {
      map.set(d.date, {
        completion: d.completion,
        isSubmitted: d.isSubmitted ?? false,
        submittedAt: d.submittedAt ?? null,
      });
    });
    return map;
  }, [monthData]);

  const monthInfo = useMemo(() => {
    const firstDay = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const lastDay = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    const startHijri = getDateInfo(firstDay).hijriDisplay;
    const endHijri = getDateInfo(lastDay).hijriDisplay;
    return `${startHijri} – ${endHijri}`;
  }, [currentMonth]);

  function getDayCellStyles(day: Date) {
    const key = format(day, 'yyyy-MM-dd');
    const info = dailyMap.get(key);
    if (!info || info.completion === 0) return 'bg-card hover:bg-muted/50 border-border/40';
    if (info.completion >= 100) return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25';
    if (info.completion >= 50) return 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25';
    return 'bg-muted/40 border-border/60 hover:bg-muted/60';
  }

  const selectedDateInfo = selectedDate ? getDateInfo(selectedDate) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visual breakdown of daily practices and submission history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="h-9 px-3 text-xs gap-1.5 font-medium"
          >
            <CalendarIcon className="h-3.5 w-3.5 text-accent" />
            Current Month
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card p-4">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">Monthly Consistency</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {monthData?.completionPercentage ?? 0}%
          </span>
        </Card>

        <Card className="glass-card p-4">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">Submitted Days</span>
          <span className="text-2xl font-bold text-foreground">
            {monthData?.dailyData?.filter((d) => d.isSubmitted).length ?? 0} <span className="text-xs font-normal text-muted-foreground">days</span>
          </span>
        </Card>

        <Card className="glass-card p-4">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">Tracked Days</span>
          <span className="text-2xl font-bold text-foreground">
            {monthData?.totalTrackedDays ?? 0} <span className="text-xs font-normal text-muted-foreground">days</span>
          </span>
        </Card>
      </div>

      {/* Main Calendar Card */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
              <p className="text-xs text-accent font-semibold mt-0.5">{monthInfo}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold mb-3 text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate === key;
              const inMonth = isSameMonth(day, currentMonth);
              const dayInfo = dailyMap.get(key);

              const dayHijri = getDateInfo(key).hijriDetails.day;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={cn(
                    'aspect-square rounded-xl p-1.5 flex flex-col justify-between items-stretch text-left border transition-all relative overflow-hidden',
                    getDayCellStyles(day),
                    !inMonth && 'opacity-30',
                    isToday && 'ring-2 ring-accent ring-offset-2 ring-offset-background font-bold',
                    isSelected && 'ring-2 ring-primary',
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold">{format(day, 'd')}</span>
                    <span className="text-[10px] text-muted-foreground font-mono opacity-80">{dayHijri}</span>
                  </div>

                  {inMonth && dayInfo && (
                    <div className="space-y-1 mt-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold">{dayInfo.completion}%</span>
                        {dayInfo.isSubmitted && (
                          <BookmarkCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <div className="h-1 w-full rounded-full bg-muted/60 overflow-hidden">
                        <div
                          style={{ width: `${dayInfo.completion}%` }}
                          className={cn(
                            'h-full transition-all',
                            dayInfo.completion >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                          )}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-muted-foreground border-t border-border/50 pt-4">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" /> 100% Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500/40" /> 50% - 99% In Progress
            </span>
            <span className="flex items-center gap-1.5">
              <BookmarkCheck className="h-3.5 w-3.5 text-emerald-600" /> Submitted Day
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-base">
              <span>{selectedDateInfo?.gregorianDisplay}</span>
              {dayDetail?.dailyRecord?.isSubmitted && (
                <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Submitted
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-accent font-semibold">
              {selectedDateInfo?.hijriDisplay}
            </DialogDescription>
          </DialogHeader>

          {isDayLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground">Daily Consistency:</span>
                  <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">{dayDetail?.completion}%</span>
                </div>
                {dayDetail?.dailyRecord?.submittedAt && (
                  <span className="text-[11px] text-muted-foreground">
                    Submitted at {formatTime(dayDetail.dailyRecord.submittedAt)}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Practices</h4>
                {dayDetail?.habits?.map((habit) => (
                  <div
                    key={habit.id}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-3 text-xs transition-all',
                      habit.record?.status === 'completed' && 'border-emerald-500/30 bg-emerald-500/5',
                      habit.record?.status === 'skipped' && 'opacity-50',
                    )}
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground">{habit.label}</span>
                      {habit.type === 'duration' && habit.record?.durationMinutes && (
                        <p className="text-[11px] text-muted-foreground">
                          Duration: {habit.record.durationMinutes} min
                        </p>
                      )}
                    </div>

                    <Badge
                      variant={
                        habit.record?.status === 'completed'
                          ? 'success'
                          : habit.record?.status === 'skipped'
                            ? 'destructive'
                            : 'outline'
                      }
                      className="text-[11px]"
                    >
                      {habit.record?.status || 'pending'}
                    </Badge>
                  </div>
                ))}
              </div>

              {dayDetail?.reflection && (
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 space-y-1 text-xs">
                  <span className="font-semibold text-accent block">Daily Reflection</span>
                  <p className="text-muted-foreground italic">"{dayDetail.reflection.notes}"</p>
                </div>
              )}

              <Button
                type="button"
                onClick={() => {
                  if (selectedDate) {
                    navigate('/dashboard');
                    setSelectedDate(null);
                  }
                }}
                className="w-full text-xs gap-1.5 mt-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open in Daily Journal</span>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
