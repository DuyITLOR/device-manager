import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { UsersModule } from '../users/user.module';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [UsersModule, DevicesModule],
  providers: [MqttService],
})
export class MqttModule {}
