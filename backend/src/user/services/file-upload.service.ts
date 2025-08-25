import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }
  saveFile(file: Express.Multer.File): string {
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadPath, uniqueFileName);
    fs.writeFileSync(filePath, file.buffer);
    return uniqueFileName;
  }

  deleteFile(fileName: string): void {
    if (!fileName) return;

    const filePath = path.join(this.uploadPath, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  validateImageFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Tipo de arquivo não permitido. Use apenas JPEG, PNG, GIF ou WebP.');
    }

    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
    }

    return true;
  }
  
  getFileUrl(fileName: string, baseUrl: string): string | null {
    if (!fileName) return null;
    return `${baseUrl}/uploads/${fileName}`;
  }
}
