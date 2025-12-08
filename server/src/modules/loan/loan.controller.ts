import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { QueryLoanDto } from './dto/queryLoan.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { Role, ROLES } from '../../shared/constants';
import { CreateLoanDto } from './dto/createLoan.dto';
import { UpdateManyLoansDto } from './dto/updateLoan.dto';

@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get()
  async getLoans(
    @Query() query: QueryLoanDto,
    @CurrentUser() me: { id: string; role: Role },
  ) {
    return this.loanService.getLoans(query, me.id);
  }

  @Get('device/:deviceId/borrower')
  async getUserBorrowingDevice(@Param('deviceId') deviceId: string) {
    return this.loanService.getUserBorrowingDevice(deviceId);
  }

  @Roles(ROLES.MANAGER, ROLES.USER)
  @Post('create')
  async createLoan(
    @Body() dto: CreateLoanDto,
    @CurrentUser() me: { id: string; role: Role },
  ) {
    return this.loanService.createLoan(dto, me.id);
  }

  @Roles(ROLES.MANAGER, ROLES.USER)
  @Patch('update')
  async updateLoan(
    @Body() dto: UpdateManyLoansDto,
    @CurrentUser() me: { id: string; role: Role },
  ) {
    return this.loanService.updateLoan(dto, me.id);
  }
}
