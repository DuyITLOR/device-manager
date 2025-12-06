import { Controller, Get, Post, Patch, Param, Body, Query } from "@nestjs/common";
import { TransferService } from "./transfer.service";
import { GetTransferRequestsDto } from "./dto/getTransferRequest.dto";

@Controller('transfer')
export class TransferController {
	constructor(private readonly transferService: TransferService) {}

	@Get()
	async getTransferRequests(@Query() query: GetTransferRequestsDto) {
		return this.transferService.getTransferRequests(query);
	}
}
