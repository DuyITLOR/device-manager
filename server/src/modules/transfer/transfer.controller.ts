import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { Role, ROLES } from '../../shared/constants';
import { GetTransferRequestsDto } from './dto/getTransferRequest.dto';
import { CreateTransferDto } from './dto/createTransfer.dto';
import { UpdateTransferDto } from './dto/updateTransfer.dto';

@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Get()
  async getTransferRequests(@Query() query: GetTransferRequestsDto) {
    return this.transferService.getTransferRequests(query);
  }

  @Roles(ROLES.MANAGER, ROLES.USER)
  @Post('create')
  async createTransfer(
    @Body() dto: CreateTransferDto,
    @CurrentUser() me: { id: string; role: Role },
  ) {
    return this.transferService.createTransfer(dto, me.id);
  }

  @Roles(ROLES.MANAGER, ROLES.USER)
  @Patch(':transferId/update')
  async updateTransfer(
    @Body() dto: UpdateTransferDto,
    @CurrentUser() me: { id: string; role: Role },
		@Param('transferId') transferId: string,
  ) {
    return this.transferService.updateTransfer(transferId, dto, me.id);
  }
}
