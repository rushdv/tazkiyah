import { useState, useEffect } from 'react';
import { useDashboard } from '@/hooks/use-dashboard';
import { HabitCard } from '@/components/habits/habit-card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Flame, Quote, BookHeart, Info, HeartHandshake, ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays, addDays, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

const moodOptions = [
  { id: 'excellent', label: 'Excellent', icon: '😊', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-600' },
  { id: 'good', label: 'Good', icon: '🙂', color: 'border-green-500 bg-green-500/10 text-green-600' },
  { id: 'okay', label: 'Okay', icon: '😐', color: 'border-amber-500 bg-amber-500/10 text-amber-600' },
  { id: 'difficult', label: 'Difficult', icon: '😔', color: 'border-orange-500 bg-orange-500/10 text-orange-600' },
] as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const { dashboard, isLoading, updateHabit, isUpdating, saveReflection, isSavingReflection } = useDashboard(selectedDate);

  const [selectedMood, setSelectedMood] = useState<'excellent' | 'good' | 'okay' | 'difficult' | null>(null);
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [reflectionImprovement, setReflectionImprovement] = useState('');

  const isToday = selectedDate === todayStr;

  useEffect(() => {
    if (dashboard?.reflection) {
      setSelectedMood(dashboard.reflection.mood as any);
      setReflectionNotes(dashboard.reflection.notes || '');
      setReflectionImprovement(dashboard.reflection.improvement || '');
    } else {
      setSelectedMood(null);
      setReflectionNotes('');
      setReflectionImprovement('');
    }
  }, [dashboard?.reflection, selectedDate]);

  function handlePrevDay() {
    const current = parseISO(selectedDate);
    setSelectedDate(format(subDays(current, 1), 'yyyy-MM-dd'));
  }

  function handleNextDay() {
    if (isToday) return;
    const current = parseISO(selectedDate);
    setSelectedDate(format(addDays(current, 1), 'yyyy-MM-dd'));
  }

  function handleSaveReflection() {
    if (!selectedMood) return;
    saveReflection({
      date: selectedDate,
      mood: selectedMood,
      notes: reflectionNotes || null,
      improvement: reflectionImprovement || null,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const completedHabitsCount = dashboard.habits.filter((h) => h.record?.status === 'completed').length;
  const displayDateObj = parseISO(selectedDate + 'T00:00:00Z');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Header Greeting & Date Selector Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider text-accent uppercase">
            As-salamu alaykum, {user?.name || 'Friend'}
          </span>
          <div className="flex items-center gap-3 mt-0.5">
            <h1 className="text-3xl font-bold tracking-tight">
              {isToday ? "Today's Journey" : 'Daily Journey'}
            </h1>
            {!isToday && (
              <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-xs">
                Past Date Record
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(displayDateObj, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Date Selector Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl shadow-xs">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handlePrevDay}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Previous Day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5 px-1">
              <Calendar className="h-3.5 w-3.5 text-accent" />
              <Input
                type="date"
                value={selectedDate}
                max={todayStr}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="h-7 w-[130px] text-xs px-2 py-0 border-0 bg-transparent focus-visible:ring-0 font-medium"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isToday}
              onClick={handleNextDay}
              className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
              title="Next Day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {!isToday && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(todayStr)}
              className="h-9 px-3 text-xs gap-1.5 font-medium"
            >
              <RotateCcw className="h-3.5 w-3.5 text-accent" />
              Go to Today
            </Button>
          )}

          <Badge variant="secondary" className="text-xs px-3 py-2 font-medium gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Flame className="h-4 w-4 fill-current text-amber-500" />
            {dashboard.streaks.currentStreak} Day Streak
          </Badge>
        </div>
      </div>

      {/* Main Grid: Left Habits List / Right Sidebar Metrics */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Habits List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <span>Active Habits</span>
              <span className="text-xs text-muted-foreground font-normal">
                ({format(displayDateObj, 'MMM d')})
              </span>
            </h2>
            <span className="text-xs text-muted-foreground font-medium">
              {completedHabitsCount} of {dashboard.habits.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {dashboard.habits.map((habit) => (
              <HabitCard
                key={habit.id}
                date={selectedDate}
                habit={habit as any}
                onUpdate={(input) => updateHabit(input as any)}
                isUpdating={isUpdating}
              />
            ))}
          </div>

          {/* End-of-day Reflection Box */}
          <Card className="mt-8 border-accent/20 bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <HeartHandshake className="h-5 w-5 text-accent" />
                Reflection for {format(displayDateObj, 'MMMM d, yyyy')}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Record your state of mind and reflections for this date.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Mood Selection */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">How did this day feel?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {moodOptions.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMood(m.id)}
                      className={cn(
                        'flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all',
                        selectedMood === m.id
                          ? m.color + ' ring-2 ring-accent/30 font-semibold'
                          : 'border-border bg-card hover:bg-muted/50 text-muted-foreground',
                      )}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reflection Notes */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground block">Reflection / What went well?</label>
                <Textarea
                  placeholder="Record your thoughts or gratitude..."
                  value={reflectionNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReflectionNotes(e.target.value)}
                  className="text-xs min-h-[60px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground block">What would you like to improve?</label>
                <Textarea
                  placeholder="Small step for future improvement..."
                  value={reflectionImprovement}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReflectionImprovement(e.target.value)}
                  className="text-xs min-h-[60px] resize-none"
                />
              </div>

              <Button
                size="sm"
                onClick={handleSaveReflection}
                disabled={!selectedMood || isSavingReflection}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium"
              >
                {isSavingReflection ? 'Saving...' : `Save Reflection for ${format(displayDateObj, 'MMM d')}`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Daily Progress Card */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Daily Consistency</CardTitle>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {dashboard.completion}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-2 pb-4">
              <ProgressRing progress={dashboard.completion} size={150} />

              <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
                <div className="flex items-start gap-1.5">
                  <Info className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                  <p>
                    Consistency score for {format(displayDateObj, 'MMM d, yyyy')}. Measures habit completion based on target goals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Inspiration */}
          {dashboard.motivation && (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  {dashboard.motivation.type === 'ayah' ? (
                    <BookHeart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Quote className="h-4 w-4 text-amber-500" />
                  )}
                  Daily Reflection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="border-l-2 border-accent pl-3 text-xs leading-relaxed italic text-foreground/90">
                  "{dashboard.motivation.text}"
                </blockquote>
                <p className="mt-2 text-[11px] text-muted-foreground font-medium">
                  — {dashboard.motivation.source}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
