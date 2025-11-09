import {IsEnum} from 'class-validator';
import { ROLES, type Role } from '../../../shared/constants';

export class updateRoleDto {
    @IsEnum(ROLES) role!: Role;
}