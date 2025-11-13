import { IsOptional, IsString, IsEnum } from 'class-validator';
import { DeviceStatus } from '@prisma/client';

export class UpdateDeviceQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;
}
