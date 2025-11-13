import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ROLES, type Role } from '../../../shared/constants';

export class updateUserDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(ROLES) role?: Role;
}
