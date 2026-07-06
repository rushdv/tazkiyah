import { useDashboard } from '@/hooks/use-dashboard';
import { HabitCard } from '@/components/habits/habit-card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Flame, Quote, BookHeart } from 'lucide-react';
import { motion } from 'framer-motion';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export default function DashboardPage() {
  const { dashboard, isLoading, updateHabit, isUpdating } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Flame className="mr-1 h-4 w-4 text-orange-500" />
            {dashboard.streaks.currentStreak} day streak
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {dashboard.habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onUpdate={updateHabit}
              isUpdating={isUpdating}
            />
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ProgressRing progress={dashboard.completion} size={160} />
              <p className="mt-4 text-sm text-muted-foreground">
                {dashboard.habits.filter((h) => h.record?.status === 'completed').length} of{' '}
                {dashboard.habits.length} completed
              </p>
            </CardContent>
          </Card>

          {dashboard.motivation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  {dashboard.motivation.type === 'ayah' ? (
                    <BookHeart className="h-4 w-4 text-primary" />
                  ) : (
                    <Quote className="h-4 w-4 text-primary" />
                  )}
                  Daily Inspiration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground">
                  "{dashboard.motivation.text}"
                </blockquote>
                <p className="mt-2 text-xs text-muted-foreground">
                  — {dashboard.motivation.source}
                  {dashboard.motivation.translation && ` (${dashboard.motivation.translation})`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
