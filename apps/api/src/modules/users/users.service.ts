import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { LIMITS } from '@tca/constants';
import { eq, sql } from 'drizzle-orm';

import type { User } from '@tca/types';

import { DB_TOKEN, type Database } from '../../db/db.module';
import { users, type UserRow } from '../../db/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DB_TOKEN) private readonly db: Database) {}

  toUser(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      tier: row.tier,
      dailyAnalysisCount: row.dailyAnalysisCount,
      dailyAnalysisResetAt: row.dailyAnalysisResetAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    };
  }

  async assertCanAnalyse(user: UserRow): Promise<UserRow> {
    const refreshed = await this.maybeResetDailyCounter(user);
    if (refreshed.tier !== 'free') return refreshed;
    if (refreshed.dailyAnalysisCount >= LIMITS.FREE_DAILY_ANALYSES) {
      throw new ForbiddenException(
        `Daily limit reached (${LIMITS.FREE_DAILY_ANALYSES} per day on Free tier). Upgrade to Pro for unlimited analyses.`,
      );
    }
    return refreshed;
  }

  async incrementAnalysisCount(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({ dailyAnalysisCount: sql`${users.dailyAnalysisCount} + 1` })
      .where(eq(users.id, userId));
  }

  private async maybeResetDailyCounter(user: UserRow): Promise<UserRow> {
    const todayUtcMidnight = new Date();
    todayUtcMidnight.setUTCHours(0, 0, 0, 0);
    if (user.dailyAnalysisResetAt >= todayUtcMidnight) return user;

    const [updated] = await this.db
      .update(users)
      .set({ dailyAnalysisCount: 0, dailyAnalysisResetAt: todayUtcMidnight })
      .where(eq(users.id, user.id))
      .returning();
    return updated ?? user;
  }
}
