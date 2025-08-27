import userService from '../../services/user-service';
import api from '../../api';
import { FormDataBuilder } from '../../utils';

// Mock dependencies
jest.mock('../../api');
jest.mock('../../utils', () => ({
  FormDataBuilder: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const MockFormDataBuilder = FormDataBuilder as jest.MockedClass<typeof FormDataBuilder>;

// Mock data
const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  nationality: 'BR',
  personalDescription: 'Test description',
  photoUri: 'http://example.com/photo.jpg',
  isActive: true,
  lastLoginAt: null,
  languages: [
    {
      id: 1,
      languageCode: 'pt',
      fluencyLevel: 5,
      createdAt: new Date(),
    },
  ],
  interestTopics: [
    {
      id: 1,
      topic: 'technology',
      createdAt: new Date(),
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsers = [mockUser];

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should fetch all users successfully', async () => {
      // Arrange
      mockApi.get.mockResolvedValue({ data: mockUsers });

      // Act
      const result = await userService.findAll();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockApi.get).toHaveBeenCalledWith('/user');
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });

    it('should handle API error when fetching all users', async () => {
      // Arrange
      const error = new Error('API Error');
      mockApi.get.mockRejectedValue(error);

      // Act & Assert
      await expect(userService.findAll()).rejects.toThrow('API Error');
      expect(mockApi.get).toHaveBeenCalledWith('/user');
    });
  });

  describe('findById', () => {
    it('should fetch user by id successfully', async () => {
      // Arrange
      const userId = 1;
      mockApi.get.mockResolvedValue({ data: mockUser });

      // Act
      const result = await userService.findById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockApi.get).toHaveBeenCalledWith(`/user/${userId}`);
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });

    it('should handle API error when fetching user by id', async () => {
      // Arrange
      const userId = 999;
      const error = new Error('User not found');
      mockApi.get.mockRejectedValue(error);

      // Act & Assert
      await expect(userService.findById(userId)).rejects.toThrow('User not found');
      expect(mockApi.get).toHaveBeenCalledWith(`/user/${userId}`);
    });
  });

  describe('update', () => {
    const userId = 1;
    const mockFormData = new FormData();
    const mockFormDataBuilder = {
      append: jest.fn(),
      appendArray: jest.fn(),
      appendBoolean: jest.fn(),
      build: jest.fn().mockReturnValue(mockFormData),
    };

    beforeEach(() => {
      MockFormDataBuilder.mockImplementation(() => mockFormDataBuilder as any);
    });

    it('should update user with all data successfully', async () => {
      // Arrange
      const updateData = {
        username: 'newusername',
        nationality: 'US',
        personalDescription: 'New description',
        languages: [{ languageCode: 'en', fluencyLevel: 4 }],
        interestTopics: ['music', 'sports'],
        removePhoto: false,
        photoFile: {
          uri: 'file://photo.jpg',
          name: 'photo.jpg',
          type: 'image/jpeg',
        },
      };

      const updatedUser = { ...mockUser, ...updateData };
      mockApi.patch.mockResolvedValue({ data: updatedUser });

      // Act
      const result = await userService.update(userId, updateData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(MockFormDataBuilder).toHaveBeenCalledTimes(1);
      expect(mockFormDataBuilder.append).toHaveBeenCalledWith('username', 'newusername');
      expect(mockFormDataBuilder.append).toHaveBeenCalledWith('nationality', 'US');
      expect(mockFormDataBuilder.append).toHaveBeenCalledWith('personalDescription', 'New description');
      expect(mockFormDataBuilder.appendArray).toHaveBeenCalledWith('languages', updateData.languages);
      expect(mockFormDataBuilder.appendArray).toHaveBeenCalledWith('interestTopics', updateData.interestTopics);
      expect(mockFormDataBuilder.appendBoolean).toHaveBeenCalledWith('removePhoto', false);
      expect(mockFormDataBuilder.append).toHaveBeenCalledWith('photo', updateData.photoFile);
      expect(mockApi.patch).toHaveBeenCalledWith(`/user/${userId}`, mockFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    });

    it('should update user with partial data', async () => {
      // Arrange
      const updateData = {
        username: 'newusername',
        personalDescription: 'New description',
      };

      const updatedUser = { ...mockUser, ...updateData };
      mockApi.patch.mockResolvedValue({ data: updatedUser });

      // Act
      const result = await userService.update(userId, updateData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockFormDataBuilder.append).toHaveBeenCalledWith('username', 'newusername');
      expect(mockFormDataBuilder.append).toHaveBeenCalledWith('personalDescription', 'New description');
      expect(mockFormDataBuilder.append).not.toHaveBeenCalledWith('nationality', expect.anything());
      expect(mockFormDataBuilder.appendArray).not.toHaveBeenCalled();
    });

    it('should handle removePhoto flag', async () => {
      // Arrange
      const updateData = {
        removePhoto: true,
      };

      const updatedUser = { ...mockUser, photoUri: null };
      mockApi.patch.mockResolvedValue({ data: updatedUser });

      // Act
      const result = await userService.update(userId, updateData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockFormDataBuilder.appendBoolean).toHaveBeenCalledWith('removePhoto', true);
      expect(mockFormDataBuilder.append).not.toHaveBeenCalledWith('photo', expect.anything());
    });

    it('should handle empty update data', async () => {
      // Arrange
      const updateData = {};
      mockApi.patch.mockResolvedValue({ data: mockUser });

      // Act
      const result = await userService.update(userId, updateData);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockFormDataBuilder.append).not.toHaveBeenCalled();
      expect(mockFormDataBuilder.appendArray).not.toHaveBeenCalled();
      expect(mockFormDataBuilder.appendBoolean).not.toHaveBeenCalled();
    });

    it('should handle API error during update', async () => {
      // Arrange
      const updateData = { username: 'newusername' };
      const error = new Error('Update failed');
      mockApi.patch.mockRejectedValue(error);

      // Act & Assert
      await expect(userService.update(userId, updateData)).rejects.toThrow('Update failed');
      expect(mockApi.patch).toHaveBeenCalledWith(`/user/${userId}`, mockFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    });

    it('should handle languages array correctly', async () => {
      // Arrange
      const updateData = {
        languages: [
          { languageCode: 'en', fluencyLevel: 4 },
          { languageCode: 'pt', fluencyLevel: 5 },
        ],
      };

      mockApi.patch.mockResolvedValue({ data: mockUser });

      // Act
      await userService.update(userId, updateData);

      // Assert
      expect(mockFormDataBuilder.appendArray).toHaveBeenCalledWith('languages', updateData.languages);
    });

    it('should handle interestTopics array correctly', async () => {
      // Arrange
      const updateData = {
        interestTopics: ['technology', 'music', 'sports'],
      };

      mockApi.patch.mockResolvedValue({ data: mockUser });

      // Act
      await userService.update(userId, updateData);

      // Assert
      expect(mockFormDataBuilder.appendArray).toHaveBeenCalledWith('interestTopics', updateData.interestTopics);
    });

    it('should handle photo file with different formats', async () => {
      // Arrange
      const updateData = {
        photoFile: {
          uri: 'file://photo.png',
          name: 'photo.png',
          type: 'image/png',
        },
      };

      mockApi.patch.mockResolvedValue({ data: mockUser });

      // Act
      await userService.update(userId, updateData);

      // Assert
      expect(mockFormDataBuilder.append).toHaveBeenCalledWith('photo', updateData.photoFile);
    });
  });

  describe('buildUpdateFormData (private method testing through update)', () => {
    const userId = 1;
    const mockFormData = new FormData();
    const mockFormDataBuilder = {
      append: jest.fn(),
      appendArray: jest.fn(),
      appendBoolean: jest.fn(),
      build: jest.fn().mockReturnValue(mockFormData),
    };

    beforeEach(() => {
      MockFormDataBuilder.mockImplementation(() => mockFormDataBuilder as any);
      mockApi.patch.mockResolvedValue({ data: mockUser });
    });

    it('should not append undefined values', async () => {
      // Arrange
      const updateData = {
        username: undefined,
        nationality: undefined,
        personalDescription: undefined,
      };

      // Act
      await userService.update(userId, updateData);

      // Assert
      expect(mockFormDataBuilder.append).not.toHaveBeenCalledWith('username', undefined);
      expect(mockFormDataBuilder.append).not.toHaveBeenCalledWith('nationality', undefined);
      expect(mockFormDataBuilder.append).not.toHaveBeenCalledWith('personalDescription', undefined);
    });

    it('should not append null photo file', async () => {
      // Arrange
      const updateData = {
        photoFile: null,
      };

      // Act
      await userService.update(userId, updateData);

      // Assert
      expect(mockFormDataBuilder.append).not.toHaveBeenCalledWith('photo', null);
    });

    it('should not append undefined arrays', async () => {
      // Arrange
      const updateData = {
        languages: undefined,
        interestTopics: undefined,
      };

      // Act
      await userService.update(userId, updateData);

      // Assert
      expect(mockFormDataBuilder.appendArray).not.toHaveBeenCalledWith('languages', undefined);
      expect(mockFormDataBuilder.appendArray).not.toHaveBeenCalledWith('interestTopics', undefined);
    });
  });
});
