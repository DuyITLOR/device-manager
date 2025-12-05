import { LoanStatus } from "@prisma/client";
import { IsDate, IsNotEmpty, isNotEmpty, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateLoanDto {
	@IsString()
	@IsNotEmpty()
	deviceId: string;
	
	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	borrowedAt: Date;
}