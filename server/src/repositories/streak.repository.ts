import { prisma } from '../config/database';

export const streakRepository = {
  async upsert(userId: string, currentStreak: number, longestStreak: number, lastActivityDate: Date) {
    return prisma.streak.upsert({
      where: { userId },
      create: {
        userId,
        currentStreak,
        longestStreak,
        lastActivityDate,
      },
      update: {
        currentStreak,
        longestStreak,
        lastActivityDate,
      },
    });
  },

  async get(userId: string) {
    return prisma.streak.findUnique({
      where: { userId },
    });
  },
};
