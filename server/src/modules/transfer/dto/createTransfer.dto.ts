import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
