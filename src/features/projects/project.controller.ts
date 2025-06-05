import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { getImageMulterConfig } from '../../config/multer.config';
import * as fs from 'fs';
import * as path from 'path';

// Import types for return type annotations
type ProjectWithCategory = {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  categoryId: string;
  deployUrl?: string | null;
  iconDeploy: string;
  technologies: string[];
  priority: number;
  repos: any;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    label: string;
    icon: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

type ProjectCategory = {
  id: string;
  label: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  projects?: ProjectWithCategory[];
};

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body(new ValidationPipe({ transform: true }))
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectWithCategory> {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  async findAll(): Promise<{
    projects: ProjectWithCategory[];
    categories: { id: string; icon: string; label: string }[];
  }> {
    const projects = await this.projectService.findAll();
    const categories = await this.projectService.findAllCategories();

    // Format categories according to the expected structure
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      icon: category.icon,
      label: category.label,
    }));

    // Return both projects and categories
    // This ensures backward compatibility with existing code
    // while also providing the categories property expected by the frontend
    return {
      projects,
      categories: formattedCategories,
    };
  }

  // Project Category endpoints
  @Get('categories')
  findAllCategories(): Promise<ProjectCategory[]> {
    return this.projectService.findAllCategories();
  }

  @Get('categories/:id')
  findOneCategory(@Param('id') id: string): Promise<ProjectCategory> {
    return this.projectService.findOneCategory(id);
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  createCategory(
    @Body(new ValidationPipe({ transform: true }))
    data: {
      label: string;
      icon: string;
    },
  ): Promise<ProjectCategory> {
    return this.projectService.createCategory(data);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  updateCategory(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true }))
    data: {
      label?: string;
      icon?: string;
    },
  ): Promise<ProjectCategory> {
    return this.projectService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  removeCategory(@Param('id') id: string): Promise<ProjectCategory> {
    return this.projectService.removeCategory(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProjectWithCategory> {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true }))
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectWithCategory> {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string): Promise<ProjectWithCategory> {
    return this.projectService.remove(id);
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', getImageMulterConfig()))
  uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ): { filename: string; path: string; mimetype: string } {
    // Convert the file path to a URL path by removing the leading './'
    const imagePath = file.path.replace(/^\.\//, '/');

    return {
      filename: file.filename,
      path: imagePath,
      mimetype: file.mimetype,
    };
  }

  @Patch(':id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', getImageMulterConfig()))
  async updateImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ): Promise<ProjectWithCategory> {
    return this.projectService.uploadImage(id, file);
  }

  @Get(':id/image')
  async getProjectImage(@Param('id') id: string, @Res() res: Response) {
    const project = await this.projectService.findOne(id);

    if (!project.image) {
      throw new NotFoundException(`Project ${id} has no image`);
    }

    // Convert URL path back to file system path if needed
    const filePath = project.image.startsWith('/')
      ? `.${project.image}`
      : project.image;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Image file not found for project ${id}`);
    }

    const filename = path.basename(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();

    // Set appropriate content type
    let contentType = 'application/octet-stream';
    if (['.jpg', '.jpeg'].includes(fileExtension)) {
      contentType = 'image/jpeg';
    } else if (fileExtension === '.png') {
      contentType = 'image/png';
    } else if (fileExtension === '.gif') {
      contentType = 'image/gif';
    } else if (fileExtension === '.webp') {
      contentType = 'image/webp';
    }

    // Set headers for file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  /**
   * Get any project image by filename
   * This endpoint serves project images directly from the uploads/images directory
   */
  @Get('images/:filename')
  getImageByFilename(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const imageUploadPath = './uploads/images';
    const filePath = path.join(imageUploadPath, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Image file not found: ${filename}`);
    }

    const fileExtension = path.extname(filePath).toLowerCase();

    // Set appropriate content type
    let contentType = 'application/octet-stream';
    if (['.jpg', '.jpeg'].includes(fileExtension)) {
      contentType = 'image/jpeg';
    } else if (fileExtension === '.png') {
      contentType = 'image/png';
    } else if (fileExtension === '.gif') {
      contentType = 'image/gif';
    } else if (fileExtension === '.webp') {
      contentType = 'image/webp';
    }

    // Set headers for file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
