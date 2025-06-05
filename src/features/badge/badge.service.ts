import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Badge } from '@prisma/client';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { handleError } from '../../common/exceptions';
import { BadgeStatus } from './enum/badge-status.enum';

@Injectable()
export class BadgeService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.initializeBadges();
  }

  private async initializeBadges(): Promise<void> {
    try {
      const badgeCount = await this.prisma.badge.count();

      if (badgeCount === 0) {
        await this.prisma.badge.create({
          data: {
            status: BadgeStatus.DISPONIBLE,
            availableUntil: null,
            isAvailable: true,
          },
        });
        console.log('✅ Default badge created');
      }
    } catch (error) {
      console.error('❌ Error initializing badges:', error);
    }
  }

  async create(createBadgeDto: CreateBadgeDto): Promise<Badge | null> {
    try {
      const { status } = createBadgeDto;
      let availableUntil: Date | null = null;
      let isAvailable = true;

      if (createBadgeDto.availableUntil) {
        availableUntil = new Date(createBadgeDto.availableUntil);
      }

      if (status === BadgeStatus.INDISPONIBLE) {
        isAvailable = false;
      } else if (status === BadgeStatus.DISPONIBLE_A_PARTIR_DE) {
        isAvailable = availableUntil
          ? availableUntil.getTime() <= Date.now()
          : false;
      }

      return await this.prisma.badge.create({
        data: {
          status,
          availableUntil,
          isAvailable,
        },
      });
    } catch (error: unknown) {
      return handleError('create badge', error);
    }
  }

  async findAll(): Promise<Badge[] | null> {
    try {
      return await this.prisma.badge.findMany();
    } catch (error: unknown) {
      return handleError('find all badges', error);
    }
  }

  async findOne(id: string): Promise<Badge | null> {
    try {
      const badge = await this.prisma.badge.findUnique({ where: { id } });
      if (!badge) return null;
      return badge;
    } catch (error: unknown) {
      return handleError(`find badge ${id}`, error);
    }
  }

  async update(
    id: string,
    updateBadgeDto: UpdateBadgeDto,
  ): Promise<Badge | null> {
    try {
      const badge = await this.findOne(id);
      if (!badge) return null;

      const data: Partial<Badge> = {};

      if (updateBadgeDto.status !== undefined) {
        data.status = updateBadgeDto.status;
      }

      if (updateBadgeDto.availableUntil !== undefined) {
        data.availableUntil = new Date(updateBadgeDto.availableUntil);
      }

      const finalStatus = data.status ?? badge.status;
      const finalAvailableUntil = data.availableUntil ?? badge.availableUntil;

      if (finalStatus === BadgeStatus.INDISPONIBLE) {
        data.isAvailable = false;
      } else if (finalStatus === BadgeStatus.DISPONIBLE_A_PARTIR_DE) {
        data.isAvailable = finalAvailableUntil
          ? finalAvailableUntil.getTime() <= Date.now()
          : false;
      } else {
        data.isAvailable = true;
      }

      return await this.prisma.badge.update({
        where: { id },
        data,
      });
    } catch (error: unknown) {
      return handleError(`update badge ${id}`, error);
    }
  }

  async remove(id: string): Promise<Badge | null> {
    try {
      const badge = await this.findOne(id);
      if (!badge) return null;

      return await this.prisma.badge.delete({
        where: { id },
      });
    } catch (error: unknown) {
      return handleError(`delete badge ${id}`, error);
    }
  }
}
