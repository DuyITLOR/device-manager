import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ActivityAction, ActivityTargetType } from '@prisma/client';

export class CreateActivityLogDto {
  @IsOptional()
  @IsString()
  actorId?: string;

  @IsEnum(ActivityAction)
  @IsNotEmpty()
  action: ActivityAction;

  @IsEnum(ActivityTargetType)
  @IsNotEmpty()
  targetType: ActivityTargetType;

  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsObject()
  @IsOptional()
  details?: Record<string, any>;
}
