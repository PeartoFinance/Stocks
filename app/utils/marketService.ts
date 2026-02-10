/**
 * Market Data Service for Stocks App
 * Matches frontend-Pearto-new API structure
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';

// Helper to make API requests
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Country': 'US', // Defaulting to US for broad discovery
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// Types for market overview response
export interface MarketOverviewResponse {
  indices: Array<{
    name: string;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    dayHigh?: number;
    dayLow?: number;
  }>;
  topGainers: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume?: number;
    marketCap?: number;
    peRatio?: number;
    sector?: string;
  }>;
  topLosers: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume?: number;
    marketCap?: number;
    peRatio?: number;
    sector?: string;
  }>;
  mostActive: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume?: number;
    marketCap?: number;
    peRatio?: number;
    sector?: string;
  }>;
  advancers: number;
  decliners: number;
  unchanged: number;
  totalVolume: number;
}

// Market Service
export const marketService = {
  // --- Core Profile & Search ---
  async getStockProfile(symbol: string) {
    return apiRequest(`/stocks/profile/${symbol.toUpperCase()}`);
  },

  async searchStocks(query: string, limit = 10) {
    return apiRequest(`/stocks/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  // --- Financials Tab ---
  async getStockFinancials(symbol: string, period: 'annual' | 'quarterly' = 'annual') {
    return apiRequest(`/stocks/financials/${symbol.toUpperCase()}?period=${period}`);
  },

  async getFinancialStatements(symbol: string, type: 'income' | 'balance' | 'cash_flow' = 'income', period = 'annual') {
    return apiRequest(`/stocks/financials/${symbol.toUpperCase()}/statements?statement_type=${type}&period=${period}`);
  },

  // --- Forecast Tab ---
  async getStockForecast(symbol: string) {
    return apiRequest(`/stocks/forecast/${symbol.toUpperCase()}`);
  },

  // --- Statistics Tab ---
  async getStockStatistics(symbol: string) {
    return apiRequest(`/stocks/statistics/${symbol.toUpperCase()}`);
  },

  // --- Dividends Tab ---
  async getStockDividends(symbol: string) {
    return apiRequest(`/stocks/dividends/${symbol.toUpperCase()}`);
  },

  // --- Charting/History ---
  async getStockHistory(symbol: string, period = '1mo', interval = '1d') {
    return apiRequest(`/stocks/history/${symbol.toUpperCase()}?period=${period}&interval=${interval}`);
  },

  // --- Market Overview (Movers/Active) ---
  async getMarketOverview(): Promise<MarketOverviewResponse> {
    return apiRequest('/market/overview');
  },

  async getMovers(type: 'gainers' | 'losers' | 'both' = 'both', limit = 10) {
    return apiRequest(`/stocks/movers?type=${type}&limit=${limit}`);
  },

  async getMostActive(limit = 10) {
    return apiRequest(`/stocks/most-active?limit=${limit}`);
  }
};

// News Service
export const newsService = {
  // Get news specifically for a ticker (Used in News Tab)
  async getNewsByStock(symbol: string, limit = 10) {
    return apiRequest(`/news/stock/${symbol.toUpperCase()}?limit=${limit}`);
  },

  // General feed
  async getPublishedNews(options?: { limit?: number; offset?: number; category?: string }) {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));
    if (options?.category) params.set('category', options.category);

    return apiRequest(`/news/published?${params.toString()}`);
  },
};

export default {
  marketService,
  newsService,
};