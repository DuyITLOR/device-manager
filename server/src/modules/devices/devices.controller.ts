import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDevicesDto } from './dto/createDevices.dto';
import { updateStatus } from './dto/updateStatus.dto';
import { QueryDeviceDto } from './dto/queryDevices.dto';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role, ROLES } from '../../shared/constants';
import { UpdateDevices } from './dto/updateDevices.dto';
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  async findAll(@Query() query: QueryDeviceDto) {
    return this.devicesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  @Post()
  async create(
    @Body() dto: CreateDevicesDto,
    @CurrentUser() me: { id: string; role: Role },
  ) {
    return this.devicesService.create(dto, me.id);
  }

  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: updateStatus,
    @CurrentUser() me: { id: string; role: Role },
  ) {
    return this.devicesService.updateStatus(id, dto, me.id);
  }

  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  @Patch(':id')
  async updateInfor(
    @Param('id') id: string,
    @Body() query: UpdateDevices,
    @CurrentUser() me: { id: string; role: Role },
  ) {
    return this.devicesService.updateInfor(id, query, me.id);
  }

  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() me: { id: string; role: Role },
  ) {
    return this.devicesService.delete(id, me.id);
  }
}
