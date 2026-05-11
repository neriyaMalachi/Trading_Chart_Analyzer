import { Controller, Get, UseGuards } from '@nestjs/common';

import type { MeResponse } from '@tca/types';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { UserRow } from '../../db/schema';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: UserRow): Promise<MeResponse> {
    return { user: this.users.toUser(user) };
  }
}
