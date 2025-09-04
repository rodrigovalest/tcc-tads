import { Test, TestingModule } from '@nestjs/testing';
import { UserLanguageService, LanguageData } from './user-language.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLanguage } from '../entities/user-language.entity';
import { User } from '../entities/user.entity';
import { CountryCode } from '../entities/country-code.enum';

describe('UserLanguageService', () => {
  let service: UserLanguageService;
  let repository: jest.Mocked<Repository<UserLanguage>>;

  const mockRepository = {
    save: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLanguageService,
        {
          provide: getRepositoryToken(UserLanguage),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserLanguageService>(UserLanguageService);
    repository = module.get(getRepositoryToken(UserLanguage));
    jest.clearAllMocks();
  });

  const createTestUser = (): User => {
    const user = new User('testuser', 'test@example.com', 'hashedPassword', CountryCode.Brazil);
    user.id = 1;
    return user;
  };

  const createTestUserLanguage = (languageCode: string, fluencyLevel: number): UserLanguage => {
    const userLanguage = new UserLanguage();
    userLanguage.id = 1;
    userLanguage.userId = 1;
    userLanguage.languageCode = languageCode;
    userLanguage.fluencyLevel = fluencyLevel;
    userLanguage.createdAt = new Date();
    return userLanguage;
  };

  describe('createUserLanguages', () => {
    it('should create user languages successfully', async () => {
      // Arrange
      const user = createTestUser();
      const languagesData: LanguageData[] = [
        { languageCode: 'en', fluencyLevel: 4 },
        { languageCode: 'pt', fluencyLevel: 5 },
      ];
      const expectedUserLanguages = [
        createTestUserLanguage('en', 4),
        createTestUserLanguage('pt', 5),
      ];

      repository.save.mockResolvedValue(expectedUserLanguages as any);

      // Act
      const result = await service.createUserLanguages(user, languagesData);

      // Assert
      expect(result).toEqual(expectedUserLanguages);
      expect(repository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId: user.id,
            user: user,
            languageCode: 'en',
            fluencyLevel: 4,
          }),
          expect.objectContaining({
            userId: user.id,
            user: user,
            languageCode: 'pt',
            fluencyLevel: 5,
          }),
        ])
      );
    });

    it('should return empty array when languagesData is empty', async () => {
      // Arrange
      const user = createTestUser();
      const languagesData: LanguageData[] = [];

      // Act
      const result = await service.createUserLanguages(user, languagesData);

      // Assert
      expect(result).toEqual([]);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should return empty array when languagesData is not an array', async () => {
      // Arrange
      const user = createTestUser();
      const languagesData = null as any;

      // Act
      const result = await service.createUserLanguages(user, languagesData);

      // Assert
      expect(result).toEqual([]);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should filter out invalid language data', async () => {
      // Arrange
      const user = createTestUser();
      const languagesData: any[] = [
        { languageCode: 'en', fluencyLevel: 4 }, // Valid
        { languageCode: '', fluencyLevel: 3 }, // Invalid: empty language code
        { languageCode: 'pt', fluencyLevel: 6 }, // Invalid: fluency level too high
        { languageCode: 'es', fluencyLevel: 0 }, // Invalid: fluency level too low
        { languageCode: 'fr', fluencyLevel: 3 }, // Valid
        null, // Invalid: null object
      ];
      const expectedUserLanguages = [
        createTestUserLanguage('en', 4),
        createTestUserLanguage('fr', 3),
      ];

      repository.save.mockResolvedValue(expectedUserLanguages as any);

      // Act
      const result = await service.createUserLanguages(user, languagesData);

      // Assert
      expect(result).toEqual(expectedUserLanguages);
      expect(repository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            languageCode: 'en',
            fluencyLevel: 4,
          }),
          expect.objectContaining({
            languageCode: 'fr',
            fluencyLevel: 3,
          }),
        ])
      );
    });
  });

  describe('updateUserLanguages', () => {
    it('should update user languages successfully', async () => {
      // Arrange
      const userId = 1;
      const languagesData: LanguageData[] = [
        { languageCode: 'en', fluencyLevel: 4 },
        { languageCode: 'pt', fluencyLevel: 5 },
      ];
      const expectedUserLanguages = [
        createTestUserLanguage('en', 4),
        createTestUserLanguage('pt', 5),
      ];

      repository.delete.mockResolvedValue({ affected: 2 } as any);
      repository.save.mockResolvedValue(expectedUserLanguages as any);

      // Act
      const result = await service.updateUserLanguages(userId, languagesData);

      // Assert
      expect(result).toEqual(expectedUserLanguages);
      expect(repository.delete).toHaveBeenCalledWith({ userId });
      expect(repository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId,
            languageCode: 'en',
            fluencyLevel: 4,
          }),
          expect.objectContaining({
            userId,
            languageCode: 'pt',
            fluencyLevel: 5,
          }),
        ])
      );
    });

    it('should delete existing languages and return empty array when no new languages', async () => {
      // Arrange
      const userId = 1;
      const languagesData: LanguageData[] = [];

      repository.delete.mockResolvedValue({ affected: 2 } as any);

      // Act
      const result = await service.updateUserLanguages(userId, languagesData);

      // Assert
      expect(result).toEqual([]);
      expect(repository.delete).toHaveBeenCalledWith({ userId });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('parseLanguagesData', () => {
    it('should parse valid JSON string', () => {
      // Arrange
      const jsonString = '[{"languageCode":"en","fluencyLevel":4},{"languageCode":"pt","fluencyLevel":5}]';
      const expectedData: LanguageData[] = [
        { languageCode: 'en', fluencyLevel: 4 },
        { languageCode: 'pt', fluencyLevel: 5 },
      ];

      // Act
      const result = service.parseLanguagesData(jsonString);

      // Assert
      expect(result).toEqual(expectedData);
    });

    it('should return array when input is already an array', () => {
      // Arrange
      const arrayData: LanguageData[] = [
        { languageCode: 'en', fluencyLevel: 4 },
        { languageCode: 'pt', fluencyLevel: 5 },
      ];

      // Act
      const result = service.parseLanguagesData(arrayData);

      // Assert
      expect(result).toEqual(arrayData);
    });

    it('should return empty array when JSON parsing fails', () => {
      // Arrange
      const invalidJson = 'invalid json string';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = service.parseLanguagesData(invalidJson);

      // Assert
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse languages JSON:', expect.any(SyntaxError));
      
      consoleSpy.mockRestore();
    });

    it('should return empty array when input is not string or array', () => {
      // Arrange
      const invalidInput = { someProperty: 'value' };

      // Act
      const result = service.parseLanguagesData(invalidInput as any);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when input is null', () => {
      // Act
      const result = service.parseLanguagesData(null as any);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when input is undefined', () => {
      // Act
      const result = service.parseLanguagesData(undefined as any);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
