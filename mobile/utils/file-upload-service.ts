export class FileUploadService {
  
  async fetchAsBlob(uri: string): Promise<Blob> {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const blob = await response.blob();
      return blob;
    } catch (error) {
      throw new Error(`Error fetching file as blob: ${error}`);
    }
  }

  createFileObject(uri: string, name: string, type: string): { uri: string; name: string; type: string } {
    return { uri, name, type };
  }

  validateImageType(type: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return allowedTypes.includes(type.toLowerCase());
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  generateFileName(originalName: string, prefix = 'upload'): string {
    const timestamp = Date.now();
    const extension = this.getFileExtension(originalName);
    return `${prefix}_${timestamp}.${extension}`;
  }
}
