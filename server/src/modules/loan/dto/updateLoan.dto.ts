import { LoanStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";


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