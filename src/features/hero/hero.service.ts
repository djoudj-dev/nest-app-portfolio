import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { Hero } from '@prisma/client';
import { handleError } from '../../common/exceptions';
import { HeroNotFoundException } from '../../common/exceptions';
import * as fs from 'fs';

@Injectable()
export class HeroService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHeroDto: CreateHeroDto): Promise<Hero> {
    try {
      return await this.prisma.hero.create({
        data: {
          firstName: createHeroDto.firstName,
          lastName: createHeroDto.lastName,
          jobTitle: createHeroDto.jobTitle,
          jobDescription: createHeroDto.jobDescription,
          cvPath: createHeroDto.cvPath || '',
        },
      });
    } catch (error: unknown) {
      return handleError('create hero', error);
    }
  }

  async findAll(): Promise<Hero[]> {
    try {
      return await this.prisma.hero.findMany();
    } catch (error: unknown) {
      return handleError('find all heroes', error);
    }
  }

  async findOne(id: string): Promise<Hero> {
    let hero: Hero | null;
    try {
      hero = await this.prisma.hero.findUnique({
        where: { id },
      });
    } catch (error: unknown) {
      return handleError(`find hero ${id}`, error);
    }

    if (!hero) {
      throw new HeroNotFoundException(id);
    }

    return hero;
  }

  async update(
    id: string,
    updateHeroDto: UpdateHeroDto,
    cvPath?: string,
  ): Promise<Hero> {
    try {
      await this.findOne(id);

      const data: Record<string, unknown> = { ...updateHeroDto };
      if (cvPath) {
        data.cvPath = cvPath;
      }

      return await this.prisma.hero.update({
        where: { id },
        data,
      });
    } catch (error: unknown) {
      // Don't catch NotFoundException or HeroNotFoundException, let it propagate
      if (
        !(error instanceof NotFoundException) &&
        !(error instanceof HeroNotFoundException)
      ) {
        return handleError(`update hero ${id}`, error);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Hero> {
    try {
      // Check if hero exists
      await this.findOne(id);

      return await this.prisma.hero.delete({
        where: { id },
      });
    } catch (error: unknown) {
      // Don't catch NotFoundException or HeroNotFoundException, let it propagate
      if (
        !(error instanceof NotFoundException) &&
        !(error instanceof HeroNotFoundException)
      ) {
        return handleError(`delete hero ${id}`, error);
      }
      throw error;
    }
  }

  async uploadCv(id: string, file: Express.Multer.File): Promise<Hero> {
    const hero = await this.findOne(id);

    if (hero.cvPath && fs.existsSync(hero.cvPath)) {
      try {
        fs.unlinkSync(hero.cvPath);
      } catch (error) {
        console.error(`Failed to delete old CV file: ${hero.cvPath}`, error);
      }
    }

    return this.prisma.hero.update({
      where: { id },
      data: {
        cvPath: file.path,
      },
    });
  }
}
