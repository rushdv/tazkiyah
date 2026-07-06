import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export const habitRepository = {
  async findAll() {
    return prisma.habit.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findBySlug(slug: string) {
    return prisma.habit.findUnique({
      where: { slug: slug as Prisma.EnumHabitSlugFilter['equals'] },
    });
  },

  async upsertMany(habits: { slug: string; label: string; icon: string; description: string; targetMinutes: number | null; sortOrder: number }[]) {
    for (const habit of habits) {
      await prisma.habit.upsert({
        where: { slug: habit.slug as any },
        update: { label: habit.label, icon: habit.icon, description: habit.description, targetMinutes: habit.targetMinutes, sortOrder: habit.sortOrder },
        create: { slug: habit.slug as any, label: habit.label, icon: habit.icon, description: habit.description, targetMinutes: habit.targetMinutes, sortOrder: habit.sortOrder },
      });
    }
  },
};
