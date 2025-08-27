import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('FileUploadService', () => {
  let service: FileUploadService;
  const mockUploadPath = '/mock/upload/path';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUploadService],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
    jest.clearAllMocks();
    
    // Setup common mocks
    mockPath.join.mockReturnValue(mockUploadPath);
    mockFs.existsSync.mockReturnValue(true);
  });

  describe('constructor', () => {
    it('should create upload directory if it does not exist', () => {
      // Arrange
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation();

      // Act
      new FileUploadService();

      // Assert
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(mockUploadPath, { recursive: true });
    });

    it('should not create upload directory if it already exists', () => {
      // Arrange
      mockFs.existsSync.mockReturnValue(true);

      // Act
      new FileUploadService();

      // Assert
      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('saveFile', () => {
    it('should save file and return unique filename', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        originalname: 'test.jpg',
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      mockPath.extname.mockReturnValue('.jpg');
      mockPath.join.mockReturnValue('/mock/upload/path/mock-uuid-1234.jpg');
      mockFs.writeFileSync.mockImplementation();

      // Act
      const result = service.saveFile(mockFile);

      // Assert
      expect(result).toBe('mock-uuid-1234.jpg');
      expect(mockPath.extname).toHaveBeenCalledWith('test.jpg');
      expect(mockPath.join).toHaveBeenCalledWith(mockUploadPath, 'mock-uuid-1234.jpg');
      expect(mockFs.writeFileSync).toHaveBeenCalledWith('/mock/upload/path/mock-uuid-1234.jpg', mockFile.buffer);
    });
  });

  describe('deleteFile', () => {
    it('should not delete file if it does not exist', () => {
      // Arrange
      const fileName = 'non-existent-file.jpg';
      const filePath = '/mock/upload/path/non-existent-file.jpg';
      mockPath.join.mockReturnValue(filePath);
      mockFs.existsSync.mockReturnValue(false);

      // Act
      service.deleteFile(fileName);

      // Assert
      expect(mockFs.existsSync).toHaveBeenCalledWith(filePath);
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle empty filename gracefully', () => {
      // Act
      service.deleteFile('');

      // Assert
      expect(mockPath.join).not.toHaveBeenCalled();
      expect(mockFs.existsSync).not.toHaveBeenCalled();
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle null filename gracefully', () => {
      // Act
      service.deleteFile(null as any);

      // Assert
      expect(mockPath.join).not.toHaveBeenCalled();
      expect(mockFs.existsSync).not.toHaveBeenCalled();
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('validateImageFile', () => {
    it('should return true for valid JPEG file', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      } as Express.Multer.File;

      // Act
      const result = service.validateImageFile(mockFile);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for valid PNG file', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        mimetype: 'image/png',
        size: 2 * 1024 * 1024, // 2MB
      } as Express.Multer.File;

      // Act
      const result = service.validateImageFile(mockFile);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw error for invalid mimetype', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;

      // Act & Assert
      expect(() => service.validateImageFile(mockFile)).toThrow('Tipo de arquivo não permitido. Use apenas JPEG, PNG, GIF ou WebP.');
    });

    it('should throw error for file too large', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB (over 5MB limit)
      } as Express.Multer.File;

      // Act & Assert
      expect(() => service.validateImageFile(mockFile)).toThrow('Arquivo muito grande. Tamanho máximo: 5MB.');
    });
  });

  describe('getFileUrl', () => {
    it('should return complete URL for valid filename', () => {
      // Arrange
      const fileName = 'test-image.jpg';
      const baseUrl = 'http://localhost:3000';

      // Act
      const result = service.getFileUrl(fileName, baseUrl);

      // Assert
      expect(result).toBe('http://localhost:3000/uploads/test-image.jpg');
    });

    it('should return null for empty filename', () => {
      // Arrange
      const fileName = '';
      const baseUrl = 'http://localhost:3000';

      // Act
      const result = service.getFileUrl(fileName, baseUrl);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for null filename', () => {
      // Arrange
      const fileName = null as any;
      const baseUrl = 'http://localhost:3000';

      // Act
      const result = service.getFileUrl(fileName, baseUrl);

      // Assert
      expect(result).toBeNull();
    });
  });
});
