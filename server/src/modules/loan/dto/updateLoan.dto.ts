import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

export class UpdateLoanDto {
	@IsNotEmpty()
	@IsString()
	deviceId: string;
	
	@IsOptional()
	@IsString()
	note?: string;
}

export class UpdateManyLoansDto {
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => UpdateLoanDto)
	loanRecords: UpdateLoanDto[];

	@IsNotEmpty()
	@IsBoolean()
	isReturn: boolean;
}