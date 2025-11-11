import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  // ActivityAction,
  ActivityTargetType,
  Prisma,
} from '@prisma/client';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';

@Injectable()
export class ActivityService {
  private prisma = new PrismaClient();

  async create(dto: CreateActivityLogDto) {
    const activityLog = await this.prisma.activityLog.create({
      data: {
        actorId: dto.actorId,
        action: dto.action,
        targetType: dto.targetType,
        targetId: dto.targetId,
        details: dto.details || {},
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
    });

    return {
      success: true,
      message: 'Activity log created successfully',
      data: activityLog,
    };
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
      message: 'Activity logs retrieved successfully',
      data: {
        items: activityLogs,
        total,
        limit,
        page,
        totalPages,
        hasMore: page < totalPages,
      },
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
        message: 'Activity log not found',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Activity log retrieved successfully',
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
      message: 'Activity logs retrieved successfully',
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
      message: 'Activity logs retrieved successfully',
      data: activityLogs,
    };
  }
}
