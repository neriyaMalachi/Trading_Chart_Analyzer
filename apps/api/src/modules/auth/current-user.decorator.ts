import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { UserRow } from '../../db/schema';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserRow => {
    const request = ctx.switchToHttp().getRequest<{ user: UserRow }>();
    return request.user;
  },
);
