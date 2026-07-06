import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export const recordRepository = {
  async findByUserAndDate(userId: string, date: Date) {
    return prisma.habitRecord.findMany({
      where: {
        userId,
        date,
      },
      include: { habit: true },
    });
  },

  async findByUserAndDateRange(userId: string, startDate: Date, endDate: Date) {
    return prisma.habitRecord.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { habit: true },
      orderBy: { date: 'asc' },
    });
  },

  async upsert(userId: string, habitId: string, date: Date, data: Prisma.HabitRecordCreateInput) {
    return prisma.habitRecord.upsert({
      where: {
        userId_habitId_date: { userId, habitId, date },
      },
      create: {
        ...data,
        user: { connect: { id: userId } },
        habit: { connect: { id: habitId } },
      } as Prisma.HabitRecordCreateInput,
      update: data as Prisma.HabitRecordUpdateInput,
      include: { habit: true },
    });
  },

  async findById(id: string) {
    return prisma.habitRecord.findUnique({
      where: { id },
      include: { habit: true },
    });
  },

  async update(id: string, data: Prisma.HabitRecordUpdateInput) {
    return prisma.habitRecord.update({
      where: { id },
      data,
      include: { habit: true },
    });
  },

  async findPaginated(userId: string, params: {
    page: number;
    limit: number;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
  }) {
    const where: Prisma.HabitRecordWhereInput = { userId };

    if (params.startDate && params.endDate) {
      where.date = { gte: params.startDate, lte: params.endDate };
    }

    if (params.status && params.status !== 'all') {
      where.status = params.status as Prisma.EnumHabitStatusFilter['equals'];
    }

    const orderBy: Prisma.HabitRecordOrderByWithRelationInput = {};
    if (params.sort === 'date') {
      orderBy.date = params.order || 'desc';
    } else if (params.sort === 'status') {
      orderBy.status = params.order || 'desc';
    } else {
      orderBy.date = 'desc';
    }

    const [data, total] = await Promise.all([
      prisma.habitRecord.findMany({
        where,
        include: { habit: true },
        orderBy,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.habitRecord.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  },

  async getMonthlyData(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return prisma.habitRecord.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { habit: true },
      orderBy: { date: 'asc' },
    });
  },

  async delete(id: string) {
    return prisma.habitRecord.delete({ where: { id } });
  },
};
