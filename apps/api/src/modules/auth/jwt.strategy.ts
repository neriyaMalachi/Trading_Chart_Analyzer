import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { eq } from 'drizzle-orm';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { DB_TOKEN, type Database } from '../../db/db.module';
import { users, type UserRow } from '../../db/schema';

interface JwtPayload {
  sub: string;
  email: string;
  tier: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(ConfigService) config: ConfigService,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<UserRow> {
    const user = await this.db.query.users.findFirst({ where: eq(users.id, payload.sub) });
    if (!user) throw new UnauthorizedException('User no longer exists');
    return user;
  }
}
