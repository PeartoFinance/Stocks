import { getFromCache, setCache } from './cache';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

interface TechnicalAnalysisResponse {
  symbol: string;
  price: number;
  status?: string;
  message?: string;
  summary: {
    score: number;
    signal: string;
    oscillatorsScore: number;
    movingAveragesScore: number;
    counts: {
      oscillators: { buy: number; sell: number; neutral: number };
      movingAverages: { buy: number; sell: number; neutral: number };
    };
  };
  indicators: {
    rsi: { value: number; signal: string };
    stoch: { k: number; signal: string };
    macd: { value: number; signal: string };
    cci: { value: number; signal: string };
    movingAverages: Array<{ name: string; value: number; signal: string }>;
  };
}

export async function getTechnicalAnalysis(symbol: string): Promise<TechnicalAnalysisResponse> {
  const endpoint = `/market/technical-analysis/${symbol}`;
  const cached = getFromCache<TechnicalAnalysisResponse>(endpoint);
  if (cached) return cached;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error('Failed to fetch technical analysis');
  const data = await response.json();
  setCache(endpoint, data);
  return data;
}
