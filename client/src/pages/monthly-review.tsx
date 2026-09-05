import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, TrendingUp, Flame, BookOpen, Dumbbell, GraduationCap, ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MonthlyAnalytics, ApiResponse } from '@tazkiyah/shared';
import { toast } from 'sonner';

export default function MonthlyReviewPage() {
  const navigate = useNavigate();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['monthly-review', year, month],
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<MonthlyAnalytics>>(`/records/analytics/${year}/${month}`);
      return res.data!;
    },
  });

  function handlePrevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function handleNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function formatMinutesToHours(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  }

  async function handleGeneratePdfReport() {
    try {
      setIsGenerating(true);
      const title = `${format(new Date(year, month - 1), 'MMMM yyyy')} Progress Report`;
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const daysInMonth = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

      await api.post('/reports/generate', {
        title,
        periodType: 'monthly',
        startDate,
        endDate,
      });

      toast.success('Report snapshot created!');
      navigate('/reports');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const monthDate = new Date(year, month - 1);
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  // Find lowest consistent habit for improvement area
  const sortedHabits = [...data.habitBreakdown].sort((a, b) => a.completion - b.completion);
  const lowestHabit = sortedHabits[0];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Tazkiyah Review</span>
          <h1 className="text-3xl font-bold tracking-tight mt-0.5">
            {format(monthDate, 'MMMM yyyy')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your month at a glance — reflection and spiritual progress evaluation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-semibold px-2 min-w-[100px] text-center">
              {format(monthDate, 'MMM yyyy')}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={handleGeneratePdfReport} disabled={isGenerating} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2 text-xs">
            <FileText className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate PDF Report'}
          </Button>
        </div>
      </div>

      {/* Month at a Glance Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="glass-card md:col-span-2 border-emerald-500/30 bg-emerald-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
              Overall Consistency
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-extrabold tracking-tight">{data.completionPercentage}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tracked {data.totalTrackedDays} of {totalDaysInMonth} days this month
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-amber-500 fill-current" />
              <p className="text-3xl font-bold">{data.streaks.currentStreak} Days</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Longest: {data.streaks.longestStreak} days</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Best Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {data.mostConsistentWeek ? `Week ${data.mostConsistentWeek.week}` : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.mostConsistentWeek ? `${data.mostConsistentWeek.completion}% Average` : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Duration Totals Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium">Quran Reading</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {formatMinutesToHours(data.quranTotalMinutes || 0)}
            </p>
          </div>
          <BookOpen className="h-7 w-7 text-blue-500/40" />
        </div>

        <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium">Exercise Time</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatMinutesToHours(data.exerciseTotalMinutes || 0)}
            </p>
          </div>
          <Dumbbell className="h-7 w-7 text-emerald-500/40" />
        </div>

        <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium">Islamic Learning</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
              {formatMinutesToHours(data.learningTotalMinutes || 0)}
            </p>
          </div>
          <GraduationCap className="h-7 w-7 text-purple-500/40" />
        </div>
      </div>

      {/* Highlights & Habit Breakdown */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Most Consistent & Improvement Area */}
        <div className="space-y-4">
          <Card className="glass-card border-emerald-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Most Consistent Habit
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.bestHabit ? (
                <div>
                  <h4 className="text-lg font-bold">{data.bestHabit.label}</h4>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    {data.bestHabit.completion}% Completion
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-amber-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Improvement Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowestHabit ? (
                <div>
                  <h4 className="text-lg font-bold">{lowestHabit.habit.label}</h4>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                    {lowestHabit.completion}% Completion
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Habit Breakdown Table */}
        <Card className="glass-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Habit Breakdown</CardTitle>
            <CardDescription className="text-xs">Individual habit performance this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.habitBreakdown.map((item) => (
                <div key={item.habit.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{item.habit.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground font-medium">
                      {item.completedDays} / {totalDaysInMonth} days
                    </span>
                    <Badge variant={item.completion >= 75 ? 'success' : item.completion >= 50 ? 'secondary' : 'outline'}>
                      {item.completion}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
