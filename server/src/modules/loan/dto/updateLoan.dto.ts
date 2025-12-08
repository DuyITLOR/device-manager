import { LoanStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";

export class UpdateLoanDto {
	@IsString()
	loanId: string;

	@IsOptional()
	@IsString()
	borrowerId?: string;
	
	@IsOptional()
	@IsString()
	note?: string;

	@IsOptional()
	@IsEnum(LoanStatus)
	status?: LoanStatus;
}

export class UpdateManyLoansDto {
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => UpdateLoanDto)
	loanRecords: UpdateLoanDto[];
}