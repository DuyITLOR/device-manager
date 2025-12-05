import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { LoanService } from "./loan.service";
import { QueryLoanDto } from "./dto/queryLoan.dto";
import { CurrentUser, Roles } from "../../common/decorators";
import { Role, ROLES } from "../../shared/constants";
import { CreateLoanDto } from "./dto/createLoan.dto";

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

	@Roles(ROLES.MANAGER, ROLES.USER)
	@Post('create')
	async createLoan(@Body() dto: CreateLoanDto, @CurrentUser() me: { id: string; role: Role}) {
		return this.loanService.createLoan(dto, me.id)
	}
}