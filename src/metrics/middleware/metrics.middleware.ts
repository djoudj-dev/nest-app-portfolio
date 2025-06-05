import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricType } from '@prisma/client';
import { MetricsService } from '../metrics.service';
import { BotDetectorService } from '../utils/bot-detector';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly botDetector: BotDetectorService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const path = req.path;

    // Skip processing for static files and uploads
    if (
      path.includes('.') ||
      path.startsWith('/favicon.ico') ||
      path.startsWith('/metrics') ||
      path.startsWith('/uploads/')
    ) {
      return next();
    }

    const userAgent = req.headers['user-agent'] ?? '';
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) ??
      req.socket?.remoteAddress ??
      '';

    const isBot = this.botDetector.isBot(userAgent);
    const botType = isBot ? this.botDetector.identifyBotType(userAgent) : null;

    const metadata: Record<string, any> = {
      isBot,
      ...(isBot && { botType }),
      userAgent,
      ipAddress,
    };

    const isCvVisit = path === '/cv' || path.startsWith('/cv/');

    const type: MetricType = isCvVisit
      ? MetricType.CV_VISIT
      : isBot
        ? MetricType.BOT
        : MetricType.VISIT;

    const metricPayload = {
      type,
      path: isCvVisit ? '/cv' : path,
      userAgent,
      ipAddress,
      metadata: {
        ...metadata,
        ...(isCvVisit && {
          originalPath: path,
          cvAccess: true,
        }),
      },
    };

    try {
      await this.metricsService.createMetric(metricPayload);
    } catch (error) {
      console.error('❌ Error tracking metric:', error);
    }

    next();
  }
}
