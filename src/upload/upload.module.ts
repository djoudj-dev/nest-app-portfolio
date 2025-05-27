import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

// Create a separate provider for Multer configuration
const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './src/uploads';
      // Ensure the directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate a unique filename with original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (
    req,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    // Accept images, documents, etc.
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  },
};

@Module({
  imports: [MulterModule.register(multerConfig)],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService, MulterModule],
})
export class UploadModule {}
