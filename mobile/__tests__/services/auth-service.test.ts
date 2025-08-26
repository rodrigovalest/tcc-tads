import authService from '../../services/auth-service';
import api from '../../api';
import { FormDataBuilder, FileUploadService } from '../../utils';
import ILoginRequest from '../../models/requests/login-request';
import IRegisterRequest from '../../models/requests/register-request';
import ILoginResponse from '../../models/responses/login-response';
import IUserResponse from '../../models/responses/user-response';

// Mock dependencies
jest.mock('../../api');
jest.mock('../../utils', () => ({
  FormDataBuilder: jest.fn(),
  FileUploadService: {
    createPhotoFile: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;
const MockFormDataBuilder = FormDataBuilder as jest.MockedClass<typeof FormDataBuilder>;
const mockFileUploadService = FileUploadService as jest.Mocked<typeof FileUploadService>;

// Mock data
const mockLoginRequest: ILoginRequest = {
  email: 'test@example.com',
  password: 'password123',
};

const mockLoginResponse: ILoginResponse = {
  access_token: 'jwt.token.here',
  token_type: 'bearer',
};

const mockRegisterRequest: IRegisterRequest = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  nationality: 'BR',
  languages: [{ languageCode: 'pt', fluencyLevel: 5 }],
  interestTopics: ['technology'],
  personalDescription: 'Test description',
  photo: 'file://photo.jpg',
};

const mockUserResponse: IUserResponse = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  nationality: 'BR',
  personalDescription: 'Test description',
  photoUri: 'http://example.com/photo.jpg',
  isActive: true,
  lastLoginAt: null,
  languages: [],
  interestTopics: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      mockApi.post.mockResolvedValue({ data: mockLoginResponse });

      // Act
      const result = await authService.login(mockLoginRequest);

      // Assert
      expect(result).toEqual(mockLoginResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/login', mockLoginRequest);
      expect(mockApi.post).toHaveBeenCalledTimes(1);
    });

    it('should handle login error with API failure', async () => {
      // Arrange
      const error = new Error('Invalid credentials');
      mockApi.post.mockRejectedValue(error);

      // Act & Assert
      await expect(authService.login(mockLoginRequest)).rejects.toThrow('Invalid credentials');
      expect(mockApi.post).toHaveBeenCalledWith('/login', mockLoginRequest);
      expect(mockApi.post).toHaveBeenCalledTimes(1);
    });

    it('should handle network error during login', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      mockApi.post.mockRejectedValue(networkError);

      // Act & Assert
      await expect(authService.login(mockLoginRequest)).rejects.toThrow('Network Error');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Act
      const result = await authService.logout();

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('loginWithGoogle', () => {
    it('should reject with not implemented error', async () => {
      // Act & Assert
      await expect(authService.loginWithGoogle()).rejects.toThrow('Google login not implemented');
    });
  });

  describe('register', () => {
    const mockFormData = new FormData();
    const mockFormDataBuilder = {
      append: jest.fn(),
      appendArray: jest.fn(),
      build: jest.fn().mockReturnValue(mockFormData),
    };
    const mockPhotoFile = {
      uri: 'file://photo.jpg',
      type: 'image/jpeg',
      name: 'photo.jpg',
    };

    beforeEach(() => {
      MockFormDataBuilder.mockImplementation(() => mockFormDataBuilder as any);
      mockFileUploadService.createPhotoFile.mockReturnValue(mockPhotoFile as any);
    });

    it('should register with photo successfully', async () => {
      // Arrange
      mockApi.post.mockResolvedValue({ data: mockUserResponse });

      // Act
      const result = await authService.register(mockRegisterRequest);

      // Assert
      expect(result).toEqual(mockUserResponse);
      expect(mockFileUploadService.createPhotoFile).toHaveBeenCalledWith(mockRegisterRequest.photo);
      expect(MockFormDataBuilder).toHaveBeenCalledTimes(1);
      expect(mockApi.post).toHaveBeenCalledWith('/user', mockFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    });

    it('should register without photo successfully', async () => {
      // Arrange
      const registerDataWithoutPhoto = {
        ...mockRegisterRequest,
        photo: undefined,
      };
      mockApi.post.mockResolvedValue({ data: mockUserResponse });

      // Act
      const result = await authService.register(registerDataWithoutPhoto);

      // Assert
      expect(result).toEqual(mockUserResponse);
      expect(mockFileUploadService.createPhotoFile).not.toHaveBeenCalled();
      expect(mockApi.post).toHaveBeenCalledWith('/user', registerDataWithoutPhoto);
    });

    it('should handle registration error', async () => {
      // Arrange
      const error = new Error('Registration failed');
      mockApi.post.mockRejectedValue(error);

      // Act & Assert
      await expect(authService.register(mockRegisterRequest)).rejects.toThrow('Registration failed');
    });

    it('should handle FormData creation for register with photo', async () => {
      // Arrange
      mockApi.post.mockResolvedValue({ data: mockUserResponse });

      // Act
      await authService.register(mockRegisterRequest);

      // Assert
      expect(mockFormDataBuilder.append).toHaveBeenCalledWith('username', mockRegisterRequest.username);
      expect(mockFormDataBuilder.append).toHaveBeenCalledWith('email', mockRegisterRequest.email);
      expect(mockFormDataBuilder.append).toHaveBeenCalledWith('password', mockRegisterRequest.password);
      expect(mockFormDataBuilder.append).toHaveBeenCalledWith('nationality', mockRegisterRequest.nationality);
      expect(mockFormDataBuilder.append).toHaveBeenCalledWith('personalDescription', mockRegisterRequest.personalDescription);
      expect(mockFormDataBuilder.append).toHaveBeenCalledWith('photo', mockPhotoFile);
      expect(mockFormDataBuilder.appendArray).toHaveBeenCalledWith('languages', mockRegisterRequest.languages);
      expect(mockFormDataBuilder.appendArray).toHaveBeenCalledWith('interestTopics', mockRegisterRequest.interestTopics);
    });
  });
});
