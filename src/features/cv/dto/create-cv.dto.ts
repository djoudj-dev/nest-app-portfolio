import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCvDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  jobTitle: string;

  @IsNotEmpty()
  @IsString()
  jobDescription: string;

  @IsOptional()
  @IsString()
  filePath?: string;
}
