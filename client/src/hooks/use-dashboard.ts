import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { ApiResponse, DashboardData, HabitRecord, HabitRecordCreateInput } from '@tazkiyah/shared';

export function useDashboard() {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardData>>('/records/today');
      return data.data!;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (input: HabitRecordCreateInput) => {
      const { data } = await api.post<ApiResponse<HabitRecord>>('/records', input);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
    onError: () => {
      toast.error('Failed to update habit');
    },
  });

  return {
    dashboard: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error,
    updateHabit: upsertMutation.mutate,
    isUpdating: upsertMutation.isPending,
  };
}
