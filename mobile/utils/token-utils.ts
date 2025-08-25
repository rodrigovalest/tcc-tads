import { jwtDecode } from 'jwt-decode';
import IJwtUser from '../models/interfaces/jwt-token-user';

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    const decoded: IJwtUser = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Verificar se o token tem exp (expiration time)
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('🚨 Token expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('🚨 Error decoding token:', error);
    return false;
  }
};

export const getTokenExpiration = (token: string | null): Date | null => {
  if (!token) return null;
  
  try {
    const decoded: IJwtUser = jwtDecode(token);
    if (decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    console.error('🚨 Error decoding token:', error);
    return null;
  }
};

export const getTimeUntilExpiration = (token: string | null): number => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return 0;
  
  return Math.max(0, expiration.getTime() - Date.now());
};
