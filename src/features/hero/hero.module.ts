import { Module } from '@nestjs/common';
import { HeroController } from './hero.controller';
import { HeroService } from './hero.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { getMulterConfig } from '../../config/multer.config';

@Module({
  imports: [PrismaModule, MulterModule.register(getMulterConfig())],
  controllers: [HeroController],
  providers: [HeroService],
  exports: [HeroService, MulterModule],
})
export class HeroModule {}
