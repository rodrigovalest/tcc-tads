export class FileUploadService {
  
  static createPhotoFile(photoUri: string): { uri: string; name: string; type: string } {
    const filename = photoUri.split('/').pop() || 'photo.jpg';
    const ext = filename.split('.').pop()?.toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    
    return { uri: photoUri, name: filename, type: mime };
  }

  static validateImageType(type: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return allowedTypes.includes(type.toLowerCase());
  }

  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
}
