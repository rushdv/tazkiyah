import { HabitSlug } from '@prisma/client';

interface HabitDefinition {
  slug: HabitSlug;
  label: string;
  icon: string;
  description: string;
  targetMinutes: number | null;
  sortOrder: number;
}

export const DEFAULT_HABITS: HabitDefinition[] = [
  {
    slug: 'morning_azkar',
    label: 'Morning Azkar',
    icon: 'sunrise',
    description: 'Morning remembrance of Allah',
    targetMinutes: 10,
    sortOrder: 1,
  },
  {
    slug: 'evening_azkar',
    label: 'Evening Azkar',
    icon: 'sunset',
    description: 'Evening remembrance of Allah',
    targetMinutes: 10,
    sortOrder: 2,
  },
  {
    slug: 'dua',
    label: 'Dua',
    icon: 'hands-praying',
    description: 'Supplication and making dua',
    targetMinutes: 5,
    sortOrder: 3,
  },
  {
    slug: 'quran',
    label: 'Quran (30 min)',
    icon: 'book-open',
    description: 'Reading and reflecting on the Quran',
    targetMinutes: 30,
    sortOrder: 4,
  },
  {
    slug: 'exercise',
    label: 'Exercise (25 min)',
    icon: 'dumbbell',
    description: 'Physical exercise for a healthy body',
    targetMinutes: 25,
    sortOrder: 5,
  },
  {
    slug: 'islamic_learning',
    label: 'Islamic Learning (30 min)',
    icon: 'graduation-cap',
    description: 'Seeking knowledge of Islam',
    targetMinutes: 30,
    sortOrder: 6,
  },
];
