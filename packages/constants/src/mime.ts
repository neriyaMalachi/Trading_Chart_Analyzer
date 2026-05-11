import type { SupportedMimeType } from '@tca/types';

export const SUPPORTED_MIME_TYPES: readonly SupportedMimeType[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

export const SUPPORTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const;

export function isSupportedMimeType(value: string): value is SupportedMimeType {
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(value);
}
