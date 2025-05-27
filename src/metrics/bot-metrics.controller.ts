import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Metric, MetricType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('metrics')
export class BotMetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Get metrics from bot traffic
   */
  @UseGuards(JwtAuthGuard)
  @Get('bots')
  async getBotMetrics(@Query('type') type?: MetricType): Promise<Metric[]> {
    const allMetrics = await this.metricsService.getMetrics(type);
    return allMetrics.filter((metric) => this.isBot(metric.userAgent));
  }

  /**
   * Get metrics from real user traffic
   */
  @UseGuards(JwtAuthGuard)
  @Get('real-users')
  async getRealUserMetrics(
    @Query('type') type?: MetricType,
  ): Promise<Metric[]> {
    const allMetrics = await this.metricsService.getMetrics(type);
    return allMetrics.filter((metric) => !this.isBot(metric.userAgent));
  }

  /**
   * Get bot metrics by path
   */
  @UseGuards(JwtAuthGuard)
  @Get('bots/path')
  async getBotMetricsByPath(
    @Query('path') path: string,
    @Query('type') type?: MetricType,
  ): Promise<Metric[]> {
    const pathMetrics = await this.metricsService.getMetricsByPath(path, type);
    return pathMetrics.filter((metric) => this.isBot(metric.userAgent));
  }

  /**
   * Get real user metrics by path
   */
  @UseGuards(JwtAuthGuard)
  @Get('real-users/path')
  async getRealUserMetricsByPath(
    @Query('path') path: string,
    @Query('type') type?: MetricType,
  ): Promise<Metric[]> {
    const pathMetrics = await this.metricsService.getMetricsByPath(path, type);
    return pathMetrics.filter((metric) => !this.isBot(metric.userAgent));
  }

  /**
   * Get count of bot metrics
   */
  @UseGuards(JwtAuthGuard)
  @Get('bots/count')
  async getBotMetricCount(
    @Query('type') type?: MetricType,
  ): Promise<{ count: number }> {
    const allMetrics = await this.metricsService.getMetrics(type);
    const count = allMetrics.filter((metric) =>
      this.isBot(metric.userAgent),
    ).length;
    return { count };
  }

  /**
   * Get count of real user metrics
   */
  @UseGuards(JwtAuthGuard)
  @Get('real-users/count')
  async getRealUserMetricCount(
    @Query('type') type?: MetricType,
  ): Promise<{ count: number }> {
    const allMetrics = await this.metricsService.getMetrics(type);
    const count = allMetrics.filter(
      (metric) => !this.isBot(metric.userAgent),
    ).length;
    return { count };
  }

  /**
   * Checks if a user agent string belongs to a bot
   * @param userAgent The user agent string to check
   * @returns true if the user agent is from a bot, false otherwise
   */
  private isBot(userAgent?: string | null): boolean {
    if (!userAgent) return false;

    const userAgentLower = userAgent.toLowerCase();

    // Common bot identifiers
    const botPatterns = [
      'bot',
      'crawler',
      'spider',
      'slurp',
      'baiduspider',
      'yandexbot',
      'facebookexternalhit',
      'linkedinbot',
      'twitterbot',
      'slackbot',
      'telegrambot',
      'whatsapp',
      'ahrefsbot',
      'semrushbot',
      'pingdom',
      'googlebot',
      'bingbot',
      'yandex',
      'duckduckbot',
      'ia_archiver',
      'applebot',
      'headlesschrome',
      'lighthouse',
      'pagespeed',
      'ptst',
      'uptimerobot',
      'bitlybot',
      'discordbot',
      'curl',
      'wget',
      'python-requests',
      'axios',
      'postman',
      'insomnia',
      'screaming frog',
      'sitebulb',
      'netcraft',
      'check_http',
      'monitoring',
    ];

    return botPatterns.some((pattern) => userAgentLower.includes(pattern));
  }
}
