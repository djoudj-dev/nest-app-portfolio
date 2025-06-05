import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { BadgeStatus } from '../enum/badge-status.enum';

export class UpdateBadgeDto {
  @IsOptional()
  @IsEnum(BadgeStatus)
  status?: BadgeStatus;

  @IsOptional()
  @IsDateString()
  availableUntil?: string;
}
