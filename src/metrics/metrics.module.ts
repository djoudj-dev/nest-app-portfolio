import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { BotMetricsController } from './bot-metrics.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MetricsController, BotMetricsController],
  providers: [MetricsService, PrismaService],
  exports: [MetricsService],
})
export class MetricsModule {}
