import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DevicesService } from '../devices/devices.service';
import removeAccent from '../../shared/removeAccent';

@Injectable()
export class MqtHandler {
  constructor(
    private readonly userService: UsersService,
    private readonly deviceService: DevicesService,
  ) {}

  async handleRFID(code: string) {
    try {
      const name = await this.userService.getNameByCode(code);
      return removeAccent(name);
    } catch {
      return 'NOT_FOUND';
    }
  }
}
