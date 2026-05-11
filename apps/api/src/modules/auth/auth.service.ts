import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LIMITS } from '@tca/constants';
import * as bcrypt from 'bcrypt';
import { and, eq, gt, isNull } from 'drizzle-orm';
import * as crypto from 'node:crypto';

import type { AuthSession, AuthTokens, User } from '@tca/types';
import type { LoginRequestDto, RegisterRequestDto } from '@tca/validators';

import { DB_TOKEN, type Database } from '../../db/db.module';
import { refreshTokens, users, type UserRow } from '../../db/schema';

const BCRYPT_ROUNDS = 12;

interface JwtPayload {
  sub: string;
  email: string;
  tier: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: Database,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(input: RegisterRequestDto): Promise<AuthSession> {
    const existing = await this.db.query.users.findFirst({ where: eq(users.email, input.email) });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const [row] = await this.db
      .insert(users)
      .values({ email: input.email, passwordHash })
      .returning();
    if (!row) throw new ConflictException('Failed to create user');

    const tokens = await this.issueTokens(row);
    return { user: this.toUser(row), tokens };
  }

  async login(input: LoginRequestDto): Promise<AuthSession> {
    const row = await this.db.query.users.findFirst({ where: eq(users.email, input.email) });
    if (!row) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(input.password, row.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(row);
    return { user: this.toUser(row), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const stored = await this.db.query.refreshTokens.findFirst({
      where: and(
        eq(refreshTokens.tokenHash, tokenHash),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    });
    if (!stored) throw new UnauthorizedException('Invalid refresh token');

    const userRow = await this.db.query.users.findFirst({ where: eq(users.id, stored.userId) });
    if (!userRow) throw new UnauthorizedException('User not found');

    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, stored.id));

    return this.issueTokens(userRow);
  }

  private async issueTokens(user: UserRow): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, tier: user.tier };
    const accessToken = await this.jwt.signAsync(payload);

    const refreshToken = crypto.randomBytes(48).toString('base64url');
    const tokenHash = this.hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + LIMITS.REFRESH_TOKEN_TTL_SECONDS * 1000);
    await this.db.insert(refreshTokens).values({ userId: user.id, tokenHash, expiresAt });

    return { accessToken, refreshToken };
  }

  private hashRefreshToken(token: string): string {
    const secret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    return crypto.createHmac('sha256', secret).update(token).digest('hex');
  }

  private toUser(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      tier: row.tier,
      dailyAnalysisCount: row.dailyAnalysisCount,
      dailyAnalysisResetAt: row.dailyAnalysisResetAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    };
  }
}
