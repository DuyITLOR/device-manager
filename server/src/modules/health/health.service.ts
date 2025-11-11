import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ResponseUtil } from '../../shared/utils';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkDb() {
    try {
      await this.prisma.user.findFirst({ select: { id: true } });
      return ResponseUtil.success(true, 'Database connection is healthy');
    } catch {
      return ResponseUtil.error('Database connection is unhealthy');
    }
  }
}
