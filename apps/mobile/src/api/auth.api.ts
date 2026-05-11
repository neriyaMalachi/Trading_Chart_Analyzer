import type { AuthSession, AuthTokens, MeResponse } from '@tca/types';
import type { LoginRequestDto, RegisterRequestDto } from '@tca/validators';

import { apiRequest } from './client';

export const authApi = {
  register: (input: RegisterRequestDto): Promise<AuthSession> =>
    apiRequest<AuthSession>('/auth/register', { method: 'POST', body: input, skipAuth: true }),

  login: (input: LoginRequestDto): Promise<AuthSession> =>
    apiRequest<AuthSession>('/auth/login', { method: 'POST', body: input, skipAuth: true }),

  refresh: (refreshToken: string): Promise<AuthTokens> =>
    apiRequest<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      skipAuth: true,
    }),

  me: (): Promise<MeResponse> => apiRequest<MeResponse>('/users/me'),
};
