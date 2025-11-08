import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import type { Role } from '../../../shared/constants';

export class SignupDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() role?: Role; // 'ADMIN' | 'MANAGER' | 'USER'
}
