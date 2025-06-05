import { IsNotEmpty, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { BadgeStatus } from '../enum/badge-status.enum';

export class CreateBadgeDto {
  @IsNotEmpty()
  @IsEnum(BadgeStatus)
  status: BadgeStatus;

  @IsOptional()
  @IsDateString()
  availableUntil?: string;
}
