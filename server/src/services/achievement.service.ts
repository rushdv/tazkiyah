import { achievementRepository } from '../repositories/achievement.repository';
import { streakRepository } from '../repositories/streak.repository';

export const achievementService = {
  async getUserAchievements(userId: string) {
    const achievements = await achievementRepository.findAllWithUserProgress(userId);

    return achievements.map((a) => {
      const userProg = a.users[0];
      return {
        slug: a.slug,
        title: a.title,
        description: a.description,
        icon: a.icon,
        targetValue: a.targetValue,
        progress: userProg?.progress || 0,
        unlockedAt: userProg?.unlockedAt ? userProg.unlockedAt.toISOString() : null,
      };
    });
  },

  async checkAndUnlockAchievements(userId: string) {
    const streaks = await streakRepository.get(userId);
    const currentStreak = streaks?.currentStreak || 0;

    const achievements = await achievementRepository.findAllWithUserProgress(userId);

    for (const achievement of achievements) {
      let progress = 0;
      if (achievement.slug === '7_day_streak' || achievement.slug === '30_day_streak' || achievement.slug === '100_day_streak') {
        progress = currentStreak;
      } else if (achievement.slug === 'perfect_week' && currentStreak >= 7) {
        progress = 7;
      } else if (achievement.slug === 'perfect_month' && currentStreak >= 30) {
        progress = 30;
      } else {
        const userProg = achievement.users[0];
        progress = userProg?.progress || 0;
      }

      await achievementRepository.upsertProgress(userId, achievement.id, progress, achievement.targetValue);
    }
  },
};
