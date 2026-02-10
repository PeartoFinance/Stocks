/**
 * Crypto Data Service for Stocks App
 * Matches frontend-Pearto-new API structure for Cryptocurrency
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.pearto.com/api';

// Helper to make API requests (Matches your existing utility)
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Country': 'US', // Default, can be overridden by options.headers
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const cryptoService = {
  /**
   * Get cryptocurrency market listings
   * Supports pagination and sorting
   */
  async getMarkets(options?: { limit?: number; page?: number; sort?: 'market_cap' | 'price' | 'change' | 'volume' }) {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.page) params.set('page', String(options.page));
    if (options?.sort) params.set('sort', options.sort);

    return apiRequest(`/crypto/markets?${params.toString()}`);
  },

  /**
   * Get global cryptocurrency market metrics (Total Cap, Volume, Dominance)
   */
  async getGlobalMetrics() {
    return apiRequest(`/crypto/global`);
  },

  /**
   * Get details for a single cryptocurrency by symbol (e.g., 'BTC')
   */
  async getCoinDetails(symbol: string) {
    return apiRequest(`/crypto/coin/${symbol.toUpperCase()}`);
  },

  /**
   * Get multiple coins by a comma-separated list of symbols
   */
  async getCoinsBySymbols(symbols: string[]) {
    const symbolsParam = symbols.join(',');
    return apiRequest(`/crypto/coins?symbols=${symbolsParam}`);
  },

  /**
   * Get top gaining cryptocurrencies
   */
  async getTopGainers(limit = 10) {
    return apiRequest(`/crypto/gainers?limit=${limit}`);
  },

  /**
   * Get top losing cryptocurrencies
   */
  async getTopLosers(limit = 10) {
    return apiRequest(`/crypto/losers?limit=${limit}`);
  },

  async getHistory(symbol: string, period = '1mo', interval = '1d') {
    const params = new URLSearchParams({ period, interval });
    return apiRequest<{
      symbol: string;
      period: string;
      interval: string;
      data: Array<{
        date: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number
      }>;
    }>(`/crypto/history/${symbol.toUpperCase()}?${params.toString()}`);
  },

  /**
   * Get cryptocurrency news for a specific symbol
   * Uses Flask backend news search API with crypto symbol as query
   */
  async getNews(symbol: string, limit = 20) {
    const params = new URLSearchParams({ 
      q: symbol.toLowerCase(), // Search for the crypto symbol
      limit: String(limit) 
    });
    return apiRequest<{
      q: string;
      items: Array<{
        id: number;
        title: string;
        summary: string;
        full_content?: string;
        url?: string;
        canonical_url?: string;
        source: string;
        source_type?: string;
        author?: string;
        image?: string;
        category?: string;
        featured?: boolean;
        published_at: string;
        slug?: string;
        country_code?: string;
        related_symbol?: string;
      }>;
      total: number;
    }>(`/news/search?${params.toString()}`);
  },
};

export default cryptoService;