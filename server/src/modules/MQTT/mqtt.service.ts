import { Injectable, OnModuleInit } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { UsersService } from '../users/users.service';
import removeAccent from '../../shared/removeAccent';

@Injectable()
export class MqttService implements OnModuleInit {
  private client!: MqttClient;

  constructor(private readonly userService: UsersService) {}

  onModuleInit() {
    this.client = connect(process.env.MQTT_HOST!, {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      rejectUnauthorized: false,
    });

    this.client.on('connect', () => {
      console.log('[MQTT] connected to hive MQ');

      this.client.subscribe(
        process.env.MQTT_RFID_TOPIC!,
        (err: Error | null) => {
          if (err) console.error('Subscribe error:', err);
          else console.log('[MQTT] Subscribed to rfid/esp32/code');
        },
      );
    });

    this.client.on('message', (topic: string, payload: Buffer) => {
      (async () => {
        if (topic == process.env.MQTT_RFID_TOPIC!) {
          const code = payload.toString();
          console.log('[MQTT] Recieve code: ', code);

          try {
            const name = await this.userService.getNameByCode(code);
            const newName = removeAccent(name);

            this.client.publish(process.env.MQTT_NAME_TOPIC!, newName);
            console.log('[MQTT] Sent name: ', newName);
          } catch (err) {
            this.client.publish(process.env.MQTT_NAME_TOPIC!, 'NOT_FOUND');
            console.error('[MQTT] User not found', err);
          }
        }
      })().catch((err) => {
        console.error('[MQTT] Error in message handler', err);
      });
    });
  }
}
