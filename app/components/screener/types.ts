export interface FilterValues {
  minPrice?: number;
  maxPrice?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minPE?: number;
  maxPE?: number;
  minDividendYield?: number;
  sectors: string[];
  industries: string[];
}

export interface TechnicalFilterValues {
  rsiCondition?: 'oversold' | 'overbought' | 'neutral';
  maCondition?: 'golden_cross' | 'death_cross' | 'above_ma' | 'below_ma';
  volumeSpike: boolean;
}
