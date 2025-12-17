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
  TransferStatus,
} from '@prisma/client';
import { ActivityService } from '../activity/activity.service';
import { CreateLogInput } from '../activity/interfaces';
import { LOAN_MESSAGES, TRANSFER_MESSAGES } from '../../shared/constants';
import { GetTransferRequestsDto } from './dto/getTransferRequest.dto';
import { CreateTransferDto } from './dto/createTransfer.dto';
import { UpdateTransferDto } from './dto/updateTransfer.dto';

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
  async getTransferRequests(query: GetTransferRequestsDto, actorId: string) {
    const { search } = query;
    const where: Prisma.TransferWhereInput = {};

    where.fromUserId = actorId;
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

    const [data] = await this.prisma.$transaction([
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
      }),
      this.prisma.transfer.count({ where }),
    ]);

    return {
      status: TRANSFER_MESSAGES.TRANSFER_REQUESTS_FETCH_SUCCESS.status,
      success: true,
      message: TRANSFER_MESSAGES.TRANSFER_REQUESTS_FETCH_SUCCESS.message,
      data: data.map((transfer) => this.sanitize(transfer)),
    };
  }

  async createTransfer(dto: CreateTransferDto, requesterId: string) {
    const { deviceId } = dto;
    const loan = await this.prisma.loan.findFirst({
      where: {
        deviceId,
        status: 'BORROWED',
      },
      include: {
        device: true,
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

    const existingRequest = await this.prisma.transfer.findFirst({
      where: {
        loanId: loan.id,
        toUserId: requesterId, // Use 'toUserId' because in your logic, Requester = toUser
        status: TransferStatus.PENDING, // Only check active requests
      },
    });
    if (existingRequest) {
      throwAppError(
        'TRANSFER_REQUEST_EXISTS',
        TRANSFER_MESSAGES.TRANSFER_REQUEST_EXISTS,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.create({
        data: {
          loanId: loan.id,
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

  async updateTransfer(
    transferId: string,
    dto: UpdateTransferDto,
    actorId: string,
  ) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
      include: {
        loan: { include: { device: true } },
        fromUser: true,
        toUser: true,
      },
    });

    if (!transfer) {
      throwAppError('TRANSFER_NOT_FOUND', TRANSFER_MESSAGES.TRANSFER_NOT_FOUND);
    }
    if (transfer.status !== TransferStatus.PENDING) {
      throwAppError(
        'TRANSFER_ALREADY_RESOLVED',
        TRANSFER_MESSAGES.TRANSFER_ALREADY_RESOLVED,
      );
    }

    // role (owner/requester) and permission check
    const isOwner = transfer.fromUserId === actorId;
    const isRequester = transfer.toUserId === actorId;
    if (!isOwner && !isRequester) {
      throwAppError(
        'TRANSFER_FORBIDDEN_ACTION',
        TRANSFER_MESSAGES.TRANSFER_FORBIDDEN_ACTION,
      );
    }
    // Only requester can cancel
    if (isRequester && dto.status !== TransferStatus.CANCELED) {
      throwAppError(
        'TRANSFER_FORBIDDEN_ACTION',
        TRANSFER_MESSAGES.TRANSFER_FORBIDDEN_ACTION,
      );
    }
    // Only owner can approve/reject
    if (isOwner && dto.status === TransferStatus.CANCELED) {
      throwAppError(
        'TRANSFER_FORBIDDEN_ACTION',
        TRANSFER_MESSAGES.TRANSFER_FORBIDDEN_ACTION,
      );
    }

    const result = await this.prisma.$transaction(
      async (tx) => {
        const updatedTransfer = await tx.transfer.update({
          where: { id: transferId },
          data: {
            status: dto.status,
          },
          include: {
            loan: { include: { device: true } },
            fromUser: true,
            toUser: true,
          },
        });

        let actionType: ActivityAction;
        let logDetails: any = {};

        if (dto.status === TransferStatus.APPROVED) {
          actionType = ActivityAction.TRANSFER_APPROVE;
          await tx.loan.update({
            where: { id: transfer.loanId },
            data: { borrowerId: transfer.toUserId },
          });
          logDetails = {
            type: 'FLOW',
            deviceName: transfer.loan.device.name,
            userName: transfer.fromUser.name,
          };
        } else if (dto.status === TransferStatus.REJECTED) {
          actionType = ActivityAction.TRANSFER_REJECT;
          logDetails = {
            type: 'FLOW',
            deviceName: transfer.loan.device.name,
            userName: transfer.fromUser.name,
          };
        } else {
          actionType = ActivityAction.TRANSFER_CANCEL;
          logDetails = {
            type: 'FLOW',
            deviceName: transfer.loan.device.name,
            userName: transfer.toUser.name,
          };
        }

        const logData: CreateLogInput = {
          actorId: actorId,
          action: actionType,
          targetType: ActivityTargetType.Transfer,
          targetId: transfer.id,
          details: logDetails,
        };

        await tx.activityLog.create({ data: logData as any });

        return updatedTransfer;
      },
      {
        timeout: 20000,
      },
    );

    return {
      status: TRANSFER_MESSAGES.TRANSFER_UPDATE_SUCCESS.status,
      success: true,
      message: TRANSFER_MESSAGES.TRANSFER_UPDATE_SUCCESS.message,
      data: this.sanitize(result),
    };
  }
}
