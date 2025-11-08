import { IsString } from 'class-validator';

export class changePasswordDto{
    @IsString() currentPassword!: string;
    @IsString() newPassword!: string;
}