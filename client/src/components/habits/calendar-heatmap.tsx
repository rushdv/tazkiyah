import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';

interface HeatmapProps {
  data: { date: string; completion: number }[];
  onSelectDate?: (date: string) => void;
  selectedDate?: string | null;
  daysCount?: number;
}

export function CalendarHeatmap({ data, onSelectDate, selectedDate, daysCount = 180 }: HeatmapProps) {
  const completionMap = useMemo(() => {
    return new Map<string, number>(data.map((d) => [d.date, d.completion]));
  }, [data]);

  const days = useMemo(() => {
    const today = new Date();
    const start = subDays(today, daysCount - 1);
    return eachDayOfInterval({ start, end: today });
  }, [daysCount]);

  function getHeatmapLevel(completion?: number): string {
    if (completion === undefined || completion <= 0) return 'bg-muted/40 hover:bg-muted/70 border-border/40';
    if (completion < 40) return 'bg-emerald-900/30 border-emerald-800/40 text-emerald-300';
    if (completion < 75) return 'bg-emerald-700/50 border-emerald-600/50 text-emerald-200';
    if (completion < 95) return 'bg-emerald-600 border-emerald-500 text-white';
    return 'bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/20';
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 min-w-max p-1">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const completion = completionMap.get(dateStr);
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onSelectDate?.(dateStr)}
                title={`${format(day, 'MMM d, yyyy')}: ${completion ?? 0}% completed`}
                className={cn(
                  'h-3.5 w-3.5 rounded-sm border transition-all duration-150 transform hover:scale-125 focus:outline-none',
                  getHeatmapLevel(completion),
                  isSelected && 'ring-2 ring-accent ring-offset-1 ring-offset-background scale-110',
                )}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
        <span>Less consistent</span>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-muted/40 border border-border/40" />
          <span className="h-3 w-3 rounded-sm bg-emerald-900/30 border border-emerald-800/40" />
          <span className="h-3 w-3 rounded-sm bg-emerald-700/50 border border-emerald-600/50" />
          <span className="h-3 w-3 rounded-sm bg-emerald-600 border border-emerald-500" />
          <span className="h-3 w-3 rounded-sm bg-emerald-500 border border-emerald-400" />
        </div>
        <span>More consistent</span>
      </div>
    </div>
  );
}
