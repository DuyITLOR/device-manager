import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { UsersModule } from '../users/user.module';

@Module({
  imports: [UsersModule],
  providers: [MqttService],
})
export class MqttModule {}
