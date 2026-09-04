import { reportRepository } from '../repositories/report.repository';
import { recordRepository } from '../repositories/record.repository';
import { habitRepository } from '../repositories/habit.repository';
import { streakRepository } from '../repositories/streak.repository';
import { reflectionRepository } from '../repositories/reflection.repository';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/response';
import { ReportGenerateInput } from '@tazkiyah/shared';

export const reportService = {
  async generateReport(userId: string, input: ReportGenerateInput) {
    const start = new Date(input.startDate + 'T00:00:00Z');
    const end = new Date(input.endDate + 'T23:59:59Z');

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const habits = await habitRepository.findAll();
    const records = await recordRepository.findByUserAndDateRange(userId, start, end);
    const reflections = await reflectionRepository.findByUserAndDateRange(userId, start, end);
    const streaks = await streakRepository.get(userId);

    const daySet = new Set<string>();
    let quranTotalMinutes = 0;
    let exerciseTotalMinutes = 0;
    let learningTotalMinutes = 0;

    const habitDataMap = new Map<
      string,
      { completedDays: number; totalDuration: number; totalCount: number }
    >();

    habits.forEach((h) => {
      habitDataMap.set(h.id, { completedDays: 0, totalDuration: 0, totalCount: 0 });
    });

    records.forEach((r) => {
      const dateStr = r.date.toISOString().split('T')[0];
      daySet.add(dateStr);

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

    const totalDaysTracked = daySet.size;

    // Calculate overall consistency percentage
    const totalPossibleHabitLogs = habits.length * (totalDaysTracked || 1);
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
        completionRate: totalDaysTracked > 0 ? Math.round((hd.completedDays / totalDaysTracked) * 100) : 0,
      };
    });

    // Find most consistent habit
    let mostConsistentHabit = habitBreakdown.length > 0
      ? habitBreakdown.reduce((best, curr) => (curr.completionRate > best.completionRate ? curr : best))
      : null;

    const summaryPayload = {
      userName: user.name,
      periodTitle: input.title,
      startDate: input.startDate,
      endDate: input.endDate,
      overallConsistency,
      trackedDays: totalDaysTracked,
      currentStreak: streaks?.currentStreak || 0,
      longestStreak: streaks?.longestStreak || 0,
      quranTotalMinutes,
      exerciseTotalMinutes,
      learningTotalMinutes,
      mostConsistentHabit,
      habitBreakdown,
      reflectionCount: reflections.length,
      recentReflections: reflections.slice(0, 5).map((rf) => ({
        date: rf.date.toISOString().split('T')[0],
        mood: rf.mood,
        notes: rf.notes,
        improvement: rf.improvement,
      })),
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
