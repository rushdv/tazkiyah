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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { DayDetail } from '@tazkiyah/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthStr = format(currentMonth, 'yyyy-MM');
  const [year, month] = monthStr.split('-').map(Number);

  const { data: monthData } = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: async () => {
      const { data } = await api.get(`/records/analytics/${year}/${month}`);
      return data.data;
    },
  });

  const { data: dayDetail } = useQuery({
    queryKey: ['day-detail', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return null;
      const { data } = await api.get(`/records/day/${selectedDate}`);
      return data.data as DayDetail;
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

  const dailyMap = new Map<string, number>(
    (monthData?.dailyData || []).map((d: { date: string; completion: number }) => [d.date, d.completion]),
  );

  function getDayColor(day: Date) {
    const key = format(day, 'yyyy-MM-dd');
    const completion: number | undefined = dailyMap.get(key);
    if (completion === undefined) return 'bg-card hover:bg-accent';
    if (completion >= 100) return 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30';
    if (completion >= 50) return 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30';
    if (completion > 0) return 'bg-red-500/20 text-red-500 hover:bg-red-500/30';
    return 'bg-card hover:bg-accent';
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2 text-muted-foreground font-medium">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate === key;
              const inMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={cn(
                    'aspect-square rounded-lg text-sm font-medium transition-all',
                    getDayColor(day),
                    !inMonth && 'opacity-30',
                    isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                    isSelected && 'ring-2 ring-primary',
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-emerald-500/20" /> 100%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-amber-500/20" /> 50-99%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-red-500/20" /> &lt;50%
            </span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDate && format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {dayDetail?.habits?.map((habit) => (
              <div
                key={habit.id}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3',
                  habit.record?.status === 'completed' && 'border-emerald-500/30 bg-emerald-500/5',
                  habit.record?.status === 'skipped' && 'opacity-50',
                )}
              >
                <span className="text-sm">{habit.label}</span>
                <Badge
                  variant={
                    habit.record?.status === 'completed'
                      ? 'success'
                      : habit.record?.status === 'skipped'
                        ? 'destructive'
                        : 'outline'
                  }
                >
                  {habit.record?.status || 'pending'}
                </Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
