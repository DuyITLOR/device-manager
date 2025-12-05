import { Module } from "@nestjs/common";
import { ActivityModule } from "../activity/activity.module";
import { LoanController } from "./loan.controller";
import { LoanService } from "./loan.service";

@Module({
	imports: [ActivityModule],
	controllers: [LoanController],
	providers: [LoanService],
	exports: [LoanService],
})
export class LoanModule {}