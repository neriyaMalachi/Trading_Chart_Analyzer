export type Trend = 'bullish' | 'bearish' | 'sideways';

export type KeyLevelType = 'support' | 'resistance';

export type SignalStrength = 'weak' | 'moderate' | 'strong';

export type TechnicalIndicator = 'RSI' | 'MACD' | 'MA' | 'EMA' | 'SMA' | 'Volume' | 'Bollinger';

export interface KeyLevel {
  type: KeyLevelType;
  price: number;
  description: string;
}

export interface TechnicalSignal {
  indicator: TechnicalIndicator | string;
  reading: string;
  interpretation: string;
  strength: SignalStrength;
}

export interface AnalysisResponse {
  trend: Trend;
  trendDescription: string;
  keyLevels: KeyLevel[];
  technicalSignals: TechnicalSignal[];
  pointsToWatch: string[];
  disclaimer: string;
}

export interface Analysis extends AnalysisResponse {
  id: string;
  userId: string;
  imageUrl: string;
  createdAt: string;
}
