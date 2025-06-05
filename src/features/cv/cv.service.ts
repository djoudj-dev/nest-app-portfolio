import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { handleError } from '../../common/exceptions';
import { CvNotFoundException } from '../../common/exceptions';
import * as fs from 'fs';

// Define the CV type to match the Prisma schema
type CV = {
  id: string;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CvService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCvDto: CreateCvDto): Promise<CV> {
    try {
      return await this.prisma.cV.create({
        data: {
          filePath: createCvDto.filePath || '',
        },
      });
    } catch (error: unknown) {
      return handleError('create CV', error);
    }
  }

  async findAll(): Promise<CV[]> {
    try {
      return await this.prisma.cV.findMany();
    } catch (error: unknown) {
      return handleError('find all CVs', error);
    }
  }

  async findOne(id: string): Promise<CV> {
    let cv: CV | null = null;
    try {
      cv = await this.prisma.cV.findUnique({
        where: { id },
      });
    } catch (error: unknown) {
      return handleError(`find CV ${id}`, error);
    }

    if (!cv) {
      throw new CvNotFoundException(id);
    }

    return cv;
  }

  async update(
    id: string,
    updateCvDto: UpdateCvDto,
    filePath?: string,
  ): Promise<CV> {
    try {
      await this.findOne(id);

      const data: Record<string, unknown> = { ...updateCvDto };
      if (filePath) {
        data.filePath = filePath;
      }

      return await this.prisma.cV.update({
        where: { id },
        data,
      });
    } catch (error: unknown) {
      // Don't catch NotFoundException or CvNotFoundException, let it propagate
      if (
        !(error instanceof NotFoundException) &&
        !(error instanceof CvNotFoundException)
      ) {
        return handleError(`update CV ${id}`, error);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<CV> {
    try {
      // Check if CV exists
      await this.findOne(id);

      return await this.prisma.cV.delete({
        where: { id },
      });
    } catch (error: unknown) {
      // Don't catch NotFoundException or CvNotFoundException, let it propagate
      if (
        !(error instanceof NotFoundException) &&
        !(error instanceof CvNotFoundException)
      ) {
        return handleError(`delete CV ${id}`, error);
      }
      throw error;
    }
  }

  async uploadFile(id: string, file: Express.Multer.File): Promise<CV> {
    const cv = await this.findOne(id);

    if (cv.filePath && fs.existsSync(cv.filePath)) {
      try {
        fs.unlinkSync(cv.filePath);
      } catch (error) {
        console.error(`Failed to delete old CV file: ${cv.filePath}`, error);
      }
    }

    return this.prisma.cV.update({
      where: { id },
      data: {
        filePath: file.path,
      },
    });
  }

  async findFirstWithFile(): Promise<CV | null> {
    const cvs = await this.findAll();
    return cvs.find((cv) => cv.filePath && cv.filePath.trim() !== '') || null;
  }
}
