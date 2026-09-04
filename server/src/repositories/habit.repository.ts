import { prisma } from '../config/database';

export const habitRepository = {
  async findAll() {
    return prisma.habit.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findBySlug(slug: string) {
    return prisma.habit.findUnique({
      where: { slug },
    });
  },

  async upsertMany(
    habits: {
      slug: string;
      label: string;
      icon: string;
      description: string;
      type?: string;
      targetMinutes?: number | null;
      targetCount?: number | null;
      unit?: string | null;
      sortOrder: number;
    }[],
  ) {
    for (const habit of habits) {
      const data = {
        label: habit.label,
        icon: habit.icon,
        description: habit.description,
        type: habit.type || 'binary',
        targetMinutes: habit.targetMinutes ?? null,
        targetCount: habit.targetCount ?? null,
        unit: habit.unit ?? null,
        sortOrder: habit.sortOrder,
      };

      await prisma.habit.upsert({
        where: { slug: habit.slug },
        update: data,
        create: { slug: habit.slug, ...data },
      });
    }
  },
};
