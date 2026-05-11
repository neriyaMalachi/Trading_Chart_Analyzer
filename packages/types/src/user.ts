export type Tier = 'free' | 'pro' | 'team';

export interface User {
  id: string;
  email: string;
  tier: Tier;
  dailyAnalysisCount: number;
  dailyAnalysisResetAt: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}
