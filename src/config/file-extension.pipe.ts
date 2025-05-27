import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class CvFileValidationPipe implements PipeTransform {
  private maxSize = 5 * 1024 * 1024;
  private allowedExt = /\.(pdf|doc|docx)$/i;

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException(`File exceeds 5MB`);
    }

    if (!this.allowedExt.test(file.originalname)) {
      throw new BadRequestException('Only .pdf, .doc, .docx files are allowed');
    }

    return file;
  }
}
