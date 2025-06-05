import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Metric, MetricType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Request } from 'express';

@Controller('metrics')
export class BotMetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('bots')
  async getBotMetrics(@Query('type') type?: MetricType): Promise<Metric[]> {
    return this.metricsService.getBotMetrics(type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('real-users')
  async getRealUserMetrics(
    @Query('type') type?: MetricType,
  ): Promise<Metric[]> {
    return this.metricsService.getRealUserMetrics(type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bots/path')
  async getBotMetricsByPath(@Query('path') path: string): Promise<Metric[]> {
    return this.metricsService.getBotMetricsByPath(path);
  }

  @UseGuards(JwtAuthGuard)
  @Get('real-users/path')
  async getRealUserMetricsByPath(
    @Query('path') path: string,
    @Query('type') type?: MetricType,
  ): Promise<Metric[]> {
    return this.metricsService.getRealUserMetricsByPath(path, type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bots/count')
  async getBotMetricCount(): Promise<{ count: number }> {
    const count = await this.metricsService.getBotMetricCount();
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Get('real-users/count')
  async getRealUserMetricCount(): Promise<{ count: number }> {
    const count = await this.metricsService.getRealUserMetricCount();
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Get('unique-users/count')
  async getUniqueUsersCount(
    @Query('date') dateStr?: string,
  ): Promise<{ count: number }> {
    const date = dateStr ? new Date(dateStr) : undefined;
    const count = await this.metricsService.getUniqueUsersPerDay(date);
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Get('unique-bots/count')
  async getUniqueBotsCount(
    @Query('date') dateStr?: string,
  ): Promise<{ count: number }> {
    const date = dateStr ? new Date(dateStr) : undefined;
    const count = await this.metricsService.getUniqueBotsPerDay(date);
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Get('cv/count')
  async getCvVisitMetricCount(): Promise<{ count: number }> {
    const count = await this.metricsService.getCvVisitMetricCount();
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Get('cv-clicks/count')
  async getCvClickMetricCount(): Promise<{ count: number }> {
    const count = await this.metricsService.getCvClickMetricCount();
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Get('unique-cv-clicks/count')
  async getUniqueCvClicksCount(
    @Query('date') dateStr?: string,
  ): Promise<{ count: number }> {
    const date = dateStr ? new Date(dateStr) : undefined;
    const count = await this.metricsService.getUniqueCvClicksPerDay(date);
    return { count };
  }

  @Post('cv-click')
  async trackCvClick(
    @Body() body: { cvId?: string },
    @Req() req: Request,
  ): Promise<Metric> {
    const userAgent = req.headers['user-agent'] as string;
    const forwardedFor = req.headers['x-forwarded-for'] as string | undefined;
    const ipAddress = forwardedFor || (req.socket.remoteAddress as string);

    const user = req.user as { userId: string; email: string } | undefined;
    const userId = user?.userId;

    return this.metricsService.createMetric({
      type: MetricType.CV_CLICK,
      path: '/cv',
      userId,
      userAgent,
      ipAddress,
      metadata: {
        cvId: body.cvId,
        isClick: true,
      },
    });
  }
}
