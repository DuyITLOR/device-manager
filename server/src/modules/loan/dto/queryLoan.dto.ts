import {
  IsDataURI,
  IsNotEmpty,
  IsString,
  IsDate,
  isString,
	IsOptional,
	IsInt,
	Min,
	Max,
	IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { LoanStatus } from '@prisma/client';

export class QueryLoanDto {
  @IsString()
  @IsNotEmpty()
  borrowerId: string;

	@IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? decodeURIComponent(value) : undefined,
  )
  @IsString()
  search?: string;
	
	@IsOptional()
	@IsEnum(LoanStatus)
	status?: LoanStatus;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 20;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;
}
