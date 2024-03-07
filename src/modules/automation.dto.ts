import { IsString, IsNotEmpty } from 'class-validator';

export class StartAutomationDto {
  @IsNotEmpty()
  @IsString()
    keyword: string;

  @IsNotEmpty()
  @IsString()
   location: string;
}