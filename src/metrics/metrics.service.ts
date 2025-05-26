import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { Metric, MetricType } from '@prisma/client';
import { handleError } from '../common/utils/handle-error';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

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
  ): Promise<Metric> {
    try {
      return await this.createMetric({
        type: MetricType.VISIT,
        path,
        userId,
        userAgent,
        ipAddress,
        metadata,
      });
    } catch (error: unknown) {
      return handleError('trackVisit', error);
    }
  }

  async getMetrics(type?: MetricType): Promise<Metric[]> {
    try {
      const where = type ? { type } : {};
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
}
