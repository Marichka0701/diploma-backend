import { BadRequestException } from '@nestjs/common';

export class FileUploadService {
  public upload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      path: file.path,
    };
  }
}
