import { LIMITS } from '@tca/constants';
import { z } from 'zod';

import { UserSchema } from './user.schema';

const passwordSchema = z
  .string()
  .min(LIMITS.PASSWORD_MIN_LENGTH, `Password must be at least ${LIMITS.PASSWORD_MIN_LENGTH} characters`)
  .max(LIMITS.PASSWORD_MAX_LENGTH)
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const RegisterRequestSchema = z.object({
  email: z.string().email().max(LIMITS.EMAIL_MAX_LENGTH).toLowerCase().trim(),
  password: passwordSchema,
  acceptedDisclaimer: z.literal(true, {
    message: 'You must acknowledge the educational-only disclaimer to register.',
  }),
});

export const LoginRequestSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const AuthSessionSchema = z.object({
  user: UserSchema,
  tokens: AuthTokensSchema,
});

export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>;
export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;
export type RefreshTokenRequestDto = z.infer<typeof RefreshTokenRequestSchema>;
export type PasswordResetRequestDto = z.infer<typeof PasswordResetRequestSchema>;
