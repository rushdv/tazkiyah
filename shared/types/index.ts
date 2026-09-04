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
  | 'islamic_learning'
  | string;

export type HabitType = 'binary' | 'duration' | 'count' | 'custom';

export interface Habit {
  id: string;
  slug: HabitSlug;
  label: string;
  icon: string;
  description: string;
  type: HabitType;
  targetMinutes?: number | null;
  targetCount?: number | null;
  unit?: string | null;
  sortOrder: number;
}

export interface UserHabitSetting {
  id: string;
  userId: string;
  habitId: string;
  enabled: boolean;
  customTargetMinutes: number | null;
  customTargetCount: number | null;
  sortOrder: number | null;
}

export type HabitStatus = 'completed' | 'skipped' | 'pending' | 'in_progress';

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
  actualCount: number | null;
  createdAt: string;
  updatedAt: string;
  habit?: Habit;
}

export interface Reflection {
  id: string;
  userId: string;
  date: string;
  mood: 'excellent' | 'good' | 'okay' | 'difficult';
  notes: string | null;
  improvement: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  userId: string;
  title: string;
  periodType: 'monthly' | 'weekly' | 'custom';
  startDate: string;
  endDate: string;
  summaryData: string;
  createdAt: string;
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

export interface MonthOverMonthMetric {
  current: number;
  previous: number;
  delta: number;
  percentageChange: number | null;
  trend: 'up' | 'down' | 'same';
}

export interface MonthOverMonthComparison {
  completionPercentage: MonthOverMonthMetric;
  trackedDays: MonthOverMonthMetric;
  quranMinutes: MonthOverMonthMetric;
  exerciseMinutes: MonthOverMonthMetric;
  learningMinutes: MonthOverMonthMetric;
  streak: MonthOverMonthMetric;
  habitComparison: {
    habitId: string;
    habitSlug: string;
    habitLabel: string;
    currentCompletion: number;
    previousCompletion: number;
    trend: 'up' | 'down' | 'same';
  }[];
}

export interface MonthlyAnalytics {
  month: number;
  year: number;
  streaks: Streak;
  completionPercentage: number;
  totalTrackedDays: number;
  quranTotalMinutes: number;
  exerciseTotalMinutes: number;
  learningTotalMinutes: number;
  bestHabit: { slug: string; label: string; completion: number } | null;
  mostConsistentWeek: { week: number; completion: number } | null;
  dailyData: { date: string; completion: number }[];
  habitBreakdown: { habit: Habit; completion: number; completedDays: number; totalDays: number }[];
  weeklyTrends: { week: number; completion: number }[];
  comparison?: MonthOverMonthComparison;
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

export interface UserSettings {
  id: string;
  userId: string;
  reminderEnabled: boolean;
  duaReminder: boolean;
  quranReminder: boolean;
  dailyReflectionReminder: boolean;
  weekStartDay: 'monday' | 'sunday' | 'saturday';
  language: string;
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
    enabled: boolean;
    effectiveTargetMinutes: number | null;
    effectiveTargetCount: number | null;
    record: HabitRecord | null;
  })[];
  completion: number;
  motivation: MotivationCard | null;
  streaks: Streak;
  reflection: Reflection | null;
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
    enabled: boolean;
    effectiveTargetMinutes: number | null;
    effectiveTargetCount: number | null;
    record: HabitRecord | null;
  })[];
  completion: number;
  reflection: Reflection | null;
}
