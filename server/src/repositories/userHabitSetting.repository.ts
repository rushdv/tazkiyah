import { prisma } from '../config/database';

export const userHabitSettingRepository = {
  async findByUser(userId: string) {
    return prisma.userHabitSetting.findMany({
      where: { userId },
      include: { habit: true },
    });
  },

  async upsert(
    userId: string,
    habitId: string,
    data: {
      enabled?: boolean;
      customTargetMinutes?: number | null;
      customTargetCount?: number | null;
      sortOrder?: number;
    },
  ) {
    return prisma.userHabitSetting.upsert({
      where: {
        userId_habitId: { userId, habitId },
      },
      create: {
        userId,
        habitId,
        enabled: data.enabled !== undefined ? data.enabled : true,
        customTargetMinutes: data.customTargetMinutes ?? null,
        customTargetCount: data.customTargetCount ?? null,
        sortOrder: data.sortOrder ?? null,
      },
      update: {
        enabled: data.enabled !== undefined ? data.enabled : undefined,
        customTargetMinutes: data.customTargetMinutes !== undefined ? data.customTargetMinutes : undefined,
        customTargetCount: data.customTargetCount !== undefined ? data.customTargetCount : undefined,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : undefined,
      },
      include: { habit: true },
    });
  },

  async upsertMany(
    userId: string,
    settings: {
      habitId: string;
      enabled?: boolean;
      customTargetMinutes?: number | null;
      customTargetCount?: number | null;
      sortOrder?: number;
    }[],
  ) {
    const results = [];
    for (const s of settings) {
      const updated = await this.upsert(userId, s.habitId, s);
      results.push(updated);
    }
    return results;
  },
};
