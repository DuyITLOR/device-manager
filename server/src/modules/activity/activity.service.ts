import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, ActivityTargetType, Prisma } from '@prisma/client';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';
import { ACTIVITY_LOG_MESSAGES } from '../../shared/constants';
import { CreateLogInput } from './interfaces/logger.interface';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);
  private prisma = new PrismaClient();

  async create(data: CreateLogInput) {
    await this.prisma.activityLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        details: data.details as any,
        timestamp: new Date(),
      },
    });
  }

  async findAll(query: QueryActivityLogDto) {
    const {
      actorId,
      action,
      targetType,
      targetId,
      limit = 20,
      page = 1,
      startDate,
      endDate,
    } = query;

    const where: Prisma.ActivityLogFindManyArgs['where'] = {};

    if (actorId) {
      where.actorId = actorId;
    }

    if (action) {
      where.action = action;
    }

    if (targetType) {
      where.targetType = targetType;
    }

    if (targetId) {
      where.targetId = targetId;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    const offset = (page - 1) * limit;

    const [activityLogs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: ACTIVITY_LOG_MESSAGES.ACTIVITY_LOG_FETCH_SUCCESS.message,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
      data: activityLogs,
    };
  }

  /**
   * Lấy activity log theo ID
   */
  async findOne(id: string) {
    const activityLog = await this.prisma.activityLog.findUnique({
      where: { id },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!activityLog) {
      return {
        success: false,
        message: 'Không tìm thấy hoạt động',
        data: null,
      };
    }

    return {
      success: true,
      message: ACTIVITY_LOG_MESSAGES.ACTIVITY_LOG_FETCH_SUCCESS.message,
      data: activityLog,
    };
  }

  /**
   * Lấy activity logs theo target (targetType + targetId)
   */
  async findByTarget(
    targetType: ActivityTargetType,
    targetId: string,
    limit = 20,
  ) {
    const activityLogs = await this.prisma.activityLog.findMany({
      where: {
        targetType,
        targetId,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    return {
      success: true,
      message: ACTIVITY_LOG_MESSAGES.ACTIVITY_LOG_FETCH_SUCCESS.message,
      data: activityLogs,
    };
  }

  /**
   * Lấy activity logs theo actor
   */
  async findByActor(actorId: string, limit = 20) {
    const activityLogs = await this.prisma.activityLog.findMany({
      where: {
        actorId,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    return {
      success: true,
      message: ACTIVITY_LOG_MESSAGES.ACTIVITY_LOG_FETCH_SUCCESS.message,
      data: activityLogs,
    };
  }
}
