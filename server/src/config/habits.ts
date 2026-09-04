export interface HabitDefinition {
  slug: string;
  label: string;
  icon: string;
  description: string;
  type: 'binary' | 'duration' | 'count' | 'custom';
  targetMinutes: number | null;
  targetCount?: number | null;
  unit?: string | null;
  sortOrder: number;
}

export const DEFAULT_HABITS: HabitDefinition[] = [
  {
    slug: 'morning_azkar',
    label: 'Morning Azkar',
    icon: 'sunrise',
    description: 'Morning remembrance of Allah',
    type: 'binary',
    targetMinutes: null,
    targetCount: null,
    unit: null,
    sortOrder: 1,
  },
  {
    slug: 'evening_azkar',
    label: 'Evening Azkar',
    icon: 'sunset',
    description: 'Evening remembrance of Allah',
    type: 'binary',
    targetMinutes: null,
    targetCount: null,
    unit: null,
    sortOrder: 2,
  },
  {
    slug: 'dua',
    label: 'Dua',
    icon: 'hands-praying',
    description: 'Supplication and personal dua',
    type: 'binary',
    targetMinutes: null,
    targetCount: null,
    unit: null,
    sortOrder: 3,
  },
  {
    slug: 'quran',
    label: 'Quran',
    icon: 'book-open',
    description: 'Reading and reflecting on the Quran',
    type: 'duration',
    targetMinutes: 30,
    targetCount: null,
    unit: 'minutes',
    sortOrder: 4,
  },
  {
    slug: 'exercise',
    label: 'Exercise',
    icon: 'dumbbell',
    description: 'Physical activity for health and strength',
    type: 'duration',
    targetMinutes: 25,
    targetCount: null,
    unit: 'minutes',
    sortOrder: 5,
  },
  {
    slug: 'islamic_learning',
    label: 'Islamic Learning',
    icon: 'graduation-cap',
    description: 'Seeking knowledge of Islam and Deen',
    type: 'duration',
    targetMinutes: 30,
    targetCount: null,
    unit: 'minutes',
    sortOrder: 6,
  },
];
