import { TransferStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty} from 'class-validator';

export class UpdateTransferDto {
  @IsEnum(TransferStatus)
  @IsNotEmpty()
  status: TransferStatus;
}
