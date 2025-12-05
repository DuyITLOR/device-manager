import { LoanStatus } from '@prisma/client';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  isNotEmpty,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLoanDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  deviceIds: string[];

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  borrowedAt: Date;
}
