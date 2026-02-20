const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

interface TechnicalAnalysisResponse {
  symbol: string;
  price: number;
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
  const response = await fetch(`${API_BASE}/market/technical-analysis/${symbol}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error('Failed to fetch technical analysis');
  return response.json();
}
