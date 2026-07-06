import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, MonthlyAnalytics, WeeklyReport } from '@tazkiyah/shared';

export function useMonthlyAnalytics(year: number, month: number) {
  return useQuery({
    queryKey: ['analytics', year, month],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MonthlyAnalytics>>(
        `/records/analytics/${year}/${month}`,
      );
      return data.data!;
    },
  });
}

export function useWeeklyReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['weekly-report', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<WeeklyReport>>(
        `/records/weekly-report?startDate=${startDate}&endDate=${endDate}`,
      );
      return data.data!;
    },
    enabled: !!startDate && !!endDate,
  });
}

export function useDayDetail(date: string) {
  return useQuery({
    queryKey: ['day-detail', date],
    queryFn: async () => {
      const { data } = await api.get(`/records/day/${date}`);
      return data.data;
    },
    enabled: !!date,
  });
}
