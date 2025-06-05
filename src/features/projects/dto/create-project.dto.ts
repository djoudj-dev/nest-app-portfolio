import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProjectRepoDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  icon: string;
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  deployUrl?: string;

  @IsString()
  @IsNotEmpty()
  iconDeploy: string;

  @IsArray()
  @IsString({ each: true })
  technologies: string[];

  @IsInt()
  @Type(() => Number)
  priority: number;

  @IsArray()
  @IsObject({ each: true })
  @Type(() => ProjectRepoDto)
  repos: ProjectRepoDto[];
}
