import { Injectable, HttpException } from '@nestjs/common';
import {
  PrismaClient,
  Device,
  Prisma,
  ActivityTargetType,
  ActivityAction,
} from '@prisma/client';
import { CreateDevicesDto } from '../devices/dto/createDevices.dto';
import { UpdateDeviceQueryDto } from './dto/updateDeviceQuery.dto';
import { DEVICE_MESSAGES } from '../../shared/constants';
import { updateStatus } from './dto/updateStatus.dto';
import { QueryDeviceDto } from './dto/queryDevices.dto';

function throwDeviceError(code: keyof typeof DEVICE_MESSAGES): never {
  const err = DEVICE_MESSAGES[code];
  throw new HttpException({ code, message: err.message }, err.status);
}

@Injectable()
export class DevicesService {
  private prisma = new PrismaClient();

  private sanitize(device: Device) {
    const { id, name, description, status, createdAt } = device;
    return { id, name, description, status, createdAt };
  }

  async create(dto: CreateDevicesDto, actorId: string) {
    const device = await this.prisma.device.create({
      data: {
        name: dto.name,
        description: dto.description ?? '',
        status: dto.status,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        actorId,
        action: ActivityAction.DEVICE_CREATE,
        targetType: ActivityTargetType.Device,
        targetId: device.id,
        details: {
          name: device.name,
          status: device.status,
        },
      },
    });

    return {
      status: DEVICE_MESSAGES.DEVICE_CREATE_SUCCESS.status,
      success: true,
      message: DEVICE_MESSAGES.DEVICE_CREATE_SUCCESS.message,
      data: device,
    };
  }

  async findOne(id: string) {
    const device = await this.prisma.device.findUnique({
      where: {
        id,
      },
    });

    if (!device) {
      throwDeviceError('DEVICE_NOT_FOUND');
    }

    return {
      status: DEVICE_MESSAGES.DEVICE_QUERY_SUCCESS.status,
      success: true,
      message: DEVICE_MESSAGES.DEVICE_QUERY_SUCCESS.message,
      data: device,
    };
  }

  async updateStatus(id: string, dto: updateStatus, actorId: string) {
    const existing = await this.prisma.device.findUnique({ where: { id } });
    if (!existing) throwDeviceError('DEVICE_NOT_FOUND');

    const updated = await this.prisma.device.update({
      where: { id },
      data: { status: dto.status },
    });

    await this.prisma.activityLog.create({
      data: {
        actorId,
        action: ActivityAction.DEVICE_UPDATE,
        targetType: ActivityTargetType.Device,
        targetId: id,
        details: {
          name: updated.name,
          status: updated.status,
        },
      },
    });

    return {
      status: DEVICE_MESSAGES.DEVICE_UPDATE_SUCCESS.status,
      success: true,
      message: DEVICE_MESSAGES.DEVICE_UPDATE_SUCCESS.message,
      data: updated,
    };
  }

  async delete(id: string, actorId: string) {
    const existing = await this.prisma.device.findUnique({ where: { id } });
    if (!existing) throwDeviceError('DEVICE_NOT_FOUND');

    await this.prisma.device.delete({ where: { id } });

    await this.prisma.activityLog.create({
      data: {
        actorId,
        action: ActivityAction.DEVICE_DELETE,
        targetType: ActivityTargetType.Device,
        targetId: id,
      },
    });

    return {
      status: DEVICE_MESSAGES.DEVICE_DELETE_SUCCESS.status,
      success: true,
      message: DEVICE_MESSAGES.DEVICE_DELETE_SUCCESS.message,
    };
  }

  async findAll(query: QueryDeviceDto) {
    const { status, search, startDate, endDate, limit = 20, page = 1 } = query;
    const where: Prisma.DeviceWhereInput = {};
    if (status) where.status = status;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' as const };
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.device.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.device.count({ where }),
    ]);

    return {
      status: DEVICE_MESSAGES.DEVICE_QUERY_SUCCESS.status,
      success: true,
      message: DEVICE_MESSAGES.DEVICE_QUERY_SUCCESS.message,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
      data,
    };
  }

  async updateInfor(id: string, query: UpdateDeviceQueryDto, actorId: string) {
    const existed = await this.prisma.device.findUnique({ where: { id } });
    if (!existed) throwDeviceError('DEVICE_NOT_FOUND');

    const updated = await this.prisma.device.update({
      where: { id },
      data: {
        name: query.name ?? existed.name,
        description: query.description ?? existed.description,
        status: query.status ?? existed.status,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        actorId,
        action: ActivityAction.DEVICE_UPDATE,
        targetType: ActivityTargetType.Device,
        targetId: id,
      },
    });

    return {
      status: DEVICE_MESSAGES.DEVICE_UPDATE_SUCCESS.status,
      success: true,
      message: DEVICE_MESSAGES.DEVICE_UPDATE_SUCCESS.message,
      data: updated,
    };
  }
}
