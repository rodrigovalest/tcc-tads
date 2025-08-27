import { useState, useEffect } from 'react';
import useAuthStore from '../store/auth-store';
import userService from '../services/user-service';
import IUserResponse from '../models/responses/user-response';

export const useUserProfile = () => {
  const { user: authUser, token } = useAuthStore();
  const [userProfile, setUserProfile] = useState<IUserResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    if (!authUser?.sub || !token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const profile = await userService.findById(authUser.sub);
      setUserProfile(profile);
    } catch (err) {
      setError('Erro ao carregar perfil do usuário');
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    fetchUserProfile();
  };

  useEffect(() => {
    fetchUserProfile();
  }, [authUser?.sub, token]);

  return {
    userProfile,
    loading,
    error,
    refreshProfile,
    authUser
  };
};
