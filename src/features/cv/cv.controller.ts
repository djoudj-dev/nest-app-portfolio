import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { CvNotFoundException } from '../../common/exceptions';
import * as fs from 'fs';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { getMulterConfig } from '../../config/multer.config';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body(new ValidationPipe({ transform: true })) createCvDto: CreateCvDto,
  ) {
    return this.cvService.create(createCvDto);
  }

  @Get('all')
  findAll() {
    return this.cvService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    return this.cvService.update(id, updateCvDto, updateCvDto.filePath);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.cvService.remove(id);
  }

  @Post('upload-file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', getMulterConfig()))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const createCvDto: CreateCvDto = {
      filePath: file.path,
    };

    const cv = await this.cvService.create(createCvDto);

    return {
      id: cv.id,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
    };
  }

  @Patch(':id/file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', getMulterConfig()))
  async updateFile(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.cvService.uploadFile(id, file);
  }

  @Get()
  async getCv(@Res() res: Response) {
    const cvWithFile = await this.cvService.findFirstWithFile();

    if (!cvWithFile || !cvWithFile.filePath) {
      throw new CvNotFoundException();
    }
    if (!fs.existsSync(cvWithFile.filePath)) {
      throw new CvNotFoundException();
    }

    const filename = path.basename(cvWithFile.filePath);
    const fileExtension = path.extname(cvWithFile.filePath).toLowerCase();

    let contentType = 'application/octet-stream';
    if (fileExtension === '.pdf') {
      contentType = 'application/pdf';
    } else if (fileExtension === '.doc') {
      contentType = 'application/msword';
    } else if (fileExtension === '.docx') {
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(cvWithFile.filePath);
    fileStream.pipe(res);
  }

  @Get(':id/file-info')
  async getFileInfo(@Param('id') id: string, @Res() res: Response) {
    const cv = await this.cvService.findOne(id);

    if (!cv.filePath) {
      throw new CvNotFoundException(id);
    }

    // Check if file exists
    if (!fs.existsSync(cv.filePath)) {
      throw new CvNotFoundException();
    }

    const filename = path.basename(cv.filePath);
    const fileStats = fs.statSync(cv.filePath);
    const fileExtension = path.extname(cv.filePath).toLowerCase();

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
