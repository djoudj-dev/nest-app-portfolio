import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { Metric, MetricType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post()
  async createMetric(
    @Body() createMetricDto: CreateMetricDto,
  ): Promise<Metric> {
    return this.metricsService.createMetric(createMetricDto);
  }

  @Post('visit')
  async trackVisit(
    @Body('path') path: string,
    @Body('userId') userId?: string,
    @Body('userAgent') userAgent?: string,
    @Body('ipAddress') ipAddress?: string,
    @Body('metadata') metadata?: Record<string, any>,
  ): Promise<Metric | { skipped: boolean; reason: string }> {
    return this.metricsService.trackVisit(
      path,
      userId,
      userAgent,
      ipAddress,
      metadata,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMetrics(@Query('type') type?: MetricType): Promise<Metric[]> {
    return this.metricsService.getMetrics(type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('path')
  async getMetricsByPath(
    @Query('path') path: string,
    @Query('type') type?: MetricType,
  ): Promise<Metric[]> {
    return this.metricsService.getMetricsByPath(path, type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getMetricsByUser(
    @Query('userId') userId: string,
    @Query('type') type?: MetricType,
  ): Promise<Metric[]> {
    return this.metricsService.getMetricsByUser(userId, type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('count')
  async getMetricCount(
    @Query('type') type?: MetricType,
  ): Promise<{ count: number }> {
    const count = await this.metricsService.getMetricCount(type);
    return { count };
  }
}
