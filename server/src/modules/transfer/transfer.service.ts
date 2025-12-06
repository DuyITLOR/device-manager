import { Injectable, HttpException } from '@nestjs/common';
import {
  PrismaClient,
  Prisma,
  Transfer,
  Loan,
  Device,
  User,
} from '@prisma/client';
import { ActivityService } from '../activity/activity.service';
import { CreateLogInput } from '../activity/interfaces';
import { LOAN_MESSAGES, TRANSFER_MESSAGES } from '../../shared/constants';
import { GetTransferRequestsDto } from './dto/getTransferRequest.dto';

type TransferWithRelations = Transfer & {
  loan: Loan & { device: Device | null } | null;
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
    const { id, loanId, status, requestedAt, loan, fromUser, toUser } = transfer;
    return {
      id,
      status,
      requestedAt,
      loanId,
      device: loan?.device ? {
        id: loan.device.id,
        name: loan.device.name
      } : null,
      sender: fromUser
        ? {
            id: fromUser.id,
            name: fromUser.name,
            email: fromUser.email,
          }
        : null,
      receiver: toUser
        ? {
            id: toUser.id,
            name: toUser.name,
            email: toUser.email,
          }
        : null,
    };
  }

  async getTransferRequests(query: GetTransferRequestsDto) {
    const { toUserId, search, limit = 20, page = 1 } = query;
    const where: Prisma.TransferWhereInput = {};

    where.toUserId = toUserId;
    if (search) {
      where.OR = [
        {
          fromUser: {
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
      status: TRANSFER_MESSAGES.TRANFER_REQUESTS_FETCH_SUCCESS.status,
      success: true,
      message: TRANSFER_MESSAGES.TRANFER_REQUESTS_FETCH_SUCCESS.message,
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
}
