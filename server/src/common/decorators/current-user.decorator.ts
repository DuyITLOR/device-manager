import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): unknown => {
    // Type the request to avoid any and mark user as unknown.
    const req = ctx.switchToHttp().getRequest<Request & { user?: unknown }>();
    return req.user;
  },
);
