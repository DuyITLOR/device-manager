import { Transform, Type } from 'class-transformer';
import {
	IsString,
	IsOptional,
	Min, IsInt,
	Max
} from 'class-validator';

export class GetTransferRequestsDto {
	@IsOptional()
	@Transform(({value} : {value: unknown}) => 
		typeof value === 'string' ? decodeURIComponent(value) : undefined,
	)
	@IsString()
	search?: string;

	@IsOptional()
	@Type(() => Number)	
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 1;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;
}

