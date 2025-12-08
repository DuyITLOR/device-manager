import { Injectable, OnModuleInit } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { UsersService } from '../users/users.service';
import removeAccent from '../../shared/removeAccent';
import { ConfigService } from '@nestjs/config';
import { DevicesService } from '../devices/devices.service';
import { LoanService } from '../loan/loan.service';

@Injectable()
export class MqttService implements OnModuleInit {
  private client!: MqttClient;

  constructor(
    private readonly userService: UsersService,
    private readonly config: ConfigService,
    private readonly deviceService: DevicesService,
    private readonly loanService: LoanService,
  ) {}

  onModuleInit() {
    const host = this.config.get<string>('mqtt.host');
    const username = this.config.get<string>('mqtt.username');
    const password = this.config.get<string>('mqtt.password');

    const rfidcode = this.config.get<string>('mqtt.topic.rfidcode');
    const nameRespone = this.config.get<string>('mqtt.topic.nameRespone');

    const deviceCheckLoan = this.config.get<string>(
      'mqtt.topic.deviceCheckLoan',
    );
    const deviceCheckReturn = this.config.get<string>(
      'mqtt.topic.deviceCheckReturn',
    );
    const deviceCheckResponse = this.config.get<string>(
      'mqtt.topic.deviceResponse',
    );

    const deviceSubmitLoan = this.config.get<string>(
      'mqtt.topic.deviceSubmitLoan',
    );
    const deviceSubmitReturn = this.config.get<string>(
      'mqtt.topic.deviceSubmitReturn',
    );
    const deviceSubmitResponse = this.config.get<string>(
      'mqtt.topic.deviceSubmitResponse',
    );

    if (
      !host ||
      !rfidcode ||
      !nameRespone ||
      !deviceCheckLoan ||
      !deviceCheckReturn ||
      !deviceCheckResponse ||
      !deviceSubmitLoan ||
      !deviceSubmitReturn ||
      !deviceSubmitResponse
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

      this.client.subscribe(deviceCheckLoan, (err: Error | null) => {
        if (err) console.error('Subscribe error:', err);
        else console.log('[MQTT] Subscribed to device/checkloan');
      });

      this.client.subscribe(deviceCheckReturn, (err: Error | null) => {
        if (err) console.error('Subscribe error:', err);
        else console.log('[MQTT] Subscribed to device/checkreturn');
      });

      this.client.subscribe(deviceSubmitLoan, (err: Error | null) => {
        if (err) console.error('Subscribe error:', err);
        else console.log('[MQTT] Subscribed to device/loan');
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
        } else if (topic == deviceCheckLoan) {
          const deviceId = payload.toString().trim();
          console.log('[MQTT] Recieve device check request:', deviceId);
          try {
            const device = await this.deviceService.getDeviceAvaiable(deviceId);
            console.log('[MQTT] Device found:', device);
            if (device) {
              device.name = removeAccent(device.name);
            }
            console.log('[MQTT] Sending device response:', device);
            this.client.publish(deviceCheckResponse, JSON.stringify(device));
          } catch (err) {
            this.client.publish(deviceCheckResponse, 'NOT_FOUND');
            console.error('[MQTT] Device not found', err);
          }
        } else if (topic == deviceSubmitLoan) {
          const data = JSON.parse(payload.toString().trim());
          console.log('[MQTT] Recieve device loan request:', data);
          const userId = await this.userService.getUserIdByCode(data.code);
          if (!userId) {
            console.error('[MQTT] User not found for code:', data.code);
            this.client.publish(deviceSubmitResponse, 'USER_NOT_FOUND');
            return;
          }
          const devices = await this.loanService.createLoan(
            {
              deviceIds: data.devices,
              borrowedAt: new Date(),
            },
            userId,
          );

          if (devices.success) {
            console.log('[MQTT] Devices loaned:', devices);
            this.client.publish(deviceSubmitResponse, 'LOAN_SUCCESS');
          } else {
            console.error('[MQTT] Device loan failed:', devices.message);
            this.client.publish(deviceSubmitResponse, 'LOAN_FAILED');
          }
        }
      })().catch((err) => {
        console.error('[MQTT] Error in message handler', err);
      });
    });
  }
}
