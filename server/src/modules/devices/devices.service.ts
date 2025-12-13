import { Injectable, HttpException } from '@nestjs/common';
import {
  PrismaClient,
  Device,
  Prisma,
  ActivityTargetType,
  ActivityAction,
} from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { CreateDevicesDto } from '../devices/dto/createDevices.dto';
import { DEVICE_MESSAGES } from '../../shared/constants';
import { updateStatus } from './dto/updateStatus.dto';
import { QueryDeviceDto } from './dto/queryDevices.dto';
import { UpdateDevices } from './dto/updateDevices.dto';
import { LoanService } from '../loan/loan.service';

function throwDeviceError(code: keyof typeof DEVICE_MESSAGES): never {
  const err = DEVICE_MESSAGES[code];
  throw new HttpException({ code, message: err.message }, err.status);
}

@Injectable()
export class DevicesService {
  private prisma = new PrismaClient();
  constructor(private readonly loanService: LoanService) {}
  private devicesFile = path.join(__dirname, '..', '..', 'data', 'devices.txt');
  private resolvedDevicesFile: string | null = null;

  private ensureDevicesFileExists() {
    try {
      const dir = path.dirname(this.devicesFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(this.devicesFile)) {
        fs.writeFileSync(this.devicesFile, '', { encoding: 'utf8' });
      }
    } catch (err) {
      console.error('ensureDevicesFileExists error', err);
    }
  }
  private upsertDeviceNameInTxtSync(newName: string) {
    try {
      if (!newName) return;
      this.ensureDevicesFileExists();
      const devicesFile = this.devicesFile;
      const content = fs.readFileSync(devicesFile, 'utf8');
      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      const normalized = newName.trim();
      if (!lines.includes(normalized)) {
        lines.push(normalized);
        fs.writeFileSync(devicesFile, lines.join('\n') + '\n', {
          encoding: 'utf8',
        });
        console.log(
          `[DevicesService] upserted device name "${normalized}" into ${devicesFile}`,
        );
      }
    } catch (err) {
      console.error('upsertDeviceNameInTxtSync error', err);
    }
  }

  private async removeDeviceNameIfNoMore(oldName: string) {
    try {
      if (!oldName) return;
      const name = oldName.trim();
      const count = await this.prisma.device.count({
        where: {
          name: name,
          isDeleted: false,
        },
      });

      if (count > 0) {
        console.log(
          `[DevicesService] keep name "${name}" in file (count=${count})`,
        );
        return;
      }

      this.ensureDevicesFileExists();
      const devicesFile = this.devicesFile;
      const content = fs.readFileSync(devicesFile, 'utf8');
      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const filtered = lines.filter((l) => l !== name);
      fs.writeFileSync(
        devicesFile,
        filtered.join('\n') + (filtered.length ? '\n' : ''),
        {
          encoding: 'utf8',
        },
      );
      console.log(
        `[DevicesService] removed device name "${name}" from ${devicesFile}`,
      );
    } catch (err) {
      console.error('removeDeviceNameIfNoMore error', err);
    }
  }

  private sanitize(device: Device) {
    const { id, name, description, status, createdAt } = device;
    return { id, name, description, status, createdAt };
  }

  async findById(id: string, options: { includeDeleted?: boolean } = {}) {
    const { includeDeleted = false } = options;

    const device = await this.prisma.device.findUnique({ where: { id } });

    if (!device) throwDeviceError('DEVICE_NOT_FOUND');

    if (!includeDeleted && device.isDeleted) {
      throwDeviceError('DEVICE_IS_DELETED');
    }

    return device;
  }

  async create(dto: CreateDevicesDto, actorId: string) {
    const device = await this.prisma.device.create({
      data: {
        name: dto.name,
        description: dto.description ?? '',
        status: dto.status,
      },
    });
    console.log('File path: ', this.devicesFile);
    this.upsertDeviceNameInTxtSync(device.name);

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
    const device = await this.findById(id);

    if (device.status === 'BORROWED') {
      const borrower = await this.prisma.loan.findFirst({
        where: {
          deviceId: device.id,
        },
        include: {
          borrower: true,
        },
      });
      return {
        status: DEVICE_MESSAGES.DEVICE_QUERY_SUCCESS.status,
        success: true,
        message: DEVICE_MESSAGES.DEVICE_QUERY_SUCCESS.message,
        data: {
          ...device,
          borrowerName: borrower?.borrower.name,
          borrowerId: borrower?.borrower.id,
        },
      };
    }

    return {
      status: DEVICE_MESSAGES.DEVICE_QUERY_SUCCESS.status,
      success: true,
      message: DEVICE_MESSAGES.DEVICE_QUERY_SUCCESS.message,
      data: device,
    };
  }

  async updateStatus(id: string, dto: updateStatus, actorId: string) {
    await this.findById(id);

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
    await this.findById(id);

    const device = await this.prisma.device.update({
      where: { id },
      data: { isDeleted: true },
    });
    await this.removeDeviceNameIfNoMore(device.name);

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
    const {
      status,
      name,
      startDate,
      endDate,
      limit = 20,
      page = 1,
      deleted = false,
    } = query;
    const where: Prisma.DeviceWhereInput = {};
    if (status) where.status = status;
    if (name) {
      where.name = { contains: name, mode: 'insensitive' as const };
    }
    if (!deleted) {
      where.isDeleted = false;
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

  async updateInfor(id: string, dto: UpdateDevices, actorId: string) {
    const oldDevice = await this.findById(id);

    const updated = await this.prisma.device.update({
      where: { id },
      data: {
        ...dto,
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

    if (dto.name && dto.name !== oldDevice.name) {
      this.upsertDeviceNameInTxtSync(dto.name);
      await this.removeDeviceNameIfNoMore(oldDevice.name);
    }

    return {
      status: DEVICE_MESSAGES.DEVICE_UPDATE_SUCCESS.status,
      success: true,
      message: DEVICE_MESSAGES.DEVICE_UPDATE_SUCCESS.message,
      data: updated,
    };
  }

  async getDeviceAvaiable(deviceId: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        id: deviceId,
        status: 'AVAILABLE',
        isDeleted: false,
      },
    });

    if (!device || device.status !== 'AVAILABLE') return null;

    return {
      id: device.id,
      name: device.name,
    };
  }

  async getDeviceBorrowed(deviceId: string, userId: string) {
    const loan = await this.loanService.getUserBorrowingDevice(deviceId);

    if (!loan) {
      console.log('Not found device borrowed');
      throwDeviceError('DEVICE_NOT_FOUND');
    }

    if (loan.data?.borrowerId === userId) {
      return {
        id: loan.data.deviceId,
        name: loan.data.device?.name,
      };
    } else return null;
  }
}
