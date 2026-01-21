// Stock Market Data Types
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  peRatio?: number;
  eps?: number;
  dividendYield?: number;
  week52High?: number;
  week52Low?: number;
  high52Week?: number;
  low52Week?: number;
  beta?: number;
  sector?: string;
  industry?: string;
  description?: string;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  avgVolume?: number;
  dayLow?: number;
  dayHigh?: number;
  forwardPe?: number;
  exchange?: string;
  currency?: string;
  lastUpdated?: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface StockQuote extends Stock {
  open: number;
  high: number;
  low: number;
  previousClose: number;
  avgVolume: number;
}

export interface StockData {
  symbol: string;
  historicalData: HistoricalData[];
  technicalIndicators?: TechnicalIndicators;
  fundamentalData?: FundamentalData;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  symbol: string;
  rsi?: number;
  sma20?: number;
  sma50?: number;
  sma200?: number;
  ema12?: number;
  ema26?: number;
  macd?: number;
  macdSignal?: number;
  macdHistogram?: number;
  bollingerUpper?: number;
  bollingerLower?: number;
  bollingerMiddle?: number;
  stochK?: number;
  stochD?: number;
  williams?: number;
  atr?: number;
  adx?: number;
}

export interface FundamentalData {
  symbol: string;
  marketCap?: number;
  enterpriseValue?: number;
  trailingPE?: number;
  forwardPE?: number;
  pegRatio?: number;
  priceToBook?: number;
  priceToSales?: number;
  enterpriseToRevenue?: number;
  enterpriseToEbitda?: number;
  debtToEquity?: number;
  currentRatio?: number;
  quickRatio?: number;
  grossMargins?: number;
  operatingMargins?: number;
  netProfitMargins?: number;
  returnOnAssets?: number;
  returnOnEquity?: number;
  revenue?: number;
  revenuePerShare?: number;
  earningsGrowth?: number;
  revenueGrowth?: number;
  freeCashflow?: number;
  operatingCashflow?: number;
  sharesOutstanding?: number;
  floatShares?: number;
  heldPercentInstitutions?: number;
  heldPercentInsiders?: number;
}

export interface StockRecommendation {
  symbol: string;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  factors: string[];
  lastUpdated: string;
  targetPrice?: number;
  analyst?: {
    upgradeDowngradeHistory?: Array<{
      date: string;
      firm: string;
      toGrade: string;
      fromGrade: string;
      action: string;
    }>;
  };
}

export interface ScreenerFilters {
  minPrice?: number;
  maxPrice?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minVolume?: number;
  maxVolume?: number;
  sector?: string;
  sectors?: string[];
  industry?: string;
  minPE?: number;
  maxPE?: number;
  minDividendYield?: number;
  country?: string;
  exchange?: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  addedAt: string;
  notes?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  relatedSymbols: string[];
}

export interface EarningsData {
  symbol: string;
  date: string;
  quarter: string;
  year: number;
  estimatedEPS: number;
  actualEPS: number;
  surprise: number;
  surprisePercent: number;
  revenue: number;
  estimatedRevenue: number;
}

export interface DividendData {
  symbol: string;
  exDate: string;
  payDate: string;
  recordDate: string;
  declaredDate: string;
  amount: number;
  type: 'REGULAR' | 'SPECIAL' | 'STOCK';
  frequency: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL';
}

export interface PortfolioPosition {
  id: string;
  symbol: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  addedAt: string;
  lastUpdated: string;
}

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ChartData {
  date: string;
  value: number;
  volume?: number;
  [key: string]: any;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  website?: string;
  headquarters?: string;
  employees?: number;
  founded?: string;
  ceo?: string;
  marketCap: number;
  logo?: string;
}

// UI Component Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'index' | 'crypto';
  exchange?: string;
  currency?: string;
}

export interface ChartConfig {
  period: '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | 'MAX';
  interval: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo';
  indicators: string[];
  showVolume: boolean;
}