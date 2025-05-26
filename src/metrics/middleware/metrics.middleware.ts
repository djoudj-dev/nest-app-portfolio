import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../metrics.service';

interface AuthUser {
  userId: string;
  email: string;
}

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (
      req.path.startsWith('/metrics') ||
      req.path.includes('.') ||
      req.path.startsWith('/favicon.ico')
    ) {
      return next();
    }

    const path = req.path;
    const userAgent = req.headers['user-agent'] as string;

    const forwardedFor = req.headers['x-forwarded-for'] as string | undefined;
    const ipAddress = forwardedFor || (req.socket.remoteAddress as string);

    const user = req.user as AuthUser | undefined;
    const userId = user?.userId;

    this.metricsService
      .trackVisit(path, userId, userAgent, ipAddress)
      .catch((error) => {
        console.error('Error tracking visit:', error);
      });

    next();
  }
}
