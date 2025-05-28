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
} from '@nestjs/common';
import { HeroService } from './hero.service';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { Hero } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { getMulterConfig } from '../../config/multer.config';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

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
}
