// hooks/useLogout.ts
import { useMutation } from '@tanstack/react-query';
import authService from '@/services/auth-service';
import useAuthStore from '@/store/auth-store';
import { useRouter } from 'expo-router';
import type { ApiError } from '@/api';

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      await authService.logout();
      logout();
    },

    onSuccess: () => {
      router.replace('/(public)/(auth)/login');
    },

    onError: (error: ApiError) => {
      console.warn("[Logout error]", error.status, error.message);
    },
  });
}
