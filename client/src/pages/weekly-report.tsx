import { useState } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeeklyReport } from '@/hooks/use-analytics';
import { Download, Printer, CheckCircle2, XCircle, TrendingUp, Award } from 'lucide-react';

export default function WeeklyReportPage() {
  const now = new Date();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const [startDate] = useState(weekStart);
  const [endDate] = useState(weekEnd);

  const { data, isLoading } = useWeeklyReport(startDate, endDate);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Report</h1>
          <p className="text-muted-foreground">
            {format(new Date(startDate), 'MMM d')} - {format(new Date(endDate), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall</p>
                  <p className="text-2xl font-bold">{data.overallCompletion}%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Missed Days</p>
                  <p className="text-2xl font-bold">{data.missedDays}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Award className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Best Day</p>
                  <p className="text-lg font-bold">
                    {data.bestDay ? format(new Date(data.bestDay), 'MMM d') : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4">
                <ProgressRing progress={data.averageCompletion} size={72} strokeWidth={6}>
                  <span className="text-sm font-bold">{data.averageCompletion}%</span>
                </ProgressRing>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Habit Performance</CardTitle>
              <CardDescription>Your daily habit completion this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.habits.map((habitData) => (
                <div key={habitData.habit.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{habitData.habit.label}</span>
                      <Badge variant={habitData.completionPercentage >= 100 ? 'success' : 'secondary'}>
                        {habitData.completedDays}/{habitData.totalDays}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{habitData.completionPercentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${habitData.completionPercentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  {habitData.skippedReasons.length > 0 && (
                    <div className="space-y-1">
                      {habitData.skippedReasons.map((s, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          <XCircle className="mr-1 inline h-3 w-3 text-red-400" />
                          {format(new Date(s.date), 'MMM d')}: {s.reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
}
