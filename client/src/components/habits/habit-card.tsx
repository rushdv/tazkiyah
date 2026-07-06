import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, BookOpen, Sunrise, Sunset, Dumbbell, GraduationCap, Sparkles, MessageSquare, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatTime } from '@/lib/utils';
import type { HabitSlug } from '@tazkiyah/shared';

const iconMap: Record<string, React.ReactNode> = {
  sunrise: <Sunrise className="h-5 w-5" />,
  sunset: <Sunset className="h-5 w-5" />,
  'hands-praying': <Sparkles className="h-5 w-5" />,
  'book-open': <BookOpen className="h-5 w-5" />,
  dumbbell: <Dumbbell className="h-5 w-5" />,
  'graduation-cap': <GraduationCap className="h-5 w-5" />,
};

interface HabitCardProps {
  habit: {
    id: string;
    slug: HabitSlug;
    label: string;
    icon: string;
    description: string;
    targetMinutes?: number | null;
    sortOrder: number;
    record: {
      id?: string;
      status?: 'completed' | 'skipped' | 'pending';
      completedAt?: string | null;
      notes?: string | null;
      skipReason?: string | null;
      durationMinutes?: number | null;
    } | null;
  };
  onUpdate: (data: { habitId: string; date: string; status: 'completed' | 'skipped'; notes?: string | null; skipReason?: string | null; durationMinutes?: number | null }) => void;
  isUpdating: boolean;
}

export function HabitCard({ habit, onUpdate, isUpdating }: HabitCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState(habit.record?.notes || '');
  const [skipReason, setSkipReason] = useState(habit.record?.skipReason || '');
  const [duration, setDuration] = useState(habit.record?.durationMinutes?.toString() || '');

  const isCompleted = habit.record?.status === 'completed';
  const isSkipped = habit.record?.status === 'skipped';
  const today = new Date().toISOString().split('T')[0];

  function handleComplete() {
    onUpdate({
      habitId: habit.id,
      date: today,
      status: 'completed',
      notes: notes || null,
      durationMinutes: duration ? parseInt(duration) : null,
    });
    setIsOpen(false);
  }

  function handleSkip() {
    if (!skipReason) return;
    onUpdate({
      habitId: habit.id,
      date: today,
      status: 'skipped',
      skipReason,
    });
    setIsOpen(false);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-card p-4 transition-all duration-300',
        isCompleted && 'ring-1 ring-emerald-500/30',
        isSkipped && 'opacity-60',
      )}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => !isUpdating && !isCompleted && handleComplete()}
          disabled={isUpdating || isCompleted}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
            isCompleted
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-muted-foreground/30 hover:border-primary hover:bg-primary/10',
          )}
        >
          {isCompleted ? (
            <Check className="h-5 w-5" />
          ) : (
            <Check className="h-5 w-5 opacity-0 group-hover:opacity-100" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{iconMap[habit.icon] || <Sparkles className="h-5 w-5" />}</span>
            <h3 className="font-medium truncate">{habit.label}</h3>
          </div>
          {habit.record?.completedAt && (
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Completed at {formatTime(habit.record.completedAt)}
            </p>
          )}
          {habit.record?.durationMinutes && (
            <p className="text-xs text-muted-foreground">{habit.record.durationMinutes} minutes</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted && !isSkipped && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
          {isSkipped && (
            <span className="text-xs text-muted-foreground">Skipped</span>
          )}
        </div>
      </div>

      {isOpen && !isCompleted && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mt-4 space-y-3 border-t border-border pt-3"
        >
          {habit.targetMinutes && (
            <div className="space-y-1">
              <Label className="text-xs">Duration (minutes)</Label>
              <Input
                type="number"
                placeholder={habit.targetMinutes.toString()}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs">Notes</Label>
            <Input
              placeholder="Add a note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleComplete} disabled={isUpdating} className="flex-1">
              <Check className="mr-1 h-4 w-4" /> Complete
            </Button>
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (skipReason) {
                    handleSkip();
                  } else {
                    const reason = prompt('Why are you skipping?');
                    if (reason) {
                      setSkipReason(reason);
                      onUpdate({
                        habitId: habit.id,
                        date: today,
                        status: 'skipped',
                        skipReason: reason,
                      });
                    }
                  }
                }}
                disabled={isUpdating}
              >
                <X className="mr-1 h-4 w-4" /> Skip
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
