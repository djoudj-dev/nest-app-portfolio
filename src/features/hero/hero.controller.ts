import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  UseGuards,
  Res,
} from '@nestjs/common';
import { CvNotFoundException } from '../../common/exceptions';
import { HeroService } from './hero.service';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { Hero } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { getMulterConfig } from '../../config/multer.config';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('heroes')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body(new ValidationPipe({ transform: true })) createHeroDto: CreateHeroDto,
  ): Promise<Hero> {
    console.log('Received DTO:', createHeroDto);
    return this.heroService.create(createHeroDto);
  }

  @Get()
  findAll(): Promise<Hero[]> {
    return this.heroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Hero> {
    return this.heroService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateHeroDto: UpdateHeroDto,
  ): Promise<Hero> {
    return this.heroService.update(id, updateHeroDto, updateHeroDto.cvPath);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string): Promise<Hero> {
    return this.heroService.remove(id);
  }

  @Post('upload-cv')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', getMulterConfig()))
  uploadCv(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return {
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
    };
  }

  @Patch(':id/cv')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', getMulterConfig()))
  async updateCv(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ): Promise<Hero> {
    return this.heroService.uploadCv(id, file);
  }

  @Get(':id/cv')
  async getCvInfo(@Param('id') id: string, @Res() res: Response) {
    const hero = await this.heroService.findOne(id);

    if (!hero.cvPath) {
      throw new CvNotFoundException(id);
    }

    // Check if file exists
    if (!fs.existsSync(hero.cvPath)) {
      throw new CvNotFoundException();
    }

    const filename = path.basename(hero.cvPath);
    const fileStats = fs.statSync(hero.cvPath);
    const fileExtension = path.extname(hero.cvPath).toLowerCase();

    // Determine file type
    let fileType = 'unknown';
    if (fileExtension === '.pdf') {
      fileType = 'pdf';
    } else if (['.doc', '.docx'].includes(fileExtension)) {
      fileType = 'word';
    }

    // Create URL for the file
    const fileUrl = `/uploads/${filename}`;

    return res.json({
      filename,
      fileUrl,
      fileType,
      fileSize: fileStats.size,
      lastModified: fileStats.mtime,
      mimetype:
        fileExtension === '.pdf'
          ? 'application/pdf'
          : fileExtension === '.doc'
            ? 'application/msword'
            : fileExtension === '.docx'
              ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              : 'application/octet-stream',
    });
  }
}
