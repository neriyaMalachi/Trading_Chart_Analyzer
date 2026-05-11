import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LIMITS } from '@tca/constants';

import { AnalysisModule } from './modules/analysis/analysis.module';
import { AuthModule } from './modules/auth/auth.module';
import { DbModule } from './db/db.module';
import { HealthModule } from './modules/health/health.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { UsersModule } from './modules/users/users.module';
import { configValidationSchema } from './config/env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => configValidationSchema.parse(env),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: LIMITS.THROTTLE_TTL_SECONDS * 1000,
        limit: LIMITS.THROTTLE_LIMIT_PER_MIN,
      },
    ]),
    DbModule,
    HealthModule,
    AuthModule,
    UsersModule,
    AnalysisModule,
    PaymentsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
