import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Play, Pause, RotateCcw, Plus, Sparkles, Sunrise, Sunset, BookOpen, Dumbbell, GraduationCap, Clock } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { HabitStatus } from '@tazkiyah/shared';

const iconMap: Record<string, React.ReactNode> = {
  sunrise: <Sunrise className="h-5 w-5" />,
  sunset: <Sunset className="h-5 w-5" />,
  'hands-praying': <Sparkles className="h-5 w-5" />,
  'book-open': <BookOpen className="h-5 w-5" />,
  dumbbell: <Dumbbell className="h-5 w-5" />,
  'graduation-cap': <GraduationCap className="h-5 w-5" />,
};

interface HabitCardProps {
  date?: string;
  habit: {
    id: string;
    slug: string;
    label: string;
    icon: string;
    description: string;
    type: 'binary' | 'duration' | 'count' | 'custom';
    targetMinutes?: number | null;
    targetCount?: number | null;
    unit?: string | null;
    effectiveTargetMinutes?: number | null;
    effectiveTargetCount?: number | null;
    record: {
      id?: string;
      status?: HabitStatus;
      completedAt?: string | null;
      notes?: string | null;
      skipReason?: string | null;
      durationMinutes?: number | null;
      actualCount?: number | null;
    } | null;
  };
  onUpdate: (data: {
    habitId: string;
    date: string;
    status: HabitStatus;
    notes?: string | null;
    skipReason?: string | null;
    durationMinutes?: number | null;
    actualCount?: number | null;
  }) => void;
  isUpdating: boolean;
}

