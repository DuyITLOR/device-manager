import { Module } from "@nestjs/common";
import { LoanController } from "./loan.controller";
import { LoanService } from "./loan.service";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

@Module({
	controllers: [LoanController],
	providers: [LoanService],
	exports: [LoanService],
})
export class LoanModule {}