import { recordRepository } from '../repositories/record.repository';
import { streakRepository } from '../repositories/streak.repository';
import { habitRepository } from '../repositories/habit.repository';
import { AppError } from '../utils/response';
import { HabitRecordCreateInput, HabitRecordUpdateInput } from '@tazkiyah/shared';
import { getDailyMotivation, MotivationCard } from '../utils/motivation';
import { achievementService } from './achievement.service';

export const recordService = {
  async getToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const habits = await habitRepository.findAll();
    const records = await recordRepository.findByUserAndDate(userId, today);

    const recordsMap = new Map(records.map((r) => [r.habitId, r]));

    const habitsWithRecords = habits.map((habit) => ({
      id: habit.id,
      slug: habit.slug,
      label: habit.label,
      icon: habit.icon,
      description: habit.description,
      targetMinutes: habit.targetMinutes,
      sortOrder: habit.sortOrder,
      record: recordsMap.get(habit.id) || null,
    }));

    const completedCount = records.filter((r) => r.status === 'completed').length;
    const completion = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

    const streaks = await streakRepository.get(userId);
    const motivation = getDailyMotivation();

    return {
      date: today.toISOString().split('T')[0],
      habits: habitsWithRecords,
      completion,
      motivation,
      streaks: streaks || { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
    };
  },

  async upsertRecord(userId: string, input: HabitRecordCreateInput) {
    const date = new Date(input.date + 'T00:00:00Z');

    const record = await recordRepository.upsert(userId, input.habitId, date, {
      status: input.status,
      completedAt: input.completedAt ? new Date(input.completedAt) : input.status === 'completed' ? new Date() : null,
      notes: input.notes || null,
      skipReason: input.skipReason || null,
      durationMinutes: input.durationMinutes || null,
      date,
      userId,
      habitId: input.habitId,
    } as any);

    await this.updateStreaks(userId, date);
    await achievementService.checkAndUnlockAchievements(userId);

    return record;
  },

  async updateRecord(userId: string, recordId: string, input: HabitRecordUpdateInput) {
    const existing = await recordRepository.findById(recordId);
    if (!existing || existing.userId !== userId) {
      throw new AppError('Record not found', 404);
    }

    const updateData: Record<string, unknown> = {};
    if (input.status) updateData.status = input.status;
    if (input.completedAt !== undefined) updateData.completedAt = input.completedAt ? new Date(input.completedAt) : null;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.skipReason !== undefined) updateData.skipReason = input.skipReason;
    if (input.durationMinutes !== undefined) updateData.durationMinutes = input.durationMinutes;

    const updated = await recordRepository.update(recordId, updateData as any);

    await this.updateStreaks(userId, existing.date);
    await achievementService.checkAndUnlockAchievements(userId);

    return updated;
  },

  async getDayDetail(userId: string, dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00Z');
    const habits = await habitRepository.findAll();
    const records = await recordRepository.findByUserAndDate(userId, date);

    const recordsMap = new Map(records.map((r) => [r.habitId, r]));

    const habitsWithRecords = habits.map((habit) => ({
      id: habit.id,
      slug: habit.slug,
      label: habit.label,
      icon: habit.icon,
      description: habit.description,
      targetMinutes: habit.targetMinutes,
      sortOrder: habit.sortOrder,
      record: recordsMap.get(habit.id) || null,
    }));

    const completedCount = records.filter((r) => r.status === 'completed').length;
    const completion = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

    return {
      date: dateStr,
      habits: habitsWithRecords,
      completion,
    };
  },

  async getHistory(userId: string, params: {
    page: number;
    limit: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
  }) {
    const queryParams: Record<string, unknown> = { ...params, userId };

    if (params.startDate) {
      queryParams.startDate = new Date(params.startDate + 'T00:00:00Z');
    }
    if (params.endDate) {
      queryParams.endDate = new Date(params.endDate + 'T23:59:59Z');
    }

    return recordRepository.findPaginated(userId, queryParams as Parameters<typeof recordRepository.findPaginated>[1]);
  },

  async getMonthlyAnalytics(userId: string, year: number, month: number) {
    const records = await recordRepository.getMonthlyData(userId, year, month);
    const habits = await habitRepository.findAll();

    const dailyMap = new Map<string, { total: number; completed: number }>();
    const habitCounts = new Map<string, { total: number; completed: number }>();

    habits.forEach((h) => habitCounts.set(h.id, { total: 0, completed: 0 }));

    records.forEach((r) => {
      const dateStr = r.date.toISOString().split('T')[0];
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { total: habits.length, completed: 0 });
      }
      const day = dailyMap.get(dateStr)!;
      if (r.status === 'completed') day.completed++;

      const habitCount = habitCounts.get(r.habitId);
      if (habitCount) {
        habitCount.total++;
        if (r.status === 'completed') habitCount.completed++;
      }
    });

    const dailyData = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        completion: Math.round((data.completed / data.total) * 100),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const habitBreakdown = habits.map((h) => {
      const count = habitCounts.get(h.id);
      return {
        habit: h,
        completion: count && count.total > 0 ? Math.round((count.completed / count.total) * 100) : 0,
      };
    });

    const weeks = Math.ceil(dailyData.length / 7);
    const weeklyTrends = Array.from({ length: weeks }, (_, i) => {
      const weekData = dailyData.slice(i * 7, (i + 1) * 7);
      const avg = weekData.reduce((sum, d) => sum + d.completion, 0) / weekData.length;
      return { week: i + 1, completion: Math.round(avg) };
    });

    const allCompleted = records.filter((r) => r.status === 'completed').length;
    const totalPossible = habits.length * (new Date(year, month, 0).getDate());
    const completionPercentage = totalPossible > 0 ? Math.round((allCompleted / totalPossible) * 100) : 0;

    const streaks = await streakRepository.get(userId);

    return {
      month,
      year,
      streaks: streaks || { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
      completionPercentage,
      dailyData,
      habitBreakdown,
      weeklyTrends,
    };
  },

  async getWeeklyReport(userId: string, startDate: string, endDate: string) {
    const start = new Date(startDate + 'T00:00:00Z');
    const end = new Date(endDate + 'T23:59:59Z');

    const records = await recordRepository.findByUserAndDateRange(userId, start, end);
    const habits = await habitRepository.findAll();

    const habitsMap = new Map(habits.map((h) => [h.id, h]));

    const dailyCompletion = new Map<string, { total: number; completed: number }>();
    const habitData = new Map<string, { completed: number; skippedReasons: { date: string; reason: string }[] }>();

    habits.forEach((h) => {
      habitData.set(h.id, { completed: 0, skippedReasons: [] });
    });

    let totalDays = 0;
    const daySet = new Set<string>();

    records.forEach((r) => {
      const dateStr = r.date.toISOString().split('T')[0];
      daySet.add(dateStr);

      if (!dailyCompletion.has(dateStr)) {
        dailyCompletion.set(dateStr, { total: habits.length, completed: 0 });
      }
      const day = dailyCompletion.get(dateStr)!;

      const hd = habitData.get(r.habitId);
      if (hd) {
        if (r.status === 'completed') {
          day.completed++;
          hd.completed++;
        } else if (r.status === 'skipped' && r.skipReason) {
          hd.skippedReasons.push({ date: dateStr, reason: r.skipReason });
        }
      }
    });

    totalDays = daySet.size;

    const weeklyHabitsData = habits.map((h) => {
      const hd = habitData.get(h.id);
      return {
        habit: h,
        completedDays: hd?.completed || 0,
        totalDays: totalDays || 1,
        completionPercentage: totalDays > 0 ? Math.round(((hd?.completed || 0) / totalDays) * 100) : 0,
        skippedReasons: hd?.skippedReasons || [],
      };
    });

    const overallCompleted = Array.from(dailyCompletion.values()).filter((d) => d.completed === d.total).length;
    const overallCompletion = totalDays > 0 ? Math.round((overallCompleted / totalDays) * 100) : 0;

    let bestDay: string | null = null;
    let worstDay: string | null = null;
    let bestCompletion = 0;
    let worstCompletion = 101;

    dailyCompletion.forEach((data, date) => {
      const pct = Math.round((data.completed / data.total) * 100);
      if (pct > bestCompletion) {
        bestCompletion = pct;
        bestDay = date;
      }
      if (pct < worstCompletion) {
        worstCompletion = pct;
        worstDay = date;
      }
    });

    const totalCompletions = Array.from(dailyCompletion.values()).reduce((s, d) => s + d.completed, 0);
    const averageCompletion = totalDays > 0 ? Math.round(totalCompletions / totalDays) : 0;

    return {
      startDate,
      endDate,
      habits: weeklyHabitsData,
      overallCompletion,
      missedDays: totalDays - overallCompleted,
      bestDay,
      worstDay,
      averageCompletion,
    };
  },

  async updateStreaks(userId: string, activityDate: Date) {
    const habits = await habitRepository.findAll();
    const records = await recordRepository.findByUserAndDate(userId, activityDate);
    const completedCount = records.filter((r) => r.status === 'completed').length;

    if (habits.length > 0 && completedCount < habits.length) {
      return;
    }

    const streaks = await streakRepository.get(userId);
    const currentStreak = streaks?.currentStreak || 0;
    const longestStreak = streaks?.longestStreak || 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const lastActivity = streaks?.lastActivityDate
      ? new Date(streaks.lastActivityDate)
      : null;

    let newCurrent = currentStreak;

    if (lastActivity) {
      const diffDays = Math.floor(
        (activityDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        newCurrent = currentStreak + 1;
      } else if (diffDays === 0) {
        newCurrent = Math.max(1, currentStreak);
      } else if (diffDays > 1) {
        newCurrent = 1;
      }
    } else {
      newCurrent = 1;
    }

    const newLongest = Math.max(longestStreak, newCurrent);

    await streakRepository.upsert(userId, newCurrent, newLongest, activityDate);
  },
};

