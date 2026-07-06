import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import type { ApiResponse, AuthResponse } from '@tazkiyah/shared';
import type { RegisterInput, LoginInput } from '@tazkiyah/shared';

export function useAuth() {
  const { setUser, clearUser, user, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', input);
      return data.data!;
    },
    onSuccess: (result) => {
      localStorage.setItem('accessToken', result.tokens.accessToken);
      localStorage.setItem('refreshToken', result.tokens.refreshToken);
      setUser(result.user);
      toast.success('Welcome back!');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', input);
      return data.data!;
    },
    onSuccess: (result) => {
      localStorage.setItem('accessToken', result.tokens.accessToken);
      localStorage.setItem('refreshToken', result.tokens.refreshToken);
      setUser(result.user);
      toast.success('Account created successfully!');
    },
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AuthResponse['user']>>('/auth/me');
      return data.data!;
    },
    enabled: isAuthenticated,
    retry: false,
  });

  return {
    user: user || profileQuery.data,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: clearUser,
    isLoading: loginMutation.isPending || registerMutation.isPending,
  };
}
