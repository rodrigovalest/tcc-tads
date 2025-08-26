import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      // Arrange
      const password = 'mySecretPassword';
      const hashedPassword = '$2b$10$hashedPasswordExample';
      mockBcrypt.hash.mockResolvedValue(hashedPassword);

      // Act
      const result = await service.hashPassword(password);

      // Assert
      expect(result).toBe(hashedPassword);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(mockBcrypt.hash).toHaveBeenCalledTimes(1);
    });

    it('should handle bcrypt errors', async () => {
      // Arrange
      const password = 'mySecretPassword';
      const error = new Error('Bcrypt error');
      mockBcrypt.hash.mockRejectedValue(error);

      // Act & Assert
      await expect(service.hashPassword(password)).rejects.toThrow('Bcrypt error');
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('comparePassword', () => {
    it('should return true when passwords match', async () => {
      // Arrange
      const password = 'mySecretPassword';
      const hashedPassword = '$2b$10$hashedPasswordExample';
      mockBcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await service.comparePassword(password, hashedPassword);

      // Assert
      expect(result).toBe(true);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(mockBcrypt.compare).toHaveBeenCalledTimes(1);
    });

    it('should return false when passwords do not match', async () => {
      // Arrange
      const password = 'mySecretPassword';
      const hashedPassword = '$2b$10$differentHashedPassword';
      mockBcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await service.comparePassword(password, hashedPassword);

      // Assert
      expect(result).toBe(false);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(mockBcrypt.compare).toHaveBeenCalledTimes(1);
    });

    it('should handle bcrypt compare errors', async () => {
      // Arrange
      const password = 'mySecretPassword';
      const hashedPassword = '$2b$10$hashedPasswordExample';
      const error = new Error('Bcrypt compare error');
      mockBcrypt.compare.mockRejectedValue(error);

      // Act & Assert
      await expect(service.comparePassword(password, hashedPassword)).rejects.toThrow('Bcrypt compare error');
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });
});
