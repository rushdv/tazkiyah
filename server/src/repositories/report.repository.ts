import { prisma } from '../config/database';

export const reportRepository = {
  async create(data: {
    userId: string;
    title: string;
    periodType: string;
    startDate: Date;
    endDate: Date;
    summaryData: string;
  }) {
    return prisma.report.create({
      data,
    });
  },

  async findByUser(userId: string) {
    return prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.report.findUnique({
      where: { id },
    });
  },

  async delete(id: string) {
    return prisma.report.delete({
      where: { id },
    });
  },
};
