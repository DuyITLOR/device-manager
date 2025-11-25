import { Injectable, OnModuleInit } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { UsersService } from '../users/users.service';
import removeAccent from '../../shared/removeAccent';

@Injectable()
export class MqttService implements OnModuleInit {
  private client!: MqttClient;

  constructor(private readonly userService: UsersService) {}

  onModuleInit() {
    this.client = connect(
      'mqtts://7b1f4b73bed84278adf976988bc34ed9.s1.eu.hivemq.cloud:8883',
      {
        username: 'Robotics',
        password: 'Robotics123',
        rejectUnauthorized: false,
      },
    );

    this.client.on('connect', () => {
      console.log('[MQTT] connected to hive MQ');

      this.client.subscribe('rfid/esp32/code', (err: Error | null) => {
        if (err) console.error('Subscribe error:', err);
        else console.log('[MQTT] Subscribed to rfid/esp32/code');
      });
    });

    this.client.on('message', async (topic: string, payload: Buffer) => {
      if (topic == 'rfid/esp32/code') {
        const code = payload.toString();
        console.log('[MQTT] Recieve code: ', code);

        try {
          const name = await this.userService.getNameByCode(code);
          const newName = removeAccent(name);

          this.client.publish('rfid/server/name', newName);
          console.log('[MQTT] Sent name: ', newName);
        } catch (err) {
          this.client.publish('rfid/server/name', 'NOT_FOUND');
          console.error('[MQTT] User not found', err);
        }
      }
    });
  }
}
