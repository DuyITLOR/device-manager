import { Injectable, HttpException, Inject } from '@nestjs/common';
import {
  PrismaClient,
  Prisma,
  Loan,
  ActivityAction,
  ActivityTargetType,
} from '@prisma/client';
import { ActivityService } from '../activity/activity.service';
import {
  DEVICE_MESSAGES,
  LOAN_MESSAGES,
  USER_MESSAGES,
} from '../../shared/constants';
import { QueryLoanDto } from './dto/queryLoan.dto';
import { CreateLoanDto } from './dto/createLoan.dto';
import { UpdateManyLoansDto } from './dto/updateLoan.dto';
import { generateDiff } from '../../shared/utils';

type LoanWithRelations = Loan & {
  borrower?: { id: string; name: string; email: string; role: string };
  device?: { id: string; name: string; description: string; status: string };
};

function throwAppError(
  code: string,
  err: { message: string; status: number },
): never {
  throw new HttpException({ code, message: err.message }, err.status);
}

@Injectable()
export class LoanService {
  // constructor(private prisma: PrismaService) {}
  private prisma = new PrismaClient();
  constructor(private readonly activityService: ActivityService) {}

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

  async getLoans(query: QueryLoanDto, actorId: string) {
    const { search, status, limit = 20, page = 1 } = query;
    const where: Prisma.LoanWhereInput = {};

    where.borrowerId = actorId;
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
        orderBy: [{ status: 'asc' }, { borrowedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          borrower: true,
          device: true,
        },
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
      },
    });

    if (!loan) {
      return {
        success: false,
        message: LOAN_MESSAGES.NO_ACTIVE_LOAN.message,
        data: null,
      };
    } else {
      return {
        success: true,
        message: LOAN_MESSAGES.USER_BORROWING_DEVICE_FETCH_SUCCESS.message,
        data: this.sanitize(loan),
      };
    }
  }

  async createLoan(dto: CreateLoanDto, actorId: string) {
    const borrower = await this.prisma.user.findUnique({
      where: { id: actorId },
    });

    if (!borrower) {
      throwAppError('USER_NOT_FOUND', USER_MESSAGES.USER_NOT_FOUND);
    }

    const devices = await this.prisma.device.findMany({
      where: {
        id: { in: dto.deviceIds },
      },
    });

    if (devices.length !== dto.deviceIds.length) {
      throwAppError('DEVICE_NOT_FOUND', DEVICE_MESSAGES.DEVICE_NOT_FOUND);
    }

    for (const device of devices) {
      if (device.isDeleted) {
        throwAppError('DEVICE_IS_DELETED', DEVICE_MESSAGES.DEVICE_IS_DELETED);
      }
      if (device.status != 'AVAILABLE') {
        throwAppError(
          'DEVICE_ALREADY_ASSIGNED',
          DEVICE_MESSAGES.DEVICE_ALREADY_ASSIGNED,
        );
      }
    }

    const createdLoans = await this.prisma.$transaction(
      async (tx) => {
        const results: LoanWithRelations[] = [];

        for (const device of devices) {
          // create Loan record
          const loan = await tx.loan.create({
            data: {
              deviceId: device.id,
              borrowerId: actorId,
              borrowedAt: dto.borrowedAt,
              returnedAt: null,
              note: '',
              status: 'BORROWED',
            },
            include: {
              borrower: true,
              device: true,
            },
          });

          // update Device status
          const updatedDevice = await tx.device.update({
            where: { id: device.id },
            data: { status: 'BORROWED' },
          });

          // create Activity Log for loan creation
          await tx.activityLog.create({
            data: {
              actorId,
              action: ActivityAction.LOAN_CREATE,
              targetType: ActivityTargetType.Loan,
              targetId: loan.id,
              details: {
                type: 'FLOW',
                deviceName: device.name,
                borrowerName: borrower.name,
              },
            },
          });

          // create Activity Log for device status update
          await tx.activityLog.create({
            data: {
              actorId,
              action: ActivityAction.DEVICE_UPDATE,
              targetType: ActivityTargetType.Device,
              targetId: updatedDevice.id,
              details: {
                name: updatedDevice.name,
                status: updatedDevice.status,
              },
            },
          });

          results.push(loan);
        }
        return results;
      },
      {
        maxWait: 5000,
        timeout: 20000,
      },
    );

    return {
      status: LOAN_MESSAGES.LOAN_CREATE_SUCCESS.status,
      success: true,
      message: LOAN_MESSAGES.LOAN_CREATE_SUCCESS.message,
      data: createdLoans.map((loan) => this.sanitize(loan)),
    };
  }

  async updateLoan(dto: UpdateManyLoansDto, actorId: string) {
    const updatedLoans = await this.prisma.$transaction(
      async (tx) => {
        const results: LoanWithRelations[] = [];

        for (const record of dto.loanRecords) {
          const existingLoan = await tx.loan.findFirst({
            where: { deviceId: record.deviceId, status: 'BORROWED' },
            include: {
              borrower: true,
              device: true,
            },
          });

          if (!existingLoan) {
            throwAppError('LOAN_NOT_FOUND', LOAN_MESSAGES.LOAN_NOT_FOUND);
          }

          let actionType: ActivityAction = ActivityAction.LOAN_RETURN;
          let logDetails: any = {};
          let { deviceId, ...updatedData } = record;
          let loanUpdateData: Prisma.LoanUpdateInput = { ...updatedData };
          let deviceUpdateData: any = undefined;

          // Case 1: Return Operation
          if (dto.isReturn) {
            console.log('Return operation detected');
            loanUpdateData.returnedAt = new Date();
            loanUpdateData.status = 'RETURNED';

            deviceUpdateData = {
              status: 'AVAILABLE',
            };

            logDetails = {
              type: 'FLOW',
              deviceName: existingLoan.device.name,
              userName: existingLoan.borrower.name,
            };
          }
          // Case 2: Normal Update (update note of Loan) 
          else {
            console.log('Normal update operation detected');
            const diff = generateDiff(existingLoan, updatedData);
            if (!diff) {
              results.push(existingLoan);
              continue;
            }

            actionType = ActivityAction.LOAN_UPDATE;
            logDetails = {
              type: 'UPDATE',
              diff,
            };
          }

          // update the loan record
          const updated = await tx.loan.update({
            where: { id: existingLoan.id },
            data: loanUpdateData,
            include: {
              borrower: true,
              device: true,
            },
          });

          // device update, case 1: return operation
          if (deviceUpdateData) {
            await tx.device.update({
              where: { id: existingLoan.deviceId },
              data: deviceUpdateData,
            });
          }

          // log for loan update
          if (
            actionType === ActivityAction.LOAN_RETURN ||
            (logDetails.diff && Object.keys(logDetails.diff).length > 0)
          ) {
            await tx.activityLog.create({
              data: {
                actorId: actorId,
                action: actionType,
                targetType: ActivityTargetType.Loan,
                targetId: existingLoan.id,
                details: logDetails,
              },
            });
          }
          results.push(updated);
        }
        return results;
      },
      {
        maxWait: 5000,
        timeout: 40000,
      },
    );

    return {
      status: LOAN_MESSAGES.LOAN_UPDATE_SUCCESS.status,
      success: true,
      message: LOAN_MESSAGES.LOAN_UPDATE_SUCCESS.message,
      data: updatedLoans.map((loan) => this.sanitize(loan)),
    };
  }
}
