import { Injectable, OnModuleInit } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { UsersService } from '../users/users.service';
import removeAccent from '../../shared/removeAccent';
import { ConfigService } from '@nestjs/config';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class MqttService implements OnModuleInit {
  private client!: MqttClient;

  constructor(
    private readonly userService: UsersService,
    private readonly config: ConfigService,
    private readonly deviceService: DevicesService,
  ) {}

  onModuleInit() {
    const host = this.config.get<string>('mqtt.host');
    const username = this.config.get<string>('mqtt.username');
    const password = this.config.get<string>('mqtt.password');

    const rfidcode = this.config.get<string>('mqtt.topic.rfidcode');
    const nameRespone = this.config.get<string>('mqtt.topic.nameRespone');

    const deviceRequest = this.config.get<string>('mqtt.topic.deviceRequest');
    const deviceResponse = this.config.get<string>('mqtt.topic.deviceResponse');

    // const requestStatus = this.config.get<string>('mqtt.topic.requestStatus');
    // const responseStatus = this.config.get<string>('mqtt.topic.responseStatus');
    if (
      !host ||
      !rfidcode ||
      !nameRespone ||
      !deviceRequest ||
      !deviceResponse
    ) {
      throw new Error('[MQTT] Missing MQTT configuration!');
    }

    this.client = connect(host, {
      username: username,
      password: password,
      rejectUnauthorized: false,
    });

    this.client.on('connect', () => {
      console.log('[MQTT] connected to hive MQ');

      this.client.subscribe(rfidcode, (err: Error | null) => {
        if (err) console.error('Subscribe error:', err);
        else console.log('[MQTT] Subscribed to rfid/esp32/code');
      });

      this.client.subscribe(deviceRequest, (err: Error | null) => {
        if (err) console.error('Subscribe error:', err);
        else console.log('[MQTT] Subscribed to device/check');
      });
    });

    this.client.on('message', (topic: string, payload: Buffer) => {
      (async () => {
        if (topic == rfidcode) {
          const code = payload.toString().trim();
          console.log('[MQTT] Recieve code:', code);

          try {
            const name = await this.userService.getNameByCode(code);
            const newName = removeAccent(name);

            this.client.publish(nameRespone, newName);
            console.log('[MQTT] Sent name: ', newName);
          } catch (err) {
            this.client.publish(nameRespone || '', 'NOT_FOUND');
            console.error('[MQTT] User not found', err);
          }
        } else if (topic == deviceRequest) {
          const deviceId = payload.toString().trim();
          console.log('[MQTT] Recieve device check request:', deviceId);
          try {
            const device = await this.deviceService.getDeviceAvaiable(deviceId);
            console.log('[MQTT] Device found:', device);
            if (device) {
              device.name = removeAccent(device.name);
            }
            console.log('[MQTT] Sending device response:', device);
            this.client.publish(deviceResponse, JSON.stringify(device));
          } catch (err) {
            this.client.publish(deviceResponse, 'NOT_FOUND');
            console.error('[MQTT] Device not found', err);
          }
        }
      })().catch((err) => {
        console.error('[MQTT] Error in message handler', err);
      });
    });
  }
}
