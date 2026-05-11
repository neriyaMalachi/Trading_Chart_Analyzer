import { sql } from 'drizzle-orm';
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import type { KeyLevel, TechnicalSignal } from '@tca/types';

export const tierEnum = pgEnum('tier', ['free', 'pro', 'team']);
export const trendEnum = pgEnum('trend', ['bullish', 'bearish', 'sideways']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    tier: tierEnum('tier').notNull().default('free'),
    dailyAnalysisCount: integer('daily_analysis_count').notNull().default(0),
    dailyAnalysisResetAt: timestamp('daily_analysis_reset_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    stripeCustomerId: text('stripe_customer_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_unique').on(table.email),
  }),
);

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const analyses = pgTable('analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  imageS3Key: text('image_s3_key').notNull(),
  trend: trendEnum('trend').notNull(),
  trendDescription: text('trend_description').notNull(),
  keyLevels: jsonb('key_levels').$type<KeyLevel[]>().notNull(),
  technicalSignals: jsonb('technical_signals').$type<TechnicalSignal[]>().notNull(),
  pointsToWatch: jsonb('points_to_watch').$type<string[]>().notNull(),
  disclaimer: text('disclaimer').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type AnalysisRow = typeof analyses.$inferSelect;
export type NewAnalysisRow = typeof analyses.$inferInsert;
export type RefreshTokenRow = typeof refreshTokens.$inferSelect;
export type NewRefreshTokenRow = typeof refreshTokens.$inferInsert;
