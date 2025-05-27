import { IsString, IsNotEmpty } from 'class-validator';

export class AttachCvDto {
  @IsString()
  @IsNotEmpty()
  cvPath: string;
}
