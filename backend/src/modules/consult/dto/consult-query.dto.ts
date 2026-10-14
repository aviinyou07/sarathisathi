import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ConsultQueryDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
