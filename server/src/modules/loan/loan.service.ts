import { Injectable, HttpException, Inject } from '@nestjs/common';
import {
  PrismaClient,
  Prisma,
  Loan,
  Device,
  ActivityAction,
  ActivityTargetType,
} from '@prisma/client';
import { ActivityService } from '../activity/activity.service'; 
import { CreateLogInput } from '../activity/interfaces';
import { DEVICE_MESSAGES, LOAN_MESSAGES } from '../../shared/constants';
import { LoanModule } from './loan.module';
import { QueryLoanDto } from './dto/queryLoan.dto';
import { CreateLoanDto } from './dto/createLoan.dto';

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
  constructor (private readonly activityService: ActivityService) {};

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

  async createLoan(dto: CreateLoanDto, actorId: string) {
    const device = await this.prisma.device.findUnique({
      where: { id: dto.deviceId },
    })
    const borrower = await this.prisma.user.findUnique({
      where: { id: actorId },
    })
    
    if(!device || device.isDeleted) {
      
    }
    if(!borrower || borrower.isDeleted) {

    }

    const loan = await this.prisma.loan.create({
      data: {
        deviceId: dto.deviceId,
        borrowerId: actorId,
        borrowedAt: dto.borrowedAt,
        returnedAt: null,
        note: '',
        status: 'BORROWED',
      },
    })
    
    await this.prisma.activityLog.create({
      data: {
        actorId,
        action: ActivityAction.LOAN_CREATE,
        targetType: ActivityTargetType.Loan,
        targetId: loan.id,
        details: {
          type: 'FLOW',
          deviceName: device?.name,
          borrowerName: borrower?.name,
        }
      }
    })

    return {
      status: LOAN_MESSAGES.LOAN_CREATE_SUCCESS.status,
      success: true,
      message: LOAN_MESSAGES.LOAN_CREATE_SUCCESS.message,
      data: device,
    }
  }
}
