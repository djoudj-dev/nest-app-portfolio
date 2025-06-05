import { IsString, IsNotEmpty } from 'class-validator';

export class AttachCvFileDto {
  @IsString()
  @IsNotEmpty()
  filePath: string;
}
