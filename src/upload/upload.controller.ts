import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  constructor() {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return {
      originalname: file.originalname,
      filename: file.filename,
      path: file.path,
    };
  }

  @Post('files')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  uploadFiles(
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    return files.map((file) => ({
      originalname: file.originalname,
      filename: file.filename,
      path: file.path,
    }));
  }
}
