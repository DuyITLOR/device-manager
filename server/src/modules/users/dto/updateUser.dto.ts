import { IsOptional, IsString } from "class-validator";

export class updateUserDto {
    @IsOptional() @IsString() code?: string;
    @IsOptional() @IsString() name?: string;
}