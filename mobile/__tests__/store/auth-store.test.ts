import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import useAuthStore from '../../store/auth-store';

// Mock jwt-decode
jest.mock('jwt-decode');
const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

// Mock IJwtUser interface
const mockUser = {
  sub: 1,
  username: 'testuser',
  email: 'test@example.com',
  exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
  iat: Math.floor(Date.now() / 1000),
};

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useAuthStore.getState().user = null;
    useAuthStore.getState().token = null;
    useAuthStore.getState().loading = true;
    
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login user successfully with valid token', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      mockJwtDecode.mockReturnValue(mockUser);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthStore());

      // Act
      await act(async () => {
        await result.current.login(token);
      });

      // Assert
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(token);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', token);
      expect(mockJwtDecode).toHaveBeenCalledWith(token);
    });

    it('should handle jwt decode error', async () => {
      // Arrange
      const token = 'invalid.jwt.token';
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const { result } = renderHook(() => useAuthStore());

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.login(token);
        })
      ).rejects.toThrow('Invalid token');

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Arrange
      const { result } = renderHook(() => useAuthStore());
      
      // First login
      const token = 'valid.jwt.token';
      mockJwtDecode.mockReturnValue(mockUser);
      await act(async () => {
        await result.current.login(token);
      });

      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      // Act
      await act(async () => {
        await result.current.logout();
      });

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('restore', () => {
    it('should restore user session with valid stored token', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(token);
      mockJwtDecode.mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuthStore());

      // Act
      await act(async () => {
        await result.current.restore();
      });

      // Assert
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(token);
      expect(result.current.loading).toBe(false);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
      expect(mockJwtDecode).toHaveBeenCalledWith(token);
    });

    it('should handle expired token by removing it', async () => {
      // Arrange
      const expiredUser = {
        ...mockUser,
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };
      const token = 'expired.jwt.token';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(token);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      mockJwtDecode.mockReturnValue(expiredUser);

      const { result } = renderHook(() => useAuthStore());

      // Act
      await act(async () => {
        await result.current.restore();
      });

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
    });

    it('should handle no stored token', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuthStore());

      // Act
      await act(async () => {
        await result.current.restore();
      });

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
      expect(mockJwtDecode).not.toHaveBeenCalled();
    });

    it('should handle restore error by cleaning up', async () => {
      // Arrange
      const token = 'corrupted.token';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(token);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Token decode error');
      });

      const { result } = renderHook(() => useAuthStore());

      // Act
      await act(async () => {
        await result.current.restore();
      });

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
    });

    it('should handle AsyncStorage getItem error', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('AsyncStorage error'));
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthStore());

      // Act
      await act(async () => {
        await result.current.restore();
      });

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuthStore());

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.loading).toBe(true);
    });
  });

  describe('computed properties', () => {
    it('should indicate user is authenticated when user and token exist', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      mockJwtDecode.mockReturnValue(mockUser);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthStore());

      // Act
      await act(async () => {
        await result.current.login(token);
      });

      // Assert
      expect(result.current.user).toBeTruthy();
      expect(result.current.token).toBeTruthy();
    });

    it('should indicate user is not authenticated when no user or token', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuthStore());

      // Ensure logout state
      act(() => {
        result.current.logout();
      });

      // Assert
      expect(result.current.user).toBeFalsy();
      expect(result.current.token).toBeFalsy();
    });
  });
});
