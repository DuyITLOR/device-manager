import { Injectable, HttpException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/extension';
import { CreateDevicesDto } from '../devices/dto/createDevices.dto';
import { DeviceStatus } from '@prisma/client';
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

  async create(dto: CreateDevicesDto) {
    const exists = await this.prisma.device.findUnique({
      where: {
        id: dto.id,
      },
    });
    if (exists) throwDeviceError('DEVICE_DUPLICATE_ID');

    const device = await this.prisma.device.create({
      data: {
        id: dto.id,
        name: dto.name,
        description: dto.description ?? '',
        status: dto.status,
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
    const device = this.prisma.device.findUnique({
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

  async updateStatus(id: string, dto: updateStatus) {
    const existing = await this.prisma.device.findUnique({ where: { id } });
    if (!existing) throwDeviceError('DEVICE_NOT_FOUND');

    const updated = await this.prisma.device.update({
      where: { id },
      data: { status: dto.status },
    });

    return {
      status: DEVICE_MESSAGES.DEVICE_UPDATE_SUCCESS.status,
      success: true,
      message: DEVICE_MESSAGES.DEVICE_UPDATE_SUCCESS.message,
      data: updated,
    };
  }

  async delete(id: string) {
    const existing = await this.prisma.device.findUnique({ where: { id } });
    if (!existing) throwDeviceError('DEVICE_NOT_FOUND');

    await this.prisma.device.delete({ where: { id } });

    return {
      status: DEVICE_MESSAGES.DEVICE_DELETE_SUCCESS.status,
      success: true,
      message: DEVICE_MESSAGES.DEVICE_DELETE_SUCCESS.message,
    };
  }

  async findAll(query: QueryDeviceDto) {
    const { status, search, startDate, endDate, limit = 20, page = 1 } = query;
    const where: any = {};
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
      meta: { total, page, limit },
      data,
    };
  }
}
