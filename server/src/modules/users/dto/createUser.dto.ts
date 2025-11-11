import { IsEmail, IsOptional, IsString, IsEnum } from 'class-validator';
import { ROLES, type Role } from '../../../shared/constants';

export class createUserDto {
  @IsOptional() @IsString() code?: string;
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() password!: string;
  @IsOptional() @IsEnum(ROLES) role?: Role;
}
