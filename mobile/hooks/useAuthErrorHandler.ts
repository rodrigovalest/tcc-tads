import useAuthStore from '../store/auth-store';
import { ApiError } from '../api';

export const useAuthErrorHandler = () => {
  const logout = useAuthStore((state) => state.logout);

  const handleApiError = async (error: ApiError) => {
    if (error.status === 401) {
      await logout();
    }
  };

  return { handleApiError };
};

export default useAuthErrorHandler;
