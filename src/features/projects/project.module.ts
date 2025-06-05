import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { getImageMulterConfig } from '../../config/multer.config';

@Module({
  imports: [PrismaModule, MulterModule.register(getImageMulterConfig())],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService, MulterModule],
})
export class ProjectModule {}
