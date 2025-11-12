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
import { Roles } from '../../common/decorators';
import { ROLES } from '../../shared/constants';

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
  async create(@Body() dto: CreateDevicesDto) {
    return this.devicesService.create(dto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: updateStatus) {
    return this.devicesService.updateStatus(id, dto);
  }

  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.devicesService.delete(id);
  }
}
