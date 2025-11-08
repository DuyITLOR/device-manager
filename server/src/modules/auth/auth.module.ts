import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/user.module';

@Module({
  imports: [
    ConfigModule,                            
    JwtModule.register({
        secret: process.env.JWT_SECRET ?? 'change-me-secret',
        signOptions: {
          expiresIn: Number(process.env.JWT_EXPIRES_IN ?? 3600), // ép về number
        },
      }),
      UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
