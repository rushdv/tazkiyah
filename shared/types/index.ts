export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  theme: Theme;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export type Theme = 'dark' | 'light' | 'system';

export type HabitSlug =
  | 'morning_azkar'
  | 'evening_azkar'
  | 'dua'
  | 'quran'
  | 'exercise'
  | 'islamic_learning';

export interface Habit {
  id: string;
  slug: HabitSlug;
  label: string;
  icon: string;
  description: string;
  targetMinutes?: number;
  sortOrder: number;
}

export type HabitStatus = 'completed' | 'skipped' | 'pending';

export interface HabitRecord {
  id: string;
  userId: string;
  habitId: string;
  date: string;
  status: HabitStatus;
  completedAt: string | null;
  notes: string | null;
  skipReason: string | null;
  durationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
  habit?: Habit;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export interface WeeklyReport {
  startDate: string;
  endDate: string;
  habits: WeeklyHabitData[];
  overallCompletion: number;
  missedDays: number;
  bestDay: string | null;
  worstDay: string | null;
  averageCompletion: number;
}

export interface WeeklyHabitData {
  habit: Habit;
  completedDays: number;
  totalDays: number;
  completionPercentage: number;
  skippedReasons: { date: string; reason: string }[];
}

export interface MonthlyAnalytics {
  month: number;
  year: number;
  streaks: Streak;
  completionPercentage: number;
  dailyData: { date: string; completion: number }[];
  habitBreakdown: { habit: Habit; completion: number }[];
  weeklyTrends: { week: number; completion: number }[];
}

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  target: number;
}

export interface Reminder {
  id: string;
  habitId: string;
  enabled: boolean;
  time: string;
  type: 'fajr' | 'maghrib' | 'custom';
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface DashboardData {
  date: string;
  habits: (Habit & {
    record: HabitRecord | null;
  })[];
  completion: number;
  motivation: MotivationCard | null;
  streaks: Streak;
}

export interface MotivationCard {
  type: 'ayah' | 'hadith';
  text: string;
  source: string;
  translation?: string;
}

export interface DayDetail {
  date: string;
  habits: (Habit & {
    record: HabitRecord | null;
  })[];
  completion: number;
}
