import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { BotMetricsController } from './bot-metrics.controller';
import { PrismaService } from '../prisma/prisma.service';
import { BotDetectorService } from './utils/bot-detector';

@Module({
  controllers: [MetricsController, BotMetricsController],
  providers: [MetricsService, PrismaService, BotDetectorService],
  exports: [MetricsService, BotDetectorService],
})
export class MetricsModule {}
