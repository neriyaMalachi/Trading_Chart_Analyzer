import type { Analysis } from '@tca/types';
import { create } from 'zustand';

interface PendingImage {
  uri: string;
  base64: string;
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
  sizeBytes: number;
}

interface AnalysisState {
  pendingImage: PendingImage | null;
  currentAnalysis: Analysis | null;
  setPendingImage: (image: PendingImage | null) => void;
  setCurrentAnalysis: (analysis: Analysis | null) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  pendingImage: null,
  currentAnalysis: null,
  setPendingImage: (image) => set({ pendingImage: image }),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
}));
