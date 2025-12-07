import { TransferService } from "./transfer.service";
import { TransferController } from "./transfer.controller";
import { Module } from "@nestjs/common";
import { ActivityModule } from "../activity/activity.module";

@Module({
	imports: [ActivityModule],
	controllers: [TransferController],
	providers: [TransferService],
	exports: [TransferService],
})
export class TransferModule {}