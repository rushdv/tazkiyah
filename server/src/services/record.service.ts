import { recordRepository } from '../repositories/record.repository';
import { streakRepository } from '../repositories/streak.repository';
import { habitRepository } from '../repositories/habit.repository';
import { reflectionRepository } from '../repositories/reflection.repository';
import { userHabitSettingRepository } from '../repositories/userHabitSetting.repository';
import { AppError } from '../utils/response';
import { HabitRecordCreateInput, HabitRecordUpdateInput } from '@tazkiyah/shared';
import { getDailyMotivation } from '../utils/motivation';
import { achievementService } from './achievement.service';

export const recordService = {
  async getToday(userId: string) {
    const dateStr = new Date().toISOString().split('T')[0];
    const today = new Date(dateStr + 'T00:00:00Z');

    const habits = await habitRepository.findAll();
    const records = await recordRepository.findByUserAndDate(userId, today);
    const userHabitSettings = await userHabitSettingRepository.findByUser(userId);
    const reflection = await reflectionRepository.findByUserAndDate(userId, today);

    const recordsMap = new Map(records.map((r) => [r.habitId, r]));
    const settingsMap = new Map(userHabitSettings.map((s) => [s.habitId, s]));

    const habitsWithRecords = habits
      .map((habit) => {
        const userSetting = settingsMap.get(habit.id);
        const record = recordsMap.get(habit.id) || null;

        const enabled = userSetting ? userSetting.enabled : true;
        const effectiveTargetMinutes = userSetting?.customTargetMinutes ?? habit.targetMinutes ?? null;
        const effectiveTargetCount = userSetting?.customTargetCount ?? habit.targetCount ?? null;
        const effectiveSortOrder = userSetting?.sortOrder ?? habit.sortOrder;

        return {
          id: habit.id,
          slug: habit.slug,
          label: habit.label,
          icon: habit.icon,
          description: habit.description,
          type: habit.type as 'binary' | 'duration' | 'count' | 'custom',
          targetMinutes: habit.targetMinutes,
          targetCount: habit.targetCount,
          unit: habit.unit,
          sortOrder: effectiveSortOrder,
          enabled,
          effectiveTargetMinutes,
          effectiveTargetCount,
          record,
        };
      })
      .filter((h) => h.enabled)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    // Transparent Daily Progress calculation
    let totalProgress = 0;
    habitsWithRecords.forEach((h) => {
      if (!h.record) return;

      if (h.record.status === 'completed') {
        totalProgress += 100;
      } else if (h.record.status === 'in_progress') {
        if (h.type === 'duration' && h.effectiveTargetMinutes && h.record.durationMinutes) {
          const pct = Math.min(100, Math.round((h.record.durationMinutes / h.effectiveTargetMinutes) * 100));
          totalProgress += pct;
        } else if (h.type === 'count' && h.effectiveTargetCount && h.record.actualCount) {
          const pct = Math.min(100, Math.round((h.record.actualCount / h.effectiveTargetCount) * 100));
          totalProgress += pct;
        }
      }
    });

    const completion = habitsWithRecords.length > 0
      ? Math.round(totalProgress / habitsWithRecords.length)
      : 0;

    const streaks = await streakRepository.get(userId);
    const motivation = getDailyMotivation();

    return {
      date: today.toISOString().split('T')[0],
      habits: habitsWithRecords,
      completion,
      motivation,
      streaks: streaks || { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
      reflection,
    };
  },

  async upsertRecord(userId: string, input: HabitRecordCreateInput) {
    const date = new Date(input.date + 'T00:00:00Z');

    const habit = await habitRepository.findBySlug(input.habitId) || null;
    const habitId = habit ? habit.id : input.habitId;

    const record = await recordRepository.upsert(userId, habitId, date, {
      status: input.status,
      completedAt: input.completedAt ? new Date(input.completedAt) : input.status === 'completed' ? new Date() : null,
      notes: input.notes || null,
      skipReason: input.skipReason || null,
      durationMinutes: input.durationMinutes ?? null,
      actualCount: input.actualCount ?? null,
      date,
      userId,
      habitId,
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
    if (input.actualCount !== undefined) updateData.actualCount = input.actualCount;

    const updated = await recordRepository.update(recordId, updateData as any);

    await this.updateStreaks(userId, existing.date);
    await achievementService.checkAndUnlockAchievements(userId);

    return updated;
  },

  async getDayDetail(userId: string, dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00Z');
    const habits = await habitRepository.findAll();
    const records = await recordRepository.findByUserAndDate(userId, date);
    const userHabitSettings = await userHabitSettingRepository.findByUser(userId);
    const reflection = await reflectionRepository.findByUserAndDate(userId, date);

    const recordsMap = new Map(records.map((r) => [r.habitId, r]));
    const settingsMap = new Map(userHabitSettings.map((s) => [s.habitId, s]));

    const habitsWithRecords = habits.map((habit) => {
      const userSetting = settingsMap.get(habit.id);
      const record = recordsMap.get(habit.id) || null;

      const enabled = userSetting ? userSetting.enabled : true;
      const effectiveTargetMinutes = userSetting?.customTargetMinutes ?? habit.targetMinutes ?? null;
      const effectiveTargetCount = userSetting?.customTargetCount ?? habit.targetCount ?? null;

      return {
        id: habit.id,
        slug: habit.slug,
        label: habit.label,
        icon: habit.icon,
        description: habit.description,
        type: habit.type as 'binary' | 'duration' | 'count' | 'custom',
        targetMinutes: habit.targetMinutes,
        targetCount: habit.targetCount,
        unit: habit.unit,
        sortOrder: habit.sortOrder,
        enabled,
        effectiveTargetMinutes,
        effectiveTargetCount,
        record,
      };
    });

    let totalProgress = 0;
    const activeHabits = habitsWithRecords.filter((h) => h.enabled);
    activeHabits.forEach((h) => {
      if (!h.record) return;
      if (h.record.status === 'completed') {
        totalProgress += 100;
      } else if (h.record.status === 'in_progress') {
        if (h.type === 'duration' && h.effectiveTargetMinutes && h.record.durationMinutes) {
          totalProgress += Math.min(100, Math.round((h.record.durationMinutes / h.effectiveTargetMinutes) * 100));
        } else if (h.type === 'count' && h.effectiveTargetCount && h.record.actualCount) {
          totalProgress += Math.min(100, Math.round((h.record.actualCount / h.effectiveTargetCount) * 100));
        }
      }
    });

    const completion = activeHabits.length > 0 ? Math.round(totalProgress / activeHabits.length) : 0;
    const streaks = await streakRepository.get(userId);
    const motivation = getDailyMotivation();

    return {
      date: dateStr,
      habits: habitsWithRecords,
      completion,
      motivation,
      streaks: streaks || { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
      reflection,
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
    const currentRecords = await recordRepository.getMonthlyData(userId, year, month);
    const habits = await habitRepository.findAll();

    // Fetch previous month records for Month-over-Month comparison
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const previousRecords = await recordRepository.getMonthlyData(userId, prevYear, prevMonth);

    // Process current month
    const dailyMap = new Map<string, { total: number; completed: number; progressSum: number }>();
    const habitCounts = new Map<string, { total: number; completed: number; durationSum: number }>();

    habits.forEach((h) => habitCounts.set(h.id, { total: 0, completed: 0, durationSum: 0 }));

    let quranTotalMinutes = 0;
    let exerciseTotalMinutes = 0;
    let learningTotalMinutes = 0;

    currentRecords.forEach((r) => {
      const dateStr = r.date.toISOString().split('T')[0];
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { total: habits.length, completed: 0, progressSum: 0 });
      }
      const day = dailyMap.get(dateStr)!;
      if (r.status === 'completed') {
        day.completed++;
        day.progressSum += 100;
      } else if (r.status === 'in_progress' && r.durationMinutes) {
        const target = r.habit?.targetMinutes || 30;
        day.progressSum += Math.min(100, Math.round((r.durationMinutes / target) * 100));
      }

      const habitCount = habitCounts.get(r.habitId);
      if (habitCount) {
        habitCount.total++;
        if (r.status === 'completed') habitCount.completed++;
        if (r.durationMinutes) habitCount.durationSum += r.durationMinutes;
      }

      if (r.durationMinutes) {
        if (r.habit?.slug === 'quran') quranTotalMinutes += r.durationMinutes;
        if (r.habit?.slug === 'exercise') exerciseTotalMinutes += r.durationMinutes;
        if (r.habit?.slug === 'islamic_learning') learningTotalMinutes += r.durationMinutes;
      }
    });

    const dailyData = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        completion: Math.round(data.progressSum / habits.length),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const habitBreakdown = habits.map((h) => {
      const count = habitCounts.get(h.id);
      const completedDays = count?.completed || 0;
      return {
        habit: h,
        completedDays,
        totalDays: totalDaysInMonth,
        completion: Math.round((completedDays / totalDaysInMonth) * 100),
      };
    });

    // Best habit
    const bestHabit = habitBreakdown.length > 0
      ? habitBreakdown.reduce((prev, curr) => (curr.completion > prev.completion ? curr : prev))
      : null;

    const weeks = Math.ceil(dailyData.length / 7) || 1;
    const weeklyTrends = Array.from({ length: weeks }, (_, i) => {
      const weekData = dailyData.slice(i * 7, (i + 1) * 7);
      const avg = weekData.length > 0 ? weekData.reduce((sum, d) => sum + d.completion, 0) / weekData.length : 0;
      return { week: i + 1, completion: Math.round(avg) };
    });

    const mostConsistentWeek = weeklyTrends.length > 0
      ? weeklyTrends.reduce((prev, curr) => (curr.completion > prev.completion ? curr : prev))
      : null;

    const totalTrackedDays = dailyMap.size;
    const allCompleted = currentRecords.filter((r) => r.status === 'completed').length;
    const totalPossible = habits.length * totalDaysInMonth;
    const completionPercentage = totalPossible > 0 ? Math.round((allCompleted / totalPossible) * 100) : 0;

    const streaks = await streakRepository.get(userId);

    // Process previous month statistics for Month-over-Month comparison
    let prevQuran = 0, prevExercise = 0, prevLearning = 0, prevCompleted = 0;
    const prevDaySet = new Set<string>();
    const prevHabitCompletedMap = new Map<string, number>();

    previousRecords.forEach((r) => {
      prevDaySet.add(r.date.toISOString().split('T')[0]);
      if (r.status === 'completed') {
        prevCompleted++;
        prevHabitCompletedMap.set(r.habitId, (prevHabitCompletedMap.get(r.habitId) || 0) + 1);
      }
      if (r.durationMinutes) {
        if (r.habit?.slug === 'quran') prevQuran += r.durationMinutes;
        if (r.habit?.slug === 'exercise') prevExercise += r.durationMinutes;
        if (r.habit?.slug === 'islamic_learning') prevLearning += r.durationMinutes;
      }
    });

    const prevDaysInMonth = new Date(prevYear, prevMonth, 0).getDate();
    const prevPossible = habits.length * prevDaysInMonth;
    const prevCompletionPct = prevPossible > 0 ? Math.round((prevCompleted / prevPossible) * 100) : 0;

    const calcMetric = (curr: number, prev: number) => {
      const delta = curr - prev;
      const pctChange = prev > 0 ? Math.round((delta / prev) * 100) : null;
      const trend: 'up' | 'down' | 'same' = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';
      return { current: curr, previous: prev, delta, percentageChange: pctChange, trend };
    };

    const comparison = {
      completionPercentage: calcMetric(completionPercentage, prevCompletionPct),
      trackedDays: calcMetric(totalTrackedDays, prevDaySet.size),
      quranMinutes: calcMetric(quranTotalMinutes, prevQuran),
      exerciseMinutes: calcMetric(exerciseTotalMinutes, prevExercise),
      learningMinutes: calcMetric(learningTotalMinutes, prevLearning),
      streak: calcMetric(streaks?.currentStreak || 0, 0),
      habitComparison: habits.map((h) => {
        const currCompleted = habitCounts.get(h.id)?.completed || 0;
        const prevCompletedHabit = prevHabitCompletedMap.get(h.id) || 0;
        const currPct = Math.round((currCompleted / totalDaysInMonth) * 100);
        const prevPct = Math.round((prevCompletedHabit / prevDaysInMonth) * 100);
        return {
          habitId: h.id,
          habitSlug: h.slug,
          habitLabel: h.label,
          currentCompletion: currPct,
          previousCompletion: prevPct,
          trend: currPct > prevPct ? ('up' as const) : currPct < prevPct ? ('down' as const) : ('same' as const),
        };
      }),
    };

    return {
      month,
      year,
      streaks: streaks || { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
      completionPercentage,
      totalTrackedDays,
      quranTotalMinutes,
      exerciseTotalMinutes,
      learningTotalMinutes,
      bestHabit: bestHabit ? { slug: bestHabit.habit.slug, label: bestHabit.habit.label, completion: bestHabit.completion } : null,
      mostConsistentWeek,
      dailyData,
      habitBreakdown,
      weeklyTrends,
      comparison,
    };
  },

  async getWeeklyReport(userId: string, startDate: string, endDate: string) {
    const start = new Date(startDate + 'T00:00:00Z');
    const end = new Date(endDate + 'T23:59:59Z');

    const records = await recordRepository.findByUserAndDateRange(userId, start, end);
    const habits = await habitRepository.findAll();

    const dailyCompletion = new Map<string, { total: number; completed: number }>();
    const habitData = new Map<string, { completed: number; skippedReasons: { date: string; reason: string }[] }>();

    habits.forEach((h) => {
      habitData.set(h.id, { completed: 0, skippedReasons: [] });
    });

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

    const totalDays = daySet.size;

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

    // Duration and binary completion check
    const completedCount = records.filter((r) => r.status === 'completed').length;

    if (habits.length > 0 && completedCount < Math.ceil(habits.length * 0.5)) {
      return;
    }

    const streaks = await streakRepository.get(userId);
    const currentStreak = streaks?.currentStreak || 0;
    const longestStreak = streaks?.longestStreak || 0;

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
