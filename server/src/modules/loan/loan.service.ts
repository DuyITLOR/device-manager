import { Injectable, HttpException, Inject } from '@nestjs/common';
import {
  PrismaClient,
  Prisma,
  Loan,
  Device,
  ActivityAction,
  ActivityTargetType,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { QueryLoanDto } from './dto/queryLoan.dto';
import { LOAN_MESSAGES } from '../../shared/constants';
import { LoanModule } from './loan.module';

type LoanWithRelations = Loan & {
  borrower?: { id: string; name: string; email: string; role: string };
  device?: { id: string; name: string; description: string; status: string };
};

function throwLoanError(code: keyof typeof LOAN_MESSAGES): never {
  const err = LOAN_MESSAGES[code];
  throw new HttpException({ code, message: err.message }, err.status);
}

@Injectable()
export class LoanService {
  // constructor(private prisma: PrismaService) {}
  private prisma = new PrismaClient();

  private sanitize(loan: LoanWithRelations) {
    const {
      id,
      deviceId,
      borrowerId,
      status,
      borrowedAt,
      returnedAt,
      note,
      borrower,
      device,
    } = loan;

    return {
      id,
      deviceId,
      borrowerId,
      status,
      borrowedAt,
      returnedAt,
      note,
      borrower: borrower
        ? {
            id: borrower.id,
            name: borrower.name,
            email: borrower.email,
            role: borrower.role,
          }
        : null,
      device: device
        ? {
            id: device.id,
            name: device.name,
            description: device.description,
            status: device.status,
          }
        : null,
    };
  }

  async getLoans(query: QueryLoanDto) {
    const { borrowerId, search, status, limit = 20, page = 1 } = query;
    const where: Prisma.LoanWhereInput = {};

    where.borrowerId = borrowerId;
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        {
          device: { name: { contains: search, mode: 'insensitive' as const } },
        },
        { note: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.loan.findMany({
        where,
        orderBy: [
          { status: 'asc' },
          { borrowedAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          borrower: true,
          device: true,
        }
      }),
      this.prisma.loan.count({ where }),
    ]);

    return {
      status: LOAN_MESSAGES.LOAN_FETCH_SUCCESS.status,
      success: true,
      message: LOAN_MESSAGES.LOAN_FETCH_SUCCESS.message,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
      data: data.map((loan) => this.sanitize(loan)),
    };
  }

  async getUserBorrowingDevice(deviceId: string) {
    const where: Prisma.LoanWhereInput = {};
    where.deviceId = deviceId;
    where.status = 'BORROWED';

    const loan = await this.prisma.loan.findFirst({
      where,
      include: {
        borrower: true,
        device: true,
      }
    })

    if(!loan) {
      throwLoanError('NO_ACTIVE_LOAN')
    }

    return {
      status: LOAN_MESSAGES.USER_BORROWING_DEVICE_FETCH_SUCCESS.status,
      success: true,
      message: LOAN_MESSAGES.USER_BORROWING_DEVICE_FETCH_SUCCESS.message,
      data: this.sanitize(loan),
    }
  }
}
