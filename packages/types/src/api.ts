import type { Analysis, AnalysisResponse } from './analysis';
import type { AuthSession, User } from './user';

export type SupportedMimeType = 'image/png' | 'image/jpeg' | 'image/webp';

export interface UploadAnalysisRequest {
  imageBase64: string;
  mimeType: SupportedMimeType;
}

export interface UploadAnalysisResponse {
  analysis: Analysis;
}

export interface RegisterRequest {
  email: string;
  password: string;
  acceptedDisclaimer: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export type RegisterResponse = AuthSession;
export type LoginResponse = AuthSession;

export interface MeResponse {
  user: User;
}

export interface AnalysisHistoryResponse {
  items: Analysis[];
  total: number;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

export type ClaudeRawAnalysis = AnalysisResponse;
