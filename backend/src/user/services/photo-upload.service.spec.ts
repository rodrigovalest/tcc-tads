import { Test, TestingModule } from '@nestjs/testing';
import { PhotoUploadService } from './photo-upload.service';
import { FileUploadService } from './file-upload.service';
import { BadRequestException } from '@nestjs/common';

describe('PhotoUploadService', () => {
  let service: PhotoUploadService;
  let fileUploadService: jest.Mocked<FileUploadService>;

  const mockFileUploadService = {
    validateImageFile: jest.fn(),
    saveFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotoUploadService,
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
      ],
    }).compile();

    service = module.get<PhotoUploadService>(PhotoUploadService);
    fileUploadService = module.get(FileUploadService);
    jest.clearAllMocks();
  });

  describe('processPhotoUpload', () => {
    it('should process photo upload successfully', async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        originalname: 'test.jpg',
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;
      const baseUrl = 'http://localhost:3000';
      const fileName = 'mock-uuid-1234.jpg';
      const expectedUrl = 'http://localhost:3000/uploads/mock-uuid-1234.jpg';

      fileUploadService.validateImageFile.mockReturnValue(true);
      fileUploadService.saveFile.mockReturnValue(fileName);
      fileUploadService.getFileUrl.mockReturnValue(expectedUrl);

      // Act
      const result = await service.processPhotoUpload(mockFile, baseUrl);

      // Assert
      expect(result).toBe(expectedUrl);
      expect(fileUploadService.validateImageFile).toHaveBeenCalledWith(mockFile);
      expect(fileUploadService.saveFile).toHaveBeenCalledWith(mockFile);
      expect(fileUploadService.getFileUrl).toHaveBeenCalledWith(fileName, baseUrl);
    });

    it('should return undefined when photo is undefined', async () => {
      // Arrange
      const baseUrl = 'http://localhost:3000';

      // Act
      const result = await service.processPhotoUpload(undefined, baseUrl);

      // Assert
      expect(result).toBeUndefined();
      expect(fileUploadService.validateImageFile).not.toHaveBeenCalled();
      expect(fileUploadService.saveFile).not.toHaveBeenCalled();
      expect(fileUploadService.getFileUrl).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when validation fails', async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        originalname: 'test.pdf',
        buffer: Buffer.from('fake pdf data'),
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;
      const baseUrl = 'http://localhost:3000';
      const validationError = new Error('Invalid file type');

      fileUploadService.validateImageFile.mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(service.processPhotoUpload(mockFile, baseUrl)).rejects.toThrow(BadRequestException);
      await expect(service.processPhotoUpload(mockFile, baseUrl)).rejects.toThrow('Photo upload failed: Invalid file type');
      expect(fileUploadService.validateImageFile).toHaveBeenCalledWith(mockFile);
      expect(fileUploadService.saveFile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file save fails', async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        originalname: 'test.jpg',
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;
      const baseUrl = 'http://localhost:3000';
      const saveError = new Error('Failed to save file');

      fileUploadService.validateImageFile.mockReturnValue(true);
      fileUploadService.saveFile.mockImplementation(() => {
        throw saveError;
      });

      // Act & Assert
      await expect(service.processPhotoUpload(mockFile, baseUrl)).rejects.toThrow(BadRequestException);
      await expect(service.processPhotoUpload(mockFile, baseUrl)).rejects.toThrow('Photo upload failed: Failed to save file');
      expect(fileUploadService.validateImageFile).toHaveBeenCalledWith(mockFile);
      expect(fileUploadService.saveFile).toHaveBeenCalledWith(mockFile);
    });

    it('should return undefined when getFileUrl returns null', async () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        originalname: 'test.jpg',
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;
      const baseUrl = 'http://localhost:3000';
      const fileName = 'mock-uuid-1234.jpg';

      fileUploadService.validateImageFile.mockReturnValue(true);
      fileUploadService.saveFile.mockReturnValue(fileName);
      fileUploadService.getFileUrl.mockReturnValue(null);

      // Act
      const result = await service.processPhotoUpload(mockFile, baseUrl);

      // Assert
      expect(result).toBeUndefined();
      expect(fileUploadService.getFileUrl).toHaveBeenCalledWith(fileName, baseUrl);
    });
  });

  describe('validatePhotoFile', () => {
    it('should validate photo file successfully', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        originalname: 'test.jpg',
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      fileUploadService.validateImageFile.mockReturnValue(true);

      // Act
      service.validatePhotoFile(mockFile);

      // Assert
      expect(fileUploadService.validateImageFile).toHaveBeenCalledWith(mockFile);
    });

    it('should throw error when validation fails', () => {
      // Arrange
      const mockFile: Express.Multer.File = {
        originalname: 'test.pdf',
        buffer: Buffer.from('fake pdf data'),
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;
      const validationError = new Error('Invalid file type');

      fileUploadService.validateImageFile.mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      expect(() => service.validatePhotoFile(mockFile)).toThrow('Invalid file type');
      expect(fileUploadService.validateImageFile).toHaveBeenCalledWith(mockFile);
    });
  });
});
