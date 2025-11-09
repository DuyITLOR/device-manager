import { Controller, Get, Query, Param, ParseEnumPipe } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';
import { ActivityTargetType } from '@prisma/client';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}
  @Get()
  findAll(@Query() query: QueryActivityLogDto) {
    return this.activityService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(id);
  }

  @Get('target/:targetType/:targetId')
  findByTarget(
    @Param('targetType', new ParseEnumPipe(ActivityTargetType))
    targetType: ActivityTargetType,
    @Param('targetId') targetId: string,
    @Query('limit') limit?: number,
  ) {
    return this.activityService.findByTarget(targetType, targetId, limit);
  }

  @Get('actor/:actorId')
  findByActor(
    @Param('actorId') actorId: string,
    @Query('limit') limit?: number,
  ) {
    return this.activityService.findByActor(actorId, limit);
  }
}
