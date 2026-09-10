import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { ApiResponse, DashboardData, HabitRecord, HabitRecordCreateInput, ReflectionInput, Reflection, DailyRecord } from '@tazkiyah/shared';

export function useDashboard(selectedDate?: string) {
  const queryClient = useQueryClient();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const activeDateStr = selectedDate || todayStr;

  const dashboardQuery = useQuery({
    queryKey: ['dashboard', activeDateStr],
    queryFn: async () => {
      const endpoint = activeDateStr === todayStr ? '/records/today' : `/records/day/${activeDateStr}`;
      const { data } = await api.get<ApiResponse<DashboardData>>(endpoint);
      return data.data!;
    },
  });

  const upsertHabitMutation = useMutation({
    mutationFn: async (input: HabitRecordCreateInput) => {
      const { data } = await api.post<ApiResponse<HabitRecord>>('/records', input);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
    onError: () => {
      toast.error('Failed to update habit');
    },
  });

  const upsertReflectionMutation = useMutation({
    mutationFn: async (input: ReflectionInput) => {
      const { data } = await api.post<ApiResponse<Reflection>>('/reflections', input);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.success(`Reflection saved for ${activeDateStr}`);
    },
    onError: () => {
      toast.error('Failed to save reflection');
    },
  });

  const submitDayMutation = useMutation({
    mutationFn: async ({ date, overallNote }: { date: string; overallNote?: string }) => {
      const { data } = await api.post<ApiResponse<DailyRecord>>('/records/submit-day', { date, overallNote });
      return data.data!;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.success(`Daily record submitted for ${result.date}`);
    },
    onError: () => {
      toast.error('Failed to submit daily record');
    },
  });

  return {
    dashboard: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error,
    updateHabit: upsertHabitMutation.mutate,
    isUpdating: upsertHabitMutation.isPending,
    saveReflection: upsertReflectionMutation.mutate,
    isSavingReflection: upsertReflectionMutation.isPending,
    submitDay: submitDayMutation.mutate,
    isSubmittingDay: submitDayMutation.isPending,
  };
}