export function HabitCard({ date, habit, onUpdate, isUpdating }: HabitCardProps) {
  const cardDate = date || new Date().toISOString().split('T')[0];
  const targetMinutes = habit.effectiveTargetMinutes || habit.targetMinutes || 30;
  const serverDuration = habit.record?.durationMinutes || 0;
  const serverStatus = habit.record?.status || 'pending';

  // Optimistic local state for immediate feedback
  const [optimisticDuration, setOptimisticDuration] = useState<number | null>(null);
  const [optimisticStatus, setOptimisticStatus] = useState<HabitStatus | null>(null);

  useEffect(() => {
    setOptimisticDuration(null);
    setOptimisticStatus(null);
  }, [habit.record?.durationMinutes, habit.record?.status]);

  const activeDuration = optimisticDuration ?? serverDuration;
  const activeStatus = optimisticStatus ?? serverStatus;

  const isCompleted = activeStatus === 'completed';
  const isSkipped = activeStatus === 'skipped';
  const isInProgress = activeStatus === 'in_progress' || (activeDuration > 0 && !isCompleted && !isSkipped);

  // Live Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [customDurationInput, setCustomDurationInput] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  function handleTimerPause() {
    setIsTimerRunning(false);
    const addedMinutes = Math.floor(timerSeconds / 60);
    if (addedMinutes > 0) {
      const newTotal = activeDuration + addedMinutes;
      const newStatus: HabitStatus = newTotal >= targetMinutes ? 'completed' : 'in_progress';
      setOptimisticDuration(newTotal);
      setOptimisticStatus(newStatus);
      onUpdate({
        habitId: habit.id,
        date: cardDate,
        status: newStatus,
        durationMinutes: newTotal,
      });
      setTimerSeconds(timerSeconds % 60);
    }
  }

  function handleQuickAddMinutes(mins: number) {
    const newTotal = activeDuration + mins;
    const newStatus: HabitStatus = newTotal >= targetMinutes ? 'completed' : 'in_progress';
    setOptimisticDuration(newTotal);
    setOptimisticStatus(newStatus);
    onUpdate({
      habitId: habit.id,
      date: cardDate,
      status: newStatus,
      durationMinutes: newTotal,
    });
  }

  function handleSetCustomMinutes() {
    const mins = parseInt(customDurationInput, 10);
    if (isNaN(mins) || mins < 0) return;
    const newStatus: HabitStatus = mins >= targetMinutes ? 'completed' : mins > 0 ? 'in_progress' : 'pending';
    setOptimisticDuration(mins);
    setOptimisticStatus(newStatus);
    onUpdate({
      habitId: habit.id,
      date: cardDate,
      status: newStatus,
      durationMinutes: mins,
    });
    setCustomDurationInput('');
  }

  function handleToggleBinary() {
    const newStatus: HabitStatus = isCompleted ? 'pending' : 'completed';
    setOptimisticStatus(newStatus);
    onUpdate({
      habitId: habit.id,
      date: cardDate,
      status: newStatus,
    });
  }

  const durationPercentage = habit.type === 'duration'
    ? Math.min(100, Math.round((activeDuration / targetMinutes) * 100))
    : isCompleted ? 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-card p-5 transition-all duration-300 relative overflow-hidden',
        isCompleted && 'border-emerald-500/40 bg-emerald-950/10 dark:bg-emerald-950/20',
        isSkipped && 'opacity-60 border-dashed',
        isInProgress && 'border-amber-500/40 bg-amber-950/5 dark:bg-amber-950/10',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left icon + habit metadata */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => habit.type === 'binary' && handleToggleBinary()}
            disabled={habit.type !== 'binary'}
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 mt-0.5',
              isCompleted
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-900/30'
                : isInProgress
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-500'
                : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:bg-primary/5',
            )}
          >
            {isCompleted ? (
              <Check className="h-5 w-5 stroke-[2.5]" />
            ) : (
              iconMap[habit.icon] || <Sparkles className="h-5 w-5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base tracking-tight truncate">{habit.label}</h3>
              {isCompleted && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Done
                </span>
              )}
              {isInProgress && !isCompleted && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {durationPercentage}% In Progress
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{habit.description}</p>

            {/* Target and Duration readout */}
            {habit.type === 'duration' && (
              <div className="flex items-center gap-3 mt-2 text-xs font-medium text-muted-foreground">
                <span className={cn(isCompleted ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-foreground')}>
                  {activeDuration} / {targetMinutes} min
                </span>
                {habit.record?.completedAt && (
                  <span className="text-[11px] opacity-80 flex items-center gap-1">
                    <Clock className="h-3 w-3 inline" />
                    {formatTime(habit.record.completedAt)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Button for Binary Habits */}
        {habit.type === 'binary' && (
          <Button
            type="button"
            size="sm"
            variant={isCompleted ? 'outline' : 'default'}
            onClick={handleToggleBinary}
            className={cn(
              'shrink-0 h-9 px-4 font-medium transition-all',
              !isCompleted && 'bg-primary hover:bg-primary/90 text-primary-foreground',
            )}
          >
            {isCompleted ? 'Completed ✓' : 'Mark Done'}
          </Button>
        )}
      </div>

      {/* Progress Bar for Duration Habits */}
      {habit.type === 'duration' && (
        <div className="mt-4 space-y-2">
          <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${durationPercentage}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={cn(
                'h-full transition-all duration-300',
                isCompleted
                  ? 'bg-emerald-600 dark:bg-emerald-500'
                  : 'bg-gradient-to-r from-amber-500 to-emerald-600',
              )}
            />
          </div>

          {/* Controls: Live Timer & Quick Increments */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Live timer controls */}
            <div className="flex items-center gap-1.5 bg-muted/30 dark:bg-muted/20 p-1 rounded-lg border border-border/50">
              {!isTimerRunning ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsTimerRunning(true)}
                  className="h-7 px-2.5 text-xs gap-1 hover:bg-emerald-500/10 hover:text-emerald-600"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start Timer</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleTimerPause}
                  className="h-7 px-2.5 text-xs gap-1 text-amber-600 hover:bg-amber-500/10"
                >
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Pause ({Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s)</span>
                </Button>
              )}

              {timerSeconds > 0 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(0);
                  }}
                  className="h-7 w-7 text-muted-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Quick Increment Buttons */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleQuickAddMinutes(5)}
                className="h-7 px-2.5 text-xs font-semibold hover:bg-emerald-500/10 hover:border-emerald-500/40"
              >
                +5m
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleQuickAddMinutes(10)}
                className="h-7 px-2.5 text-xs font-semibold hover:bg-emerald-500/10 hover:border-emerald-500/40"
              >
                +10m
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleQuickAddMinutes(15)}
                className="h-7 px-2.5 text-xs font-semibold hover:bg-emerald-500/10 hover:border-emerald-500/40"
              >
                +15m
              </Button>

              {/* Direct Duration Input Toggle */}
              <div className="flex items-center gap-1 ml-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={customDurationInput}
                  onChange={(e) => setCustomDurationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSetCustomMinutes()}
                  className="h-7 w-14 text-xs px-2 text-center"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleSetCustomMinutes}
                  disabled={!customDurationInput}
                  className="h-7 w-7"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
