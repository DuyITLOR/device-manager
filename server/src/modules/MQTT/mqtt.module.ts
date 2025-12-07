import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { UsersModule } from '../users/user.module';
import { DevicesModule } from '../devices/devices.module';
import { LoanModule } from '../loan/loan.module';

@Module({
  imports: [UsersModule, DevicesModule, LoanModule],
  providers: [MqttService],
})
export class MqttModule {}
