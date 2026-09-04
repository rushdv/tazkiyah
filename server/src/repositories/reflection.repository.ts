import { prisma } from '../config/database';

export const reflectionRepository = {
  async findByUserAndDate(userId: string, date: Date) {
    return prisma.reflection.findUnique({
      where: {
        userId_date: { userId, date },
      },
    });
  },

  async upsert(
    userId: string,
    date: Date,
    data: { mood: string; notes?: string | null; improvement?: string | null },
  ) {
    return prisma.reflection.upsert({
      where: {
        userId_date: { userId, date },
      },
      create: {
        userId,
        date,
        mood: data.mood,
        notes: data.notes || null,
        improvement: data.improvement || null,
      },
      update: {
        mood: data.mood,
        notes: data.notes !== undefined ? data.notes : undefined,
        improvement: data.improvement !== undefined ? data.improvement : undefined,
      },
    });
  },

  async findByUserAndDateRange(userId: string, startDate: Date, endDate: Date) {
    return prisma.reflection.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    });
  },
};
