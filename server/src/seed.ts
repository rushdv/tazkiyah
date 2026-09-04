import { prisma } from './config/database';
import { connectDatabase, disconnectDatabase } from './config/database';
import { DEFAULT_HABITS } from './config/habits';

export async function seed() {
  await connectDatabase();

  console.log('[Seed] Creating default habits...');
  for (const h of DEFAULT_HABITS) {
    await prisma.habit.upsert({
      where: { slug: h.slug },
      update: {
        label: h.label,
        icon: h.icon,
        description: h.description,
        targetMinutes: h.targetMinutes,
        sortOrder: h.sortOrder,
      },
      create: {
        slug: h.slug,
        label: h.label,
        icon: h.icon,
        description: h.description,
        targetMinutes: h.targetMinutes,
        sortOrder: h.sortOrder,
      },
    });
  }

  const achievements = [
    { slug: '7_day_streak', title: '7-Day Streak', description: 'Complete all habits for 7 consecutive days', icon: 'badge', targetValue: 7 },
    { slug: '30_day_streak', title: '30-Day Streak', description: 'Complete all habits for 30 consecutive days', icon: 'badge', targetValue: 30 },
    { slug: '100_day_streak', title: '100-Day Streak', description: 'Complete all habits for 100 consecutive days', icon: 'badge', targetValue: 100 },
    { slug: 'perfect_week', title: 'Perfect Week', description: 'Complete all habits for an entire week', icon: 'star', targetValue: 7 },
    { slug: 'perfect_month', title: 'Perfect Month', description: 'Complete all habits for an entire month', icon: 'trophy', targetValue: 30 },
  ];

  console.log('[Seed] Creating achievements...');
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { slug: a.slug },
      update: a,
      create: a,
    });
  }

  console.log('[Seed] Complete!');
  await disconnectDatabase();
}

seed().catch((e) => {
  console.error('[Seed] Error:', e);
  process.exit(1);
});
