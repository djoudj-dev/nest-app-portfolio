import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MetricType } from '@prisma/client';

export class CreateMetricDto {
  @IsEnum(MetricType)
  type: MetricType;

  @IsString()
  path: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
