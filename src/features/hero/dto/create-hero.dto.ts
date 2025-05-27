import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHeroDto {
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
  cvPath?: string;
}
