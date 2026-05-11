import { LIMITS } from '@tca/constants';
import { z } from 'zod';

export const TrendSchema = z.enum(['bullish', 'bearish', 'sideways']);

export const KeyLevelTypeSchema = z.enum(['support', 'resistance']);

export const SignalStrengthSchema = z.enum(['weak', 'moderate', 'strong']);

export const KeyLevelSchema = z.object({
  type: KeyLevelTypeSchema,
  price: z.number().finite(),
  description: z.string().min(1),
});

export const TechnicalSignalSchema = z.object({
  indicator: z.string().min(1),
  reading: z.string().min(1),
  interpretation: z.string().min(1),
  strength: SignalStrengthSchema,
});

const FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /\bbuy\b/i,
  /\bsell\b/i,
  /\blong\b/i,
  /\bshort\b/i,
  /\benter (?:a )?(?:long|short|trade|position)\b/i,
  /\bexit (?:a )?(?:long|short|trade|position)\b/i,
  /\bguarant\w*/i,
  /\bprofit\b/i,
  /\bwill (?:rise|fall|moon|crash)\b/i,
];

function assertNoForbiddenLanguage(value: string, ctx: z.RefinementCtx): void {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `AI output contains forbidden language: ${pattern.source}`,
      });
      return;
    }
  }
}

const guardedString = (min = 1): z.ZodString =>
  z
    .string()
    .min(min)
    .superRefine((value, ctx) => assertNoForbiddenLanguage(value, ctx));

export const AnalysisResponseSchema = z.object({
  trend: TrendSchema,
  trendDescription: guardedString(20),
  keyLevels: z.array(
    KeyLevelSchema.extend({
      description: guardedString(),
    }),
  ),
  technicalSignals: z.array(
    TechnicalSignalSchema.extend({
      reading: guardedString(),
      interpretation: guardedString(),
    }),
  ),
  pointsToWatch: z.array(guardedString()).max(10),
  disclaimer: z.string().min(1),
});

export const SupportedMimeTypeSchema = z.enum(['image/png', 'image/jpeg', 'image/webp']);

export const UploadAnalysisRequestSchema = z.object({
  imageBase64: z
    .string()
    .min(1)
    .refine(
      (value) => {
        const approxBytes = Math.floor((value.length * 3) / 4);
        return approxBytes <= LIMITS.MAX_IMAGE_BYTES;
      },
      { message: `Image exceeds ${LIMITS.MAX_IMAGE_BYTES_LABEL} limit` },
    ),
  mimeType: SupportedMimeTypeSchema,
});

export const AnalysisSchema = AnalysisResponseSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  imageUrl: z.string().url(),
  createdAt: z.string().datetime(),
});

export const AnalysisHistoryResponseSchema = z.object({
  items: z.array(AnalysisSchema),
  total: z.number().int().nonnegative(),
});

export type UploadAnalysisRequestDto = z.infer<typeof UploadAnalysisRequestSchema>;
export type AnalysisResponseDto = z.infer<typeof AnalysisResponseSchema>;
export type AnalysisDto = z.infer<typeof AnalysisSchema>;
export type AnalysisHistoryResponseDto = z.infer<typeof AnalysisHistoryResponseSchema>;
