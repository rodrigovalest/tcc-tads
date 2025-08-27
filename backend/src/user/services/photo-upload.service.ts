import { BadRequestException, Injectable } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';

@Injectable()
export class PhotoUploadService {
  constructor(
    private readonly fileUploadService: FileUploadService,
  ) {}

  async processPhotoUpload(photo: Express.Multer.File | undefined, baseUrl: string): Promise<string | undefined> {
    if (!photo) {
      return undefined;
    }

    try {
      this.fileUploadService.validateImageFile(photo);
      const fileName = this.fileUploadService.saveFile(photo);
      const url = this.fileUploadService.getFileUrl(fileName, baseUrl);
      return url || undefined;
    } catch (error) {
      throw new BadRequestException(`Photo upload failed: ${error.message}`);
    }
  }

  validatePhotoFile(photo: Express.Multer.File): void {
    this.fileUploadService.validateImageFile(photo);
  }
}
