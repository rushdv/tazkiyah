import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dailyRecordRepository = {
  async findByUserAndDate(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    return prisma.dailyRecord.findUnique({
      where: {
        userId_date: {
          userId,
          date: startOfDay,
        },
      },
    });
  },

  async upsert(
    userId: string,
    date: Date,
    data: {
      isSubmitted?: boolean;
      submittedAt?: Date | null;
      completionPercentage?: number;
      overallNote?: string | null;
    },
  ) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    return prisma.dailyRecord.upsert({
      where: {
        userId_date: {
          userId,
          date: startOfDay,
        },
      },
      create: {
        userId,
        date: startOfDay,
        isSubmitted: data.isSubmitted ?? false,
        submittedAt: data.submittedAt ?? null,
        completionPercentage: data.completionPercentage ?? 0,
        overallNote: data.overallNote ?? null,
      },
      update: {
        ...(data.isSubmitted !== undefined && { isSubmitted: data.isSubmitted }),
        ...(data.submittedAt !== undefined && { submittedAt: data.submittedAt }),
        ...(data.completionPercentage !== undefined && { completionPercentage: data.completionPercentage }),
        ...(data.overallNote !== undefined && { overallNote: data.overallNote }),
      },
    });
  },

  async findRangeByUser(userId: string, startDate: Date, endDate: Date) {
    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    return prisma.dailyRecord.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });
  },
};
