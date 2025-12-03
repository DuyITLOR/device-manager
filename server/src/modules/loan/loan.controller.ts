import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { LoanService } from "./loan.service";
import { QueryLoanDto } from "./dto/queryLoan.dto";
import { Roles } from "../../common/decorators";
import { Role, ROLES } from "../../shared/constants";

@Controller('loans')
export class LoanController {
	constructor(private readonly loanService: LoanService) {}

	@Get()
	async getLoans(@Query() query: QueryLoanDto) {
		return this.loanService.getLoans(query);
	}

	@Get('device/:deviceId/borrower')
	async getUserBorrowingDevice(@Param('deviceId') deviceId: string ) {
		return this.loanService.getUserBorrowingDevice(deviceId);
	}
}