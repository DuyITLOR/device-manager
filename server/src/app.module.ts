import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import configuration from './config/configuration';
import { envValidationSchema } from './config/validation';

import { ActivityModule } from './modules/activity/activity.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/user.module';
import { DevicesModule } from './modules/devices/devices.module';
import { LoanModule } from './modules/loan/loan.module';
import { TransferModule } from './modules/transfer/transfer.module';
import { MqttModule } from './modules/MQTT/mqtt.module';
import { QrModule } from './modules/qr/qr.module';
import { LlmModule } from './modules/llm/llm.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/role.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    ActivityModule,
    AuthModule,
    UsersModule,
    DevicesModule,
    LoanModule,
    TransferModule,
    QrModule,
    HealthModule,
    MqttModule,
    LlmModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },

    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },

    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
