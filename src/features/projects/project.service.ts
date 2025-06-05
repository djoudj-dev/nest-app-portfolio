import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { handleError } from '../../common/exceptions';
import * as fs from 'fs';

// Define types to match the Prisma schema
import { Prisma } from '@prisma/client';

type JsonValue = Prisma.JsonValue;

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
  repos: JsonValue;
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

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectWithCategory> {
    try {
      const project = await this.prisma.project.create({
        data: {
          title: createProjectDto.title,
          description: createProjectDto.description,
          image: createProjectDto.image,
          categoryId: createProjectDto.categoryId,
          deployUrl: createProjectDto.deployUrl,
          iconDeploy: createProjectDto.iconDeploy,
          technologies: createProjectDto.technologies,
          priority: createProjectDto.priority,
          repos: createProjectDto.repos as unknown as Prisma.InputJsonValue,
        },
        include: {
          category: true,
        },
      });

      return project as unknown as ProjectWithCategory;
    } catch (error: unknown) {
      return handleError('create Project', error);
    }
  }

  async findAll(): Promise<ProjectWithCategory[]> {
    try {
      return await this.prisma.project.findMany({
        include: {
          category: true,
        },
        orderBy: {
          priority: 'asc',
        },
      });
    } catch (error: unknown) {
      return handleError('find all Projects', error);
    }
  }

  async findOne(id: string): Promise<ProjectWithCategory> {
    let project: ProjectWithCategory | null = null;
    try {
      project = await this.prisma.project.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });
    } catch (error: unknown) {
      return handleError(`find Project ${id}`, error);
    }

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectWithCategory> {
    try {
      await this.findOne(id);

      const data: Record<string, unknown> = {};

      if (updateProjectDto.title) {
        data.title = updateProjectDto.title;
      }

      if (updateProjectDto.description) {
        data.description = updateProjectDto.description;
      }

      if (updateProjectDto.image) {
        data.image = updateProjectDto.image;
      }

      if (updateProjectDto.categoryId) {
        data.categoryId = updateProjectDto.categoryId;
      }

      if (updateProjectDto.deployUrl) {
        data.deployUrl = updateProjectDto.deployUrl;
      }

      if (updateProjectDto.iconDeploy) {
        data.iconDeploy = updateProjectDto.iconDeploy;
      }

      if (updateProjectDto.technologies) {
        data.technologies = updateProjectDto.technologies;
      }

      if (updateProjectDto.priority !== undefined) {
        data.priority = updateProjectDto.priority;
      }

      if (updateProjectDto.repos) {
        data.repos = updateProjectDto.repos;
      }

      return await this.prisma.project.update({
        where: { id },
        data,
        include: {
          category: true,
        },
      });
    } catch (error: unknown) {
      if (!(error instanceof NotFoundException)) {
        return handleError(`update Project ${id}`, error);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<ProjectWithCategory> {
    try {
      const project = await this.findOne(id);

      // Delete the image file if it exists
      if (project.image) {
        // Convert URL path back to file system path if needed
        const filePath = project.image.startsWith('/')
          ? `.${project.image}`
          : project.image;

        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (error) {
            console.error(`Failed to delete project image: ${filePath}`, error);
          }
        }
      }

      return await this.prisma.project.delete({
        where: { id },
        include: {
          category: true,
        },
      });
    } catch (error: unknown) {
      if (!(error instanceof NotFoundException)) {
        return handleError(`delete Project ${id}`, error);
      }
      throw error;
    }
  }

  async uploadImage(
    id: string,
    file: Express.Multer.File,
  ): Promise<ProjectWithCategory> {
    const project = await this.findOne(id);

    // Delete the old image if it exists
    if (project.image) {
      // Convert URL path back to file system path if needed
      const filePath = project.image.startsWith('/')
        ? `.${project.image}`
        : project.image;

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error(
            `Failed to delete old project image: ${filePath}`,
            error,
          );
        }
      }
    }

    // Convert the file path to a URL path by removing the leading './'
    const imagePath = file.path.replace(/^\.\//, '/');

    return this.prisma.project.update({
      where: { id },
      data: {
        image: imagePath,
      },
      include: {
        category: true,
      },
    });
  }

  // Project Category methods
  async findAllCategories(): Promise<ProjectCategory[]> {
    try {
      const categories = await this.prisma.projectCategory.findMany({
        include: {
          projects: {
            include: {
              category: true,
            },
          },
        },
      });

      return categories as unknown as ProjectCategory[];
    } catch (error: unknown) {
      return handleError('find all ProjectCategories', error);
    }
  }

  async findOneCategory(id: string): Promise<ProjectCategory> {
    let category: ProjectCategory | null = null;
    try {
      const result = await this.prisma.projectCategory.findUnique({
        where: { id },
        include: {
          projects: {
            include: {
              category: true,
            },
          },
        },
      });

      category = result as unknown as ProjectCategory;
    } catch (error: unknown) {
      return handleError(`find ProjectCategory ${id}`, error);
    }

    if (!category) {
      throw new NotFoundException(`ProjectCategory with ID ${id} not found`);
    }

    return category;
  }

  async createCategory(data: {
    label: string;
    icon: string;
  }): Promise<ProjectCategory> {
    try {
      return await this.prisma.projectCategory.create({
        data,
      });
    } catch (error: unknown) {
      return handleError('create ProjectCategory', error);
    }
  }

  async updateCategory(
    id: string,
    data: { label?: string; icon?: string },
  ): Promise<ProjectCategory> {
    try {
      await this.findOneCategory(id);

      return await this.prisma.projectCategory.update({
        where: { id },
        data,
      });
    } catch (error: unknown) {
      if (!(error instanceof NotFoundException)) {
        return handleError(`update ProjectCategory ${id}`, error);
      }
      throw error;
    }
  }

  async removeCategory(id: string): Promise<ProjectCategory> {
    try {
      await this.findOneCategory(id);

      return await this.prisma.projectCategory.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (!(error instanceof NotFoundException)) {
        return handleError(`delete ProjectCategory ${id}`, error);
      }
      throw error;
    }
  }
}
