import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Trophy, Star, Award, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const achievementIcons: Record<string, React.ReactNode> = {
  badge: <Award className="h-8 w-8" />,
  star: <Star className="h-8 w-8" />,
  trophy: <Trophy className="h-8 w-8" />,
  flame: <Flame className="h-8 w-8" />,
};

export default function AchievementsPage() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data } = await api.get('/achievements');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">Track your milestones and earn badges</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {achievements?.map((achievement: { slug: string; title: string; description: string; icon: string; targetValue: number; progress: number; unlockedAt: string | null }, index: number) => {
          const isUnlocked = !!achievement.unlockedAt;
          const progressPct = Math.min((achievement.progress / achievement.targetValue) * 100, 100);

          return (
            <motion.div
              key={achievement.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'relative overflow-hidden transition-all',
                  isUnlocked && 'ring-1 ring-amber-500/30',
                  !isUnlocked && 'opacity-70',
                )}
              >
                <CardContent className="text-center">
                  <div
                    className={cn(
                      'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
                      isUnlocked ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isUnlocked ? achievementIcons[achievement.icon] || <Trophy className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                  </div>
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{achievement.description}</p>
                  <div className="mt-3 space-y-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-1000"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Math.min(achievement.progress, achievement.targetValue)} / {achievement.targetValue}
                    </p>
                  </div>
                  {isUnlocked && (
                    <Badge variant="success" className="mt-3">
                      Unlocked
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
