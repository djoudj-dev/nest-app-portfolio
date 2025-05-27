import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { Metric, MetricType } from '@prisma/client';
import { handleError } from '../common/utils/handle-error';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createMetric(createMetricDto: CreateMetricDto): Promise<Metric> {
    try {
      return await this.prisma.metric.create({
        data: {
          type: createMetricDto.type,
          path: createMetricDto.path,
          userId: createMetricDto.userId,
          userAgent: createMetricDto.userAgent,
          ipAddress: createMetricDto.ipAddress,
          metadata: createMetricDto.metadata,
        },
      });
    } catch (error: unknown) {
      return handleError('createMetric', error);
    }
  }

  async trackVisit(
    path: string,
    userId?: string,
    userAgent?: string,
    ipAddress?: string,
    metadata?: Record<string, any>,
  ): Promise<Metric | { skipped: boolean; reason: string }> {
    try {
      // Skip recording visits from bots
      if (this.isBot(userAgent)) {
        console.log(`Bot visit skipped: ${userAgent}`);
        return { skipped: true, reason: 'Bot traffic detected' };
      }

      // Skip recording duplicate visits from the same IP address to the same path
      if (ipAddress) {
        const existingVisit = await this.prisma.metric.findFirst({
          where: {
            type: MetricType.VISIT,
            path,
            ipAddress,
          },
        });

        if (existingVisit) {
          console.log(`Duplicate visit skipped: ${ipAddress} to ${path}`);
          return {
            skipped: true,
            reason: 'Duplicate visit from same IP address',
          };
        }
      }

      // Create the metric and return it
      return await this.createMetric({
        type: MetricType.VISIT,
        path,
        userId,
        userAgent,
        ipAddress,
        metadata,
      });
    } catch (error: unknown) {
      console.error('Error in trackVisit:', error);
      return {
        skipped: true,
        reason: 'Error tracking visit',
      };
    }
  }

  async getMetrics(type?: MetricType, isBot?: boolean): Promise<Metric[]> {
    try {
      const where = type ? { type } : {};

      // Get all metrics first
      const metrics = await this.prisma.metric.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      // If isBot is undefined, return all metrics
      if (isBot === undefined) {
        return metrics;
      }

      // Filter metrics by bot status
      return metrics.filter((metric) => {
        const isBotVisit = this.isBot(metric.userAgent);
        return isBot ? isBotVisit : !isBotVisit;
      });
    } catch (error: unknown) {
      return handleError('getMetrics', error);
    }
  }

  async getMetricsByPath(
    path: string,
    type?: MetricType,
    isBot?: boolean,
  ): Promise<Metric[]> {
    try {
      // Get metrics by path
      const metrics = await this.prisma.metric.findMany({
        where: {
          path,
          ...(type && { type }),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // If isBot is undefined, return all metrics
      if (isBot === undefined) {
        return metrics;
      }

      // Filter metrics by bot status
      return metrics.filter((metric) => {
        const isBotVisit = this.isBot(metric.userAgent);
        return isBot ? isBotVisit : !isBotVisit;
      });
    } catch (error: unknown) {
      return handleError('getMetricsByPath', error);
    }
  }

  async getMetricsByUser(userId: string, type?: MetricType): Promise<Metric[]> {
    try {
      return await this.prisma.metric.findMany({
        where: {
          userId,
          ...(type && { type }),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error: unknown) {
      return handleError('getMetricsByUser', error);
    }
  }

  async getMetricCount(type?: MetricType): Promise<number> {
    try {
      return await this.prisma.metric.count({
        where: type ? { type } : {},
      });
    } catch (error: unknown) {
      return handleError('getMetricCount', error);
    }
  }

  /**
   * Gets metrics from bot traffic
   * @param type Optional metric type filter
   * @returns Array of metrics from bot traffic
   */
  async getBotMetrics(type?: MetricType): Promise<Metric[]> {
    try {
      const metrics = await this.getMetrics(type);
      return metrics.filter((metric) => this.isBot(metric.userAgent));
    } catch (error: unknown) {
      return handleError('getBotMetrics', error);
    }
  }

  /**
   * Gets metrics from real user traffic
   * @param type Optional metric type filter
   * @returns Array of metrics from real user traffic
   */
  async getRealUserMetrics(type?: MetricType): Promise<Metric[]> {
    try {
      const metrics = await this.getMetrics(type);
      return metrics.filter((metric) => !this.isBot(metric.userAgent));
    } catch (error: unknown) {
      return handleError('getRealUserMetrics', error);
    }
  }

  /**
   * Gets bot metrics by path
   * @param path The path to filter by
   * @param type Optional metric type filter
   * @returns Array of bot metrics for the specified path
   */
  async getBotMetricsByPath(
    path: string,
    type?: MetricType,
  ): Promise<Metric[]> {
    try {
      const metrics = await this.getMetricsByPath(path, type);
      return metrics.filter((metric) => this.isBot(metric.userAgent));
    } catch (error: unknown) {
      return handleError('getBotMetricsByPath', error);
    }
  }

  /**
   * Gets real user metrics by path
   * @param path The path to filter by
   * @param type Optional metric type filter
   * @returns Array of real user metrics for the specified path
   */
  async getRealUserMetricsByPath(
    path: string,
    type?: MetricType,
  ): Promise<Metric[]> {
    try {
      const metrics = await this.getMetricsByPath(path, type);
      return metrics.filter((metric) => !this.isBot(metric.userAgent));
    } catch (error: unknown) {
      return handleError('getRealUserMetricsByPath', error);
    }
  }

  /**
   * Gets count of bot metrics
   * @param type Optional metric type filter
   * @returns Count of bot metrics
   */
  async getBotMetricCount(type?: MetricType): Promise<number> {
    try {
      const metrics = await this.getMetrics(type);
      return metrics.filter((metric) => this.isBot(metric.userAgent)).length;
    } catch (error: unknown) {
      return handleError('getBotMetricCount', error);
    }
  }

  /**
   * Gets count of real user metrics
   * @param type Optional metric type filter
   * @returns Count of real user metrics
   */
  async getRealUserMetricCount(type?: MetricType): Promise<number> {
    try {
      const metrics = await this.getMetrics(type);
      return metrics.filter((metric) => !this.isBot(metric.userAgent)).length;
    } catch (error: unknown) {
      return handleError('getRealUserMetricCount', error);
    }
  }
}
