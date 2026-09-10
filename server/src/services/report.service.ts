import { reportRepository } from '../repositories/report.repository';
import { recordRepository } from '../repositories/record.repository';
import { habitRepository } from '../repositories/habit.repository';
import { streakRepository } from '../repositories/streak.repository';
import { reflectionRepository } from '../repositories/reflection.repository';
import { userRepository } from '../repositories/user.repository';
import { dailyRecordRepository } from '../repositories/dailyRecord.repository';
import { AppError } from '../utils/response';
import { ReportGenerateInput, getDateInfo, formatDateStr } from '@tazkiyah/shared';

export const reportService = {
  async generateReport(userId: string, input: ReportGenerateInput) {
    const start = new Date(input.startDate + 'T00:00:00Z');
    const end = new Date(input.endDate + 'T23:59:59Z');

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const habits = await habitRepository.findAll();
    const records = await recordRepository.findByUserAndDateRange(userId, start, end);
    const reflections = await reflectionRepository.findByUserAndDateRange(userId, start, end);
    const dailyRecordsList = await dailyRecordRepository.findRangeByUser(userId, start, end);
    const streaks = await streakRepository.get(userId);

    const recordsByDateMap = new Map<string, Map<string, any>>();
    records.forEach((r) => {
      const dStr = formatDateStr(r.date);
      if (!recordsByDateMap.has(dStr)) {
        recordsByDateMap.set(dStr, new Map());
      }
      recordsByDateMap.get(dStr)!.set(r.habitId, r);
    });

    const reflectionsMap = new Map(
      reflections.map((rf) => [formatDateStr(rf.date), rf])
    );

    const dailyRecordsMap = new Map(
      dailyRecordsList.map((dr) => [formatDateStr(dr.date), dr])
    );

    // Calculate total days in range
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDaysInRange = Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerDay) + 1);

    let quranTotalMinutes = 0;
    let exerciseTotalMinutes = 0;
    let learningTotalMinutes = 0;
    let submittedDaysCount = 0;

    const habitDataMap = new Map<
      string,
      { completedDays: number; totalDuration: number; totalCount: number }
    >();

    habits.forEach((h) => {
      habitDataMap.set(h.id, { completedDays: 0, totalDuration: 0, totalCount: 0 });
    });

    const trackedDaySet = new Set<string>();

    records.forEach((r) => {
      const dateStr = formatDateStr(r.date);
      trackedDaySet.add(dateStr);

      const hd = habitDataMap.get(r.habitId);
      if (hd) {
        if (r.status === 'completed') {
          hd.completedDays++;
        }
        if (r.durationMinutes) {
          hd.totalDuration += r.durationMinutes;
          if (r.habit?.slug === 'quran') quranTotalMinutes += r.durationMinutes;
          if (r.habit?.slug === 'exercise') exerciseTotalMinutes += r.durationMinutes;
          if (r.habit?.slug === 'islamic_learning') learningTotalMinutes += r.durationMinutes;
        }
        if (r.actualCount) {
          hd.totalCount += r.actualCount;
        }
      }
    });

    dailyRecordsList.forEach((dr) => {
      if (dr.isSubmitted) submittedDaysCount++;
    });

    const dailyJournal: any[] = [];
    const currDate = new Date(start);

    while (currDate <= end) {
      const dateStr = formatDateStr(currDate);
      const dateInfo = getDateInfo(dateStr);
      const dayHabitsMap = recordsByDateMap.get(dateStr) || new Map();
      const reflection = reflectionsMap.get(dateStr) || null;
      const dr = dailyRecordsMap.get(dateStr) || null;

      let completedCount = 0;
      let totalProgress = 0;

      const practices = habits.map((h) => {
        const rec = dayHabitsMap.get(h.id) || null;
        const status = rec ? rec.status : 'pending';
        if (status === 'completed') {
          completedCount++;
          totalProgress += 100;
        } else if (status === 'in_progress' && rec?.durationMinutes && h.targetMinutes) {
          totalProgress += Math.min(100, Math.round((rec.durationMinutes / h.targetMinutes) * 100));
        }

        return {
          habitId: h.id,
          slug: h.slug,
          label: h.label,
          type: h.type,
          status,
          durationMinutes: rec?.durationMinutes || null,
          actualCount: rec?.actualCount || null,
          notes: rec?.notes || null,
        };
      });

      const dailyScore = dr?.completionPercentage ?? (habits.length > 0 ? Math.round(totalProgress / habits.length) : 0);

      dailyJournal.push({
        date: dateStr,
        dayName: dateInfo.dayName,
        gregorianDisplay: dateInfo.gregorianDisplay,
        gregorianShort: dateInfo.gregorianShort,
        hijriDisplay: dateInfo.hijriDisplay,
        isSubmitted: dr?.isSubmitted ?? false,
        submittedAt: dr?.submittedAt ? dr.submittedAt.toISOString() : null,
        dailyScore,
        completedCount,
        totalHabitsCount: habits.length,
        practices,
        reflection: reflection
          ? {
              mood: reflection.mood,
              notes: reflection.notes,
              improvement: reflection.improvement,
            }
          : null,
      });

      currDate.setDate(currDate.getDate() + 1);
    }

    const totalDaysTracked = trackedDaySet.size;
    const totalPossibleHabitLogs = habits.length * totalDaysInRange;
    const totalCompletedLogs = records.filter((r) => r.status === 'completed').length;
    const overallConsistency = totalPossibleHabitLogs > 0
      ? Math.round((totalCompletedLogs / totalPossibleHabitLogs) * 100)
      : 0;

    const habitBreakdown = habits.map((h) => {
      const hd = habitDataMap.get(h.id) || { completedDays: 0, totalDuration: 0, totalCount: 0 };
      return {
        habitId: h.id,
        slug: h.slug,
        label: h.label,
        type: h.type,
        completedDays: hd.completedDays,
        totalDurationMinutes: hd.totalDuration,
        totalCount: hd.totalCount,
        completionRate: totalDaysInRange > 0 ? Math.round((hd.completedDays / totalDaysInRange) * 100) : 0,
      };
    });

    const mostConsistentHabit = habitBreakdown.length > 0
      ? habitBreakdown.reduce((best, curr) => (curr.completionRate > best.completionRate ? curr : best))
      : null;

    const startInfo = getDateInfo(input.startDate);
    const endInfo = getDateInfo(input.endDate);

    const summaryPayload = {
      userName: user.name,
      userEmail: user.email,
      periodTitle: input.title,
      periodType: input.periodType,
      startDate: input.startDate,
      endDate: input.endDate,
      gregorianRange: `${startInfo.gregorianShort} – ${endInfo.gregorianShort}`,
      hijriRange: `${startInfo.hijriDisplay} – ${endInfo.hijriDisplay}`,
      overallConsistency,
      submittedDays: submittedDaysCount,
      trackedDays: totalDaysTracked,
      totalDaysInRange,
      currentStreak: streaks?.currentStreak || 0,
      longestStreak: streaks?.longestStreak || 0,
      quranTotalMinutes,
      exerciseTotalMinutes,
      learningTotalMinutes,
      mostConsistentHabit,
      habitBreakdown,
      reflectionCount: reflections.length,
      dailyJournal,
    };

    return reportRepository.create({
      userId,
      title: input.title,
      periodType: input.periodType,
      startDate: start,
      endDate: end,
      summaryData: JSON.stringify(summaryPayload),
    });
  },

  async getUserReports(userId: string) {
    return reportRepository.findByUser(userId);
  },

  async getReportById(userId: string, reportId: string) {
    const report = await reportRepository.findById(reportId);
    if (!report || report.userId !== userId) {
      throw new AppError('Report not found', 404);
    }
    return report;
  },

  async deleteReport(userId: string, reportId: string) {
    const report = await reportRepository.findById(reportId);
    if (!report || report.userId !== userId) {
      throw new AppError('Report not found', 404);
    }
    return reportRepository.delete(reportId);
  },
};
