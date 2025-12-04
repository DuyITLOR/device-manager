import { LoanStatus } from "@prisma/client";
import { IsDate, IsNotEmpty, isNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateLoanDto {
	@IsString()
	@IsNotEmpty()
	deviceId: string;
	
	@IsDate()
	@IsNotEmpty()
	borrowedAt: Date;
}