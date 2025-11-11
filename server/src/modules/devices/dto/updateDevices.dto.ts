import { IsEnum, IsOptional, IsString } from "class-validator";
import { DeviceStatus } from "@prisma/client";

export class UpdateDevicesDto {
    @IsString()
    @IsOptional()
    name?: string

    @IsString()
    @IsOptional()
    description?: string

    @IsEnum(DeviceStatus)
    @IsOptional()
    status?: DeviceStatus
}