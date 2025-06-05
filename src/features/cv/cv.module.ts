import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { getMulterConfig } from '../../config/multer.config';

@Module({
  imports: [PrismaModule, MulterModule.register(getMulterConfig())],
  controllers: [CvController],
  providers: [CvService],
  exports: [CvService, MulterModule],
})
export class CvModule {}
