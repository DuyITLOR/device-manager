import { Injectable, HttpException } from '@nestjs/common';
import {
  PrismaClient,
  Prisma,
  Transfer,
  Loan,
  Device,
  User,
  ActivityAction,
  ActivityTargetType,
} from '@prisma/client';
import { ActivityService } from '../activity/activity.service';
import { CreateLogInput } from '../activity/interfaces';
import {
  DEVICE_MESSAGES,
  LOAN_MESSAGES,
  TRANSFER_MESSAGES,
} from '../../shared/constants';
import { GetTransferRequestsDto } from './dto/getTransferRequest.dto';
import { CreateTransferDto } from './dto/createTransfer.dto';

type TransferWithRelations = Transfer & {
  loan: (Loan & { device: Device | null }) | null;
  fromUser: User | null;
  toUser: User | null;
};

function throwAppError(
  code: string,
  err: { message: string; status: number },
): never {
  throw new HttpException({ code, message: err.message }, err.status);
}

@Injectable()
export class TransferService {
  private prisma = new PrismaClient();
  constructor(private readonly activityService: ActivityService) {}

  private sanitize(transfer: TransferWithRelations) {
    const { id, loanId, status, requestedAt, loan, fromUser, toUser } =
      transfer;
    return {
      id,
      status,
      requestedAt,
      loanId,
      device: loan?.device
        ? {
            id: loan.device.id,
            name: loan.device.name,
          }
        : null,
      userHasDevice: fromUser
        ? {
            id: fromUser.id,
            name: fromUser.name,
            email: fromUser.email,
          }
        : null,
      userRequestDevice: toUser
        ? {
            id: toUser.id,
            name: toUser.name,
            email: toUser.email,
          }
        : null,
    };
  }

  // transfer requests from A to B, so A (fromUserId) needs to approve the requests.
  async getTransferRequests(query: GetTransferRequestsDto) {
    const { fromUserId, search, limit = 20, page = 1 } = query;
    const where: Prisma.TransferWhereInput = {};

    where.fromUserId = fromUserId;
    if (search) {
      where.OR = [
        {
          toUser: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          loan: {
            device: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }
    where.status = 'PENDING';

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transfer.findMany({
        where,
        orderBy: [{ requestedAt: 'desc' }],
        include: {
          loan: {
            include: { device: true },
          },
          fromUser: true,
          toUser: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transfer.count({ where }),
    ]);

    return {
      status: TRANSFER_MESSAGES.TRANSFER_REQUESTS_FETCH_SUCCESS.status,
      success: true,
      message: TRANSFER_MESSAGES.TRANSFER_REQUESTS_FETCH_SUCCESS.message,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
      data: data.map((transfer) => this.sanitize(transfer)),
    };
  }

  async createTransfer(dto: CreateTransferDto, requesterId: string) {
    const { loanId } = dto;
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        device: true,
        borrower: true,
      },
    });

    if (!loan) {
      throwAppError('LOAN_NOT_FOUND', LOAN_MESSAGES.LOAN_NOT_FOUND);
    }
    if (loan.borrowerId === requesterId) {
      throwAppError(
        'TRANSFER_SELF_TO_SELF',
        TRANSFER_MESSAGES.TRANSFER_SELF_TO_SELF,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.create({
        data: {
          loanId,
          fromUserId: loan.borrowerId,
          toUserId: requesterId,
          requestedAt: new Date(),
          status: 'PENDING',
        },
        include: {
          loan: { include: { device: true } },
          fromUser: true,
          toUser: true,
        },
      });

      const logData: CreateLogInput = {
        actorId: requesterId, // toUserId in the record
        action: ActivityAction.TRANSFER_REQUEST,
        targetType: ActivityTargetType.Transfer,
        targetId: transfer.id,
        details: {
          type: 'FLOW',
          deviceName: loan.device.name,
          userName: transfer.toUser?.name || 'Unknown',
        },
      };

      await tx.activityLog.create({ data: logData as any });

      return transfer;
    });

    return {
      status: TRANSFER_MESSAGES.TRANSFER_CREATE_SUCCESS.status,
      success: true,
      message: TRANSFER_MESSAGES.TRANSFER_CREATE_SUCCESS.message,
      data: this.sanitize(result),
    };
  }
}
