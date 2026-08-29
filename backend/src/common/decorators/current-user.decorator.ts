import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../request-with-user.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser | undefined => {
    return context.switchToHttp().getRequest().user;
  },
);