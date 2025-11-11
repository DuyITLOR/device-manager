import { IsEnum } from 'class-validator';
import { DeviceStatus } from '@prisma/client';
export class updateStatus {
  @IsEnum(DeviceStatus)
  status: DeviceStatus;
}
