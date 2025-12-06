import { Transform, Type } from 'class-transformer';
import {
	IsString, IsNotEmpty,
	IsOptional,
	Min, IsInt,
	Max
} from 'class-validator';

export class GetTransferRequestsDto {
	@IsString()
	@IsNotEmpty()
	toUserId: string;

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

