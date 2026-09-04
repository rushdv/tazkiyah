import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useMonthlyAnalytics } from '@/hooks/use-analytics';
import { Flame, Trophy, TrendingUp, CalendarDays, BookOpen, Dumbbell, GraduationCap, ArrowUpRight, ArrowDownRight, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import type { MonthlyAnalytics } from '@tazkiyah/shared';

export default function AnalyticsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading } = useMonthlyAnalytics(year, month);
  const analytics = data as MonthlyAnalytics | undefined;

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
      {/* Header Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Evaluate long-term consistency, duration trends, and month-over-month growth.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-xl shadow-xs">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 text-sm font-semibold px-2 min-w-[130px] justify-center">
            <CalendarDays className="h-4 w-4 text-accent" />
            <span>{format(new Date(year, month - 1), 'MMMM yyyy')}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {analytics && (
        <>
          {/* Top Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Overall Consistency</p>
                  <p className="text-2xl font-bold">{analytics.completionPercentage}%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Current Streak</p>
                  <p className="text-2xl font-bold">{analytics.streaks.currentStreak} Days</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Longest Streak</p>
                  <p className="text-2xl font-bold">{analytics.streaks.longestStreak} Days</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="flex items-center gap-4 pt-6">
                <ProgressRing progress={analytics.completionPercentage} size={56} strokeWidth={5}>
                  <span className="text-xs font-bold">{analytics.completionPercentage}%</span>
                </ProgressRing>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Days Tracked</p>
                  <p className="text-xl font-bold">{analytics.totalTrackedDays} Days</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Totals & Best Highlights */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="glass-card border-blue-500/20 bg-blue-950/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Quran Total</span>
                  <p className="text-xl font-bold mt-0.5">{formatMinutesToHours(analytics.quranTotalMinutes || 0)}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500/40" />
              </CardContent>
            </Card>

            <Card className="glass-card border-emerald-500/20 bg-emerald-950/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Exercise Total</span>
                  <p className="text-xl font-bold mt-0.5">{formatMinutesToHours(analytics.exerciseTotalMinutes || 0)}</p>
                </div>
                <Dumbbell className="h-8 w-8 text-emerald-500/40" />
              </CardContent>
            </Card>

            <Card className="glass-card border-purple-500/20 bg-purple-950/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Islamic Learning</span>
                  <p className="text-xl font-bold mt-0.5">{formatMinutesToHours(analytics.learningTotalMinutes || 0)}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-500/40" />
              </CardContent>
            </Card>
          </div>

          {/* Month-over-Month Comparison Cards */}
          {analytics.comparison && (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Month-over-Month Comparison</CardTitle>
                <CardDescription className="text-xs">
                  Comparing current month progress with previous month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Overall Consistency</span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{analytics.comparison.completionPercentage.current}%</span>
                      <span className={`text-xs font-semibold flex items-center ${analytics.comparison.completionPercentage.trend === 'up' ? 'text-emerald-500' : analytics.comparison.completionPercentage.trend === 'down' ? 'text-rose-500' : 'text-muted-foreground'}`}>
                        {analytics.comparison.completionPercentage.trend === 'up' && <ArrowUpRight className="h-4 w-4 mr-0.5" />}
                        {analytics.comparison.completionPercentage.trend === 'down' && <ArrowDownRight className="h-4 w-4 mr-0.5" />}
                        {analytics.comparison.completionPercentage.trend === 'same' && <Minus className="h-4 w-4 mr-0.5" />}
                        {analytics.comparison.completionPercentage.delta > 0 ? `+${analytics.comparison.completionPercentage.delta}%` : `${analytics.comparison.completionPercentage.delta}%`}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Previous: {analytics.comparison.completionPercentage.previous}%</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Quran Reading</span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{formatMinutesToHours(analytics.comparison.quranMinutes.current)}</span>
                      <span className={`text-xs font-semibold flex items-center ${analytics.comparison.quranMinutes.trend === 'up' ? 'text-emerald-500' : analytics.comparison.quranMinutes.trend === 'down' ? 'text-rose-500' : 'text-muted-foreground'}`}>
                        {analytics.comparison.quranMinutes.trend === 'up' && <ArrowUpRight className="h-4 w-4 mr-0.5" />}
                        {analytics.comparison.quranMinutes.trend === 'down' && <ArrowDownRight className="h-4 w-4 mr-0.5" />}
                        {analytics.comparison.quranMinutes.delta >= 0 ? `+${analytics.comparison.quranMinutes.delta}m` : `${analytics.comparison.quranMinutes.delta}m`}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Previous: {formatMinutesToHours(analytics.comparison.quranMinutes.previous)}</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Exercise Time</span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{formatMinutesToHours(analytics.comparison.exerciseMinutes.current)}</span>
                      <span className={`text-xs font-semibold flex items-center ${analytics.comparison.exerciseMinutes.trend === 'up' ? 'text-emerald-500' : analytics.comparison.exerciseMinutes.trend === 'down' ? 'text-rose-500' : 'text-muted-foreground'}`}>
                        {analytics.comparison.exerciseMinutes.trend === 'up' && <ArrowUpRight className="h-4 w-4 mr-0.5" />}
                        {analytics.comparison.exerciseMinutes.trend === 'down' && <ArrowDownRight className="h-4 w-4 mr-0.5" />}
                        {analytics.comparison.exerciseMinutes.delta >= 0 ? `+${analytics.comparison.exerciseMinutes.delta}m` : `${analytics.comparison.exerciseMinutes.delta}m`}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Previous: {formatMinutesToHours(analytics.comparison.exerciseMinutes.previous)}</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Islamic Learning</span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{formatMinutesToHours(analytics.comparison.learningMinutes.current)}</span>
                      <span className={`text-xs font-semibold flex items-center ${analytics.comparison.learningMinutes.trend === 'up' ? 'text-emerald-500' : analytics.comparison.learningMinutes.trend === 'down' ? 'text-rose-500' : 'text-muted-foreground'}`}>
                        {analytics.comparison.learningMinutes.trend === 'up' && <ArrowUpRight className="h-4 w-4 mr-0.5" />}
                        {analytics.comparison.learningMinutes.trend === 'down' && <ArrowDownRight className="h-4 w-4 mr-0.5" />}
                        {analytics.comparison.learningMinutes.delta >= 0 ? `+${analytics.comparison.learningMinutes.delta}m` : `${analytics.comparison.learningMinutes.delta}m`}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Previous: {formatMinutesToHours(analytics.comparison.learningMinutes.previous)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Daily Consistency Trend</CardTitle>
                <CardDescription className="text-xs">Daily progress metrics across the month</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => format(new Date(v), 'd')}
                        className="text-xs text-muted-foreground"
                      />
                      <YAxis className="text-xs text-muted-foreground" domain={[0, 100]} />
                      <Tooltip
                        labelFormatter={(v) => format(new Date(v), 'MMM d, yyyy')}
                        formatter={(value: number) => [`${value}%`, 'Daily Consistency']}
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="completion" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Habit Breakdown</CardTitle>
                <CardDescription className="text-xs">Completion percentage per habit</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={analytics.habitBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                      <XAxis type="number" domain={[0, 100]} className="text-xs text-muted-foreground" />
                      <YAxis dataKey="habit.label" type="category" width={110} className="text-xs text-muted-foreground" />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, 'Completion']}
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="completion" fill="#22c55e" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Weekly Consistency Trend</CardTitle>
                <CardDescription className="text-xs">Average completion percentage per week</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.weeklyTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                      <XAxis dataKey="week" tickFormatter={(v) => `Week ${v}`} className="text-xs text-muted-foreground" />
                      <YAxis domain={[0, 100]} className="text-xs text-muted-foreground" />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, 'Weekly Average']}
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="completion"
                        stroke="var(--primary)"
                        strokeWidth={2.5}
                        dot={{ fill: 'var(--primary)', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </motion.div>
  );
}
