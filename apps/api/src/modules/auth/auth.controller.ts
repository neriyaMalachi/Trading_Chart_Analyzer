import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  RegisterRequestSchema,
  type LoginRequestDto,
  type RefreshTokenRequestDto,
  type RegisterRequestDto,
} from '@tca/validators';
import { ZodValidationPipe } from 'nestjs-zod';

import type { AuthSession, AuthTokens } from '@tca/types';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterRequestSchema)) body: RegisterRequestDto,
  ): Promise<AuthSession> {
    return this.auth.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginRequestSchema)) body: LoginRequestDto,
  ): Promise<AuthSession> {
    return this.auth.login(body);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body(new ZodValidationPipe(RefreshTokenRequestSchema)) body: RefreshTokenRequestDto,
  ): Promise<AuthTokens> {
    return this.auth.refresh(body.refreshToken);
  }
}
