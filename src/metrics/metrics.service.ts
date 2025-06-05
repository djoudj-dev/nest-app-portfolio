import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { Metric, MetricType } from '@prisma/client';
import { handleError } from '../common/exceptions';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async createMetric(createMetricDto: CreateMetricDto): Promise<Metric> {
    try {
      if (createMetricDto.ipAddress) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingMetric = await this.prisma.metric.findFirst({
          where: {
            type: createMetricDto.type,
            ipAddress: createMetricDto.ipAddress,
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
          },
        });

        if (existingMetric) {
          console.log(
            `Duplicate ${createMetricDto.type} metric skipped for IP ${createMetricDto.ipAddress}`,
          );
          return existingMetric;
        }
      }

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
      // Create the metric - the createMetric method will handle duplicate checking
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

  async getMetrics(type?: MetricType): Promise<Metric[]> {
    try {
      const where = type ? { type } : {};

      // Get all metrics
      return await this.prisma.metric.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error: unknown) {
      return handleError('getMetrics', error);
    }
  }

  async getMetricsByPath(path: string, type?: MetricType): Promise<Metric[]> {
    try {
      // Get metrics by path and type
      return await this.prisma.metric.findMany({
        where: {
          path,
          ...(type && { type }),
        },
        orderBy: {
          createdAt: 'desc',
        },
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

  async getBotMetrics(type?: MetricType): Promise<Metric[]> {
    try {
      const botMetrics = await this.prisma.metric.findMany({
        where: {
          type: MetricType.BOT,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!type || type === MetricType.BOT) {
        return botMetrics;
      }

      return botMetrics.filter((metric) => metric.type === type);
    } catch (error: unknown) {
      return handleError('getBotMetrics', error);
    }
  }

  async getRealUserMetrics(type?: MetricType): Promise<Metric[]> {
    try {
      // Get metrics with VISIT type (real users)
      const whereClause = {
        type: type || MetricType.VISIT,
      };

      return await this.prisma.metric.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error: unknown) {
      return handleError('getRealUserMetrics', error);
    }
  }

  async getBotMetricsByPath(path: string): Promise<Metric[]> {
    try {
      return await this.prisma.metric.findMany({
        where: {
          path,
          type: MetricType.BOT,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error: unknown) {
      return handleError('getBotMetricsByPath', error);
    }
  }

  async getRealUserMetricsByPath(
    path: string,
    type?: MetricType,
  ): Promise<Metric[]> {
    try {
      return await this.prisma.metric.findMany({
        where: {
          path,
          type: type || MetricType.VISIT,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error: unknown) {
      return handleError('getRealUserMetricsByPath', error);
    }
  }

  async getBotMetricCount(): Promise<number> {
    try {
      return await this.prisma.metric.count({
        where: {
          type: MetricType.BOT,
        },
      });
    } catch (error: unknown) {
      return handleError('getBotMetricCount', error);
    }
  }

  async getCvVisitMetricCount(): Promise<number> {
    try {
      return await this.prisma.metric.count({
        where: {
          type: MetricType.CV_VISIT,
        },
      });
    } catch (error: unknown) {
      return handleError('getCvVisitMetricCount', error);
    }
  }

  async getCvClickMetricCount(): Promise<number> {
    try {
      return await this.prisma.metric.count({
        where: {
          type: MetricType.CV_CLICK,
        },
      });
    } catch (error: unknown) {
      return handleError('getCvClickMetricCount', error);
    }
  }

  async getRealUserMetricCount(): Promise<number> {
    try {
      return await this.prisma.metric.count({
        where: {
          type: MetricType.VISIT,
        },
      });
    } catch (error: unknown) {
      return handleError('getRealUserMetricCount', error);
    }
  }

  async getUniqueUsersPerDay(date?: Date): Promise<number> {
    try {
      const targetDate = date || new Date();
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const uniqueUsers = await this.prisma.metric.findMany({
        where: {
          type: MetricType.VISIT,
          createdAt: {
            gte: targetDate,
            lt: nextDay,
          },
          ipAddress: {
            not: null,
          },
        },
        distinct: ['ipAddress'],
        select: {
          ipAddress: true,
        },
      });

      return uniqueUsers.length;
    } catch (error: unknown) {
      return handleError('getUniqueUsersPerDay', error);
    }
  }

  async getUniqueBotsPerDay(date?: Date): Promise<number> {
    try {
      const targetDate = date || new Date();
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Get distinct IP addresses for BOT metrics on the specified day
      const uniqueBots = await this.prisma.metric.findMany({
        where: {
          type: MetricType.BOT,
          createdAt: {
            gte: targetDate,
            lt: nextDay,
          },
          ipAddress: {
            not: null,
          },
        },
        distinct: ['ipAddress'],
        select: {
          ipAddress: true,
        },
      });

      return uniqueBots.length;
    } catch (error: unknown) {
      return handleError('getUniqueBotsPerDay', error);
    }
  }

  async getUniqueCvClicksPerDay(date?: Date): Promise<number> {
    try {
      const targetDate = date || new Date();
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Get distinct IP addresses for CV_CLICK metrics on the specified day
      const uniqueClicks = await this.prisma.metric.findMany({
        where: {
          type: MetricType.CV_CLICK,
          createdAt: {
            gte: targetDate,
            lt: nextDay,
          },
          ipAddress: {
            not: null,
          },
        },
        distinct: ['ipAddress'],
        select: {
          ipAddress: true,
        },
      });

      return uniqueClicks.length;
    } catch (error: unknown) {
      return handleError('getUniqueCvClicksPerDay', error);
    }
  }
}
