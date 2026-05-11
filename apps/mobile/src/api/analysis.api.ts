import { AnalysisHistoryResponseSchema, AnalysisSchema } from '@tca/validators';
import type { Analysis, AnalysisHistoryResponse, UploadAnalysisRequest } from '@tca/types';
import { z } from 'zod';

import { apiRequest } from './client';

const UploadResponseSchema = z.object({ analysis: AnalysisSchema });
const SingleResponseSchema = z.object({ analysis: AnalysisSchema });

export const analysisApi = {
  upload: async (input: UploadAnalysisRequest): Promise<Analysis> => {
    const res = await apiRequest<unknown>('/analysis/upload', { method: 'POST', body: input });
    return UploadResponseSchema.parse(res).analysis;
  },

  history: async (): Promise<AnalysisHistoryResponse> => {
    const res = await apiRequest<unknown>('/analysis/history');
    return AnalysisHistoryResponseSchema.parse(res);
  },

  byId: async (id: string): Promise<Analysis> => {
    const res = await apiRequest<unknown>(`/analysis/${id}`);
    return SingleResponseSchema.parse(res).analysis;
  },
};
