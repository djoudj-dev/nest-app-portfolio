import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BadgeService } from './badge.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { Badge } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

@Controller('badges')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body(new ValidationPipe({ transform: true }))
    createBadgeDto: CreateBadgeDto,
  ): Promise<Badge | null> {
    return this.badgeService.create(createBadgeDto);
  }

  @Get()
  findAll(): Promise<Badge[] | null> {
    return this.badgeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Badge | null> {
    return this.badgeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true }))
    updateBadgeDto: UpdateBadgeDto,
  ): Promise<Badge | null> {
    return this.badgeService.update(id, updateBadgeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.badgeService.remove(id);
  }
}
