import { z } from 'zod';

export const TierSchema = z.enum(['free', 'pro', 'team']);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  tier: TierSchema,
  dailyAnalysisCount: z.number().int().nonnegative(),
  dailyAnalysisResetAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export type UserDto = z.infer<typeof UserSchema>;
