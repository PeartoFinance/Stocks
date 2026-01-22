/**
 * Market Data Service for Stocks App
 * Matches frontend-Pearto-new API structure
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to make API requests
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Country': 'GLOBAL',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Market Service
export const marketService = {
  // Get stock profile with extended data
  async getStockProfile(symbol: string) {
    return apiRequest(`/stocks/profile/${symbol}`);
  },

  // Get stock history
  async getStockHistory(symbol: string, period = '1mo', interval = '1d') {
    return apiRequest(`/stocks/history/${symbol}?period=${period}&interval=${interval}`);
  },

  // Get stock financials
  async getStockFinancials(symbol: string, period: 'annual' | 'quarterly' = 'annual') {
    return apiRequest(`/stocks/financials/${symbol}?period=${period}`);
  },

  // Get analyst forecast
  async getStockForecast(symbol: string) {
    return apiRequest(`/stocks/forecast/${symbol}`);
  },

  // Get stock statistics
  async getStockStatistics(symbol: string) {
    return apiRequest(`/stocks/statistics/${symbol}`);
  },

  // Get stock dividends
  async getStockDividends(symbol: string) {
    return apiRequest(`/stocks/dividends/${symbol}`);
  },

  // Search stocks
  async searchStocks(query: string, limit = 10) {
    return apiRequest(`/stocks/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },
};

// News Service
export const newsService = {
  // Get news by stock symbol
  async getNewsByStock(symbol: string, limit = 10) {
    return apiRequest(`/news/stock/${symbol}?limit=${limit}`);
  },

  // Get published news
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