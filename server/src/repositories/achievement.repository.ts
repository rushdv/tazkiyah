import { prisma } from '../config/database';

export const achievementRepository = {
  async findAllWithUserProgress(userId: string) {
    return prisma.achievement.findMany({
      include: {
        users: {
          where: { userId },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  async findBySlug(slug: string) {
    return prisma.achievement.findUnique({
      where: { slug },
    });
  },

  async upsertProgress(userId: string, achievementId: string, progress: number, targetValue: number) {
    const isUnlocked = progress >= targetValue;
    return prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
      create: {
        userId,
        achievementId,
        progress: Math.min(progress, targetValue),
        unlockedAt: isUnlocked ? new Date() : null,
      },
      update: {
        progress: Math.min(progress, targetValue),
        ...(isUnlocked ? { unlockedAt: new Date() } : {}),
      },
    });
  },
};
