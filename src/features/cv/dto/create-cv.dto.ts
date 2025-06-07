import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCvDto {
  @IsString()
  @IsNotEmpty()
  filePath: string;
}
