import authService from '@/services/auth-service';
import api from '@/api';
import ILoginRequest from '@/models/requests/login-request';
import ILoginResponse from '@/models/responses/login-response';
import IRegisterRequest from '@/models/requests/register-request';

jest.mock('@/api');

const mockedApi = api as jest.Mocked<typeof api>;

describe('authService.login', () => {
  it('send correct data and returns token', async () => {
    // Arrange
    const mockRequest: ILoginRequest = {
      email: 'user@example.com',
      password: '123456',
    };

    const mockResponse: ILoginResponse = {
      access_token: 'fake-token',
      token_type: 'bearer'
    };

    mockedApi.post.mockResolvedValueOnce({ data: mockResponse });

    // Act
    const result = await authService.login(mockRequest);

    // Assert
    expect(mockedApi.post).toHaveBeenCalledWith('/login', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('throws error when API request fails', async () => {
    // Arrange
    const mockRequest: ILoginRequest = {
      email: 'user@example.com',
      password: 'wrong-password',
    };

    const mockError = new Error('Network Error');

    mockedApi.post.mockRejectedValueOnce(mockError);

    // Act & Assert
    await expect(authService.login(mockRequest)).rejects.toThrow('Network Error');
  });
});

  describe('register', () => {
    it('sends correct data to register endpoint', async () => {
      const mockRequest: IRegisterRequest = {
        username: 'testuser',
        email: 'user@example.com',
        password: '123456',
        nationality: 'US',
      };

      mockedApi.post.mockResolvedValueOnce({ data: {} });

      const result = await authService.register(mockRequest);

      expect(mockedApi.post).toHaveBeenCalledWith('/user', mockRequest);
      expect(result).toEqual({ data: {} });
    });

    it('throws error when register API request fails', async () => {
      const mockRequest: IRegisterRequest = {
        username: 'testuser',
        email: 'user@example.com',
        password: '123456',
        nationality: 'US',
      };

      const mockError = new Error('Registration failed');

      mockedApi.post.mockRejectedValueOnce(mockError);

      await expect(authService.register(mockRequest)).rejects.toThrow('Registration failed');
    });
  });