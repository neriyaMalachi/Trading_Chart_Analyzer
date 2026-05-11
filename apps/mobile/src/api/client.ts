import type { AuthTokens } from '@tca/types';

import { env } from '../config/env';
import { useAuthStore } from '../stores/auth.store';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function refreshAccessToken(): Promise<AuthTokens | null> {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens) return null;

  const res = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });
  if (!res.ok) {
    useAuthStore.getState().clear();
    return null;
  }
  const next = (await res.json()) as AuthTokens;
  useAuthStore.getState().setTokens(next);
  return next;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, skipAuth } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (!skipAuth) {
    const tokens = useAuthStore.getState().tokens;
    if (tokens) headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const doFetch = async (): Promise<Response> =>
    fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });

  let res = await doFetch();
  if (res.status === 401 && !skipAuth) {
    const next = await refreshAccessToken();
    if (next) {
      headers.Authorization = `Bearer ${next.accessToken}`;
      res = await doFetch();
    }
  }

  if (!res.ok) {
    const payload: unknown = await res.json().catch(() => null);
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : res.statusText;
    throw new ApiError(res.status, message, payload);
  }

  return (await res.json()) as T;
}
