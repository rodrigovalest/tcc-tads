import { User } from '../entities/user.entity';
import { UpdateUserRequestDto } from '../dtos/requests/update-user.request-dto';
import { UserFieldUpdater } from '../helpers/user-field-updater';
import { PhotoUploadService } from '../services/photo-upload.service';
import { UserLanguageService } from '../services/user-language.service';
import { UserInterestTopicService } from '../services/user-interest-topic.service';
import { IUserRepository } from '../interfaces/user-repository.interface';

export interface UpdateStep {
  execute(): Promise<void>;
}

export class UpdateUserFieldsStep implements UpdateStep {
  constructor(
    private user: User,
    private updateDto: UpdateUserRequestDto
  ) {}

  async execute(): Promise<void> {
    UserFieldUpdater.updateFields(this.user, this.updateDto);
  }
}

export class UpdateUserPhotoStep implements UpdateStep {
  constructor(
    private user: User,
    private updateDto: UpdateUserRequestDto,
    private photo: Express.Multer.File | undefined,
    private baseUrl: string,
    private photoUploadService: PhotoUploadService
  ) {}

  async execute(): Promise<void> {
    if (this.photo) {
      const photoUrl = await this.photoUploadService.processPhotoUpload(this.photo, this.baseUrl);
      this.user.photo = photoUrl;
    }
  }
}

export class SaveUserStep implements UpdateStep {
  constructor(
    private user: User,
    private userRepository: IUserRepository
  ) {}

  async execute(): Promise<void> {
    await this.userRepository.save(this.user);
  }
}

export class UpdateUserRelationsStep implements UpdateStep {
  constructor(
    private userId: number,
    private updateDto: UpdateUserRequestDto,
    private userLanguageService: UserLanguageService,
    private userInterestTopicService: UserInterestTopicService
  ) {}

  async execute(): Promise<void> {
    const languagesData = this.userLanguageService.parseLanguagesData(this.updateDto.languages);
    const topicsData = this.userInterestTopicService.parseInterestTopicsData(this.updateDto.interestTopics);

    await Promise.all([
      this.userLanguageService.updateUserLanguages(this.userId, languagesData),
      this.userInterestTopicService.updateUserInterestTopics(this.userId, topicsData)
    ]);
  }
}

export class UserUpdatePipeline {
  private steps: UpdateStep[] = [];

  addStep(step: UpdateStep): this {
    this.steps.push(step);
    return this;
  }

  async execute(): Promise<void> {
    const [fieldStep, photoStep] = this.steps.slice(0, 2);
    if (fieldStep && photoStep) {
      await Promise.all([fieldStep.execute(), photoStep.execute()]);
    } else if (fieldStep) {
      await fieldStep.execute();
    }
    const remainingSteps = this.steps.slice(2);
    for (const step of remainingSteps) {
      await step.execute();
    }
  }
}
