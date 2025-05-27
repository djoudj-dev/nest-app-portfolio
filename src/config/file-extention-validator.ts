import { BadRequestException } from '@nestjs/common';
import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class FileExtensionValidator implements PipeTransform {
  constructor(private readonly allowedExt: RegExp) {}

  transform(file: Express.Multer.File) {
    if (!this.allowedExt.test(file.originalname)) {
      throw new BadRequestException('File type not allowed by extension');
    }
    return file;
  }
}
