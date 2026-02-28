import { Stock, MarketIndex, HistoricalData, TechnicalIndicators, FundamentalData, StockRecommendation, ScreenerFilters, APIResponse, StockData } from '../types';
import { getFromCache, setCache } from './cache';

/**
 * Stock API Service
 * Connects to core server's market data API with country-specific filtering
 * 
 * IMPORTANT: NEXT_PUBLIC_API_URL should be set to the base API URL
 * If it's https://pearto.com/api/ - endpoints will be /market/stocks (without /api/ prefix)
 * If it's https://pearto.com - endpoints will be /api/market/stocks (with /api/ prefix)
 */

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
// Remove trailing slash for consistent URL building
const API_BASE = RAW_API_BASE.replace(/\/$/, '');
// Check if API_BASE already ends with /api
const API_INCLUDES_PATH = API_BASE.endsWith('/api');
const COUNTRY_KEY = 'user_country_override';

// Get current country code from localStorage
function getCountryCode(): string {
  if (typeof window === 'undefined') return 'US';
  return localStorage.getItem(COUNTRY_KEY) || 'US';
}

// Build headers with country code (matching core app's implementation)
function buildHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-User-Country': getCountryCode(),
  };
}

// Build the full URL from endpoint
function buildUrl(endpoint: string): string {
  // If endpoint starts with /api/ and API_BASE already includes /api, remove it
  let cleanEndpoint = endpoint;
  if (API_INCLUDES_PATH && endpoint.startsWith('/api/')) {
    cleanEndpoint = endpoint.replace('/api/', '/');
  }
  return `${API_BASE}${cleanEndpoint}`;
}

// Helper to make API requests (matching core app's fetchWithTimeout pattern)
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cached = getFromCache<T>(endpoint);
  if (cached) return cached;

  const url = buildUrl(endpoint);

  const response = await fetch(url, {
    ...options,
    cache: 'no-store', // Match core app
    mode: 'cors',      // Explicitly set CORS mode
    credentials: 'omit', // Don't send cookies for cross-origin requests
    headers: {
      ...buildHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  setCache(endpoint, data);
  return data;
}

// Transform server response to Stock type
function transformQuote(data: Record<string, unknown>): Stock {
  return {
    symbol: String(data.symbol || ''),
    name: String(data.name || ''),
    price: Number(data.price) || 0,
    change: Number(data.change) || 0,
    changePercent: Number(data.changePercent) || 0,
    volume: Number(data.volume) || 0,
    marketCap: Number(data.marketCap || data.market_cap) || undefined,
    peRatio: Number(data.peRatio || data.pe_ratio) || undefined,
    eps: Number(data.eps) || undefined,
    dividendYield: Number(data.dividendYield || data.dividend_yield) || undefined,
    week52High: Number(data.high52w || data['52_week_high'] || data.yearHigh) || undefined,
    week52Low: Number(data.low52w || data['52_week_low'] || data.yearLow) || undefined,
    beta: Number(data.beta) || undefined,
    sector: String(data.sector || ''),
    industry: String(data.industry || ''),
    description: String(data.description || ''),
    high52Week: Number(data.high52w || data['52_week_high'] || data.yearHigh) || undefined,
    low52Week: Number(data.low52w || data['52_week_low'] || data.yearLow) || undefined,
  };
}

export const stockAPI = {
  // Market data endpoints
  async getMarketOverview(): Promise<APIResponse<MarketIndex[]>> {
    try {
      const data = await apiFetch<unknown[]>('/api/stocks/most-active?limit=10');

      const indices: MarketIndex[] = (data || []).slice(0, 4).map((item: unknown) => {
        const d = item as Record<string, unknown>;
        return {
          symbol: String(d.symbol || ''),
          name: String(d.name || ''),
          price: Number(d.price) || 0,
          change: Number(d.change) || 0,
          changePercent: Number(d.changePercent) || 0,
        };
      });

      return {
        data: indices,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] getMarketOverview error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  async getTrendingStocks(): Promise<APIResponse<Stock[]>> {
    try {
      const data = await apiFetch<{ gainers: unknown[] }>('/api/stocks/movers?type=gainers&limit=10');

      const stocks: Stock[] = (data.gainers || []).map((item: unknown) =>
        transformQuote(item as Record<string, unknown>)
      );

      return {
        data: stocks,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] getTrendingStocks error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  // Stock data endpoints
  async searchStocks(query: string): Promise<APIResponse<Array<{ symbol: string; name: string; assetType?: string; price?: number; changePercent?: number; exchange?: string }>>> {
    try {
      const data = await apiFetch<unknown[]>(
        `/api/stocks/search?q=${encodeURIComponent(query)}&limit=10`
      );

      const results = (data || []).map((item: unknown) => {
        const d = item as Record<string, unknown>;
        return {
          symbol: String(d.symbol || ''),
          name: String(d.name || ''),
          assetType: String(d.assetType || d.asset_type || 'stock'),
          price: Number(d.price) || undefined,
          changePercent: Number(d.changePercent || d.change_percent) || undefined,
          exchange: String(d.exchange || '') || undefined,
        };
      });

      return {
        data: results,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] searchStocks error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  async getStockQuote(symbol: string): Promise<APIResponse<Stock>> {
    try {
      const data = await apiFetch<Record<string, unknown>>(
        `/api/stocks/profile/${encodeURIComponent(symbol.toUpperCase())}`
      );

      if (!data) {
        throw new Error(`Stock ${symbol} not found`);
      }

      return {
        data: transformQuote(data),
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] getStockQuote error:', error);
      throw error;
    }
  },

  async getHistoricalData(symbol: string, period: string = '1y', interval: string = '1d'): Promise<APIResponse<HistoricalData[]>> {
    try {
      // Map period to backend format
      const rangeMap: Record<string, string> = {
        '1d': '1d', '5d': '5d', '1mo': '1mo', '3mo': '3mo',
        '6mo': '6mo', '1y': '1y', '2y': '2y', '5y': '5y'
      };
      const range = rangeMap[period] || '1y';

      const data = await apiFetch<{ symbol: string; period: string; interval: string; data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }> }>(
        `/api/stocks/history/${encodeURIComponent(symbol)}?period=${range}&interval=${interval}`
      );

      const historicalData: HistoricalData[] = (data.data || []).map(p => ({
        date: p.date,
        open: p.open || p.close,
        high: p.high || p.close,
        low: p.low || p.close,
        close: p.close,
        volume: p.volume || 0,
      }));

      return {
        data: historicalData,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] getHistoricalData error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  async getTodayData(symbol: string): Promise<APIResponse<HistoricalData | null>> {
    try {
      const data = await apiFetch<{ symbol: string; period: string; interval: string; data: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }> }>(
        `/api/stocks/history/${encodeURIComponent(symbol)}?period=1d&interval=1d`
      );

      const todayData = data.data && data.data.length > 0 ? data.data[data.data.length - 1] : null;

      if (!todayData) {
        return {
          data: null,
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      const result: HistoricalData = {
        date: todayData.date,
        open: todayData.open || todayData.close,
        high: todayData.high || todayData.close,
        low: todayData.low || todayData.close,
        close: todayData.close,
        volume: todayData.volume || 0,
      };

      return {
        data: result,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] getTodayData error:', error);
      return { data: null, success: false, timestamp: new Date().toISOString() };
    }
  },

  async getScreenerResults(filters: ScreenerFilters): Promise<APIResponse<Stock[]>> {
    try {
      const data = await apiFetch<unknown[]>('/api/stocks/quotes?symbols=AAPL,GOOGL,MSFT,TSLA,AMZN,META,NVDA,NFLX,AMD,INTC&limit=100');

      let results: Stock[] = (data || []).map((item: unknown) =>
        transformQuote(item as Record<string, unknown>)
      );

      // Apply filters client-side
      if (filters.minPrice) {
        results = results.filter(stock => stock.price >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        results = results.filter(stock => stock.price <= filters.maxPrice!);
      }
      if (filters.minMarketCap) {
        results = results.filter(stock => (stock.marketCap || 0) >= filters.minMarketCap!);
      }
      if (filters.maxMarketCap) {
        results = results.filter(stock => (stock.marketCap || 0) <= filters.maxMarketCap!);
      }
      if (filters.sector) {
        results = results.filter(stock => stock.sector?.toLowerCase() === filters.sector!.toLowerCase());
      }
      if (filters.minPE) {
        results = results.filter(stock => (stock.peRatio || 0) >= filters.minPE!);
      }
      if (filters.maxPE) {
        results = results.filter(stock => (stock.peRatio || 999) <= filters.maxPE!);
      }

      return {
        data: results,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] getScreenerResults error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  // Analysis endpoints
  async getTechnicalAnalysis(symbol: string): Promise<APIResponse<any>> {
    try {
      const data = await apiFetch<any>(`/market/technical-analysis/${symbol}`);
      
      return {
        data: data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] getTechnicalAnalysis error:', error);
      return {
        data: null,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  },

  async getFundamentalAnalysis(symbol: string): Promise<APIResponse<FundamentalData>> {
    try {
      const quoteData = await this.getStockQuote(symbol);
      const stock = quoteData.data;

      const mockFundamentals: FundamentalData = {
        symbol: symbol.toUpperCase(),
        marketCap: stock.marketCap,
        trailingPE: stock.peRatio,
        returnOnEquity: 0.15 + Math.random() * 0.25,
        returnOnAssets: 0.08 + Math.random() * 0.15,
        debtToEquity: Math.random() * 1.5,
        currentRatio: 1 + Math.random() * 2,
        quickRatio: 0.5 + Math.random() * 1.5,
        grossMargins: 0.3 + Math.random() * 0.4,
        operatingMargins: 0.1 + Math.random() * 0.25,
        netProfitMargins: 0.05 + Math.random() * 0.2,
        priceToBook: 2 + Math.random() * 8,
        priceToSales: 3 + Math.random() * 12,
        earningsGrowth: -0.1 + Math.random() * 0.5,
        revenueGrowth: 0 + Math.random() * 0.3,
      };

      return {
        data: mockFundamentals,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] getFundamentalAnalysis error:', error);
      throw error;
    }
  },

  async getStockRecommendation(symbol: string): Promise<APIResponse<StockRecommendation>> {
    const recommendations = ['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'] as const;
    const confidenceLevels = ['HIGH', 'MEDIUM', 'LOW'] as const;

    const mockRecommendation: StockRecommendation = {
      symbol: symbol.toUpperCase(),
      recommendation: recommendations[Math.floor(Math.random() * 3)], // Bias towards positive
      confidence: confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)],
      score: Math.floor(Math.random() * 6), // 0-5 instead of -5 to 5
      factors: [
        'Strong earnings growth potential',
        'Positive technical momentum',
        'Attractive valuation metrics',
        'Sector outperformance expected',
      ],
      lastUpdated: new Date().toISOString(),
      targetPrice: 150 + Math.random() * 100,
    };

    return {
      data: mockRecommendation,
      success: true,
      timestamp: new Date().toISOString(),
    };
  },

  async getAllStocks(): Promise<APIResponse<Stock[]>> {
    try {
      const data = await apiFetch<unknown[]>('/live/stocks?limit=100');

      const stocks: Stock[] = (data || []).map((item: unknown) =>
        transformQuote(item as Record<string, unknown>)
      );

      return {
        data: stocks,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] getAllStocks error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  async getStock(symbol: string): Promise<APIResponse<Stock>> {
    return this.getStockQuote(symbol);
  },

  async getStockData(symbol: string): Promise<APIResponse<StockData>> {
    try {
      const historyResponse = await this.getHistoricalData(symbol, '1m');

      const stockData: StockData = {
        symbol: symbol.toUpperCase(),
        historicalData: historyResponse.data
      };

      return {
        data: stockData,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] getStockData error:', error);
      throw error;
    }
  },

  // Market movers (gainers/losers)
  async getMarketMovers(type: 'gainers' | 'losers'): Promise<APIResponse<Stock[]>> {
    try {
      const data = await apiFetch<{ gainers?: unknown[]; losers?: unknown[] }>(
        `/api/stocks/movers?type=${type}&limit=50`
      );

      const stocks: Stock[] = (data[type] || []).map((item: unknown) =>
        transformQuote(item as Record<string, unknown>)
      );

      return {
        data: stocks,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] getMarketMovers error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  // Get gainers specifically
  async getGainers(): Promise<APIResponse<Stock[]>> {
    return this.getMarketMovers('gainers');
  },

  // Get losers specifically
  async getLosers(): Promise<APIResponse<Stock[]>> {
    return this.getMarketMovers('losers');
  },

  // Crypto data
  async getCryptoData(): Promise<APIResponse<Stock[]>> {
    try {
      const data = await apiFetch<unknown[]>('/api/crypto/quotes?symbols=BTC,ETH,BNB,XRP,ADA,SOL,DOGE,DOT,AVAX,MATIC&limit=50');

      const crypto: Stock[] = (data || []).map((item: unknown) => {
        const d = item as Record<string, unknown>;
        return {
          symbol: String(d.symbol || ''),
          name: String(d.name || ''),
          price: Number(d.price || d.current_price) || 0,
          change: Number(d.change || d.price_change_24h) || 0,
          changePercent: Number(d.changePercent || d.price_change_percentage_24h) || 0,
          volume: Number(d.volume || d.total_volume) || 0,
          marketCap: Number(d.marketCap || d.market_cap) || undefined,
        };
      });

      return {
        data: crypto,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] getCryptoData error:', error);
      return { data: [], success: false, timestamp: new Date().toISOString() };
    }
  },

  // News endpoints
  async getPublishedNews(category?: string): Promise<{ items: any[]; total: number }> {
    try {
      const endpoint = category && category !== 'All'
        ? `/api/news/published?category=${encodeURIComponent(category)}`
        : '/api/news/published';

      const data = await apiFetch<{ items: any[]; total: number }>(endpoint);
      return data;
    } catch (error) {
      console.error('[stockAPI] getPublishedNews error:', error);
      return { items: [], total: 0 };
    }
  },

  // IPO endpoints
  async getStockOffers(status?: string, type?: string): Promise<any[]> {
    try {
      let endpoint = '/api/market/offers';
      const params = [];
      if (status) params.push(`status=${encodeURIComponent(status)}`);
      if (type) params.push(`type=${encodeURIComponent(type)}`);
      if (params.length > 0) endpoint += `?${params.join('&')}`;

      const data = await apiFetch<any[]>(endpoint);
      return data;
    } catch (error) {
      console.error('[stockAPI] getStockOffers error:', error);
      return [];
    }
  },

  // ETF endpoints
  async getETFs(filters?: { category?: string; minAUM?: string; maxExpenseRatio?: string; minYield?: string; limit?: number }): Promise<any[]> {
    try {
      let endpoint = '/api/stocks/etfs';
      const params = [];
      if (filters?.category) params.push(`category=${encodeURIComponent(filters.category)}`);
      if (filters?.minAUM) params.push(`minAUM=${encodeURIComponent(filters.minAUM)}`);
      if (filters?.maxExpenseRatio) params.push(`maxExpenseRatio=${encodeURIComponent(filters.maxExpenseRatio)}`);
      if (filters?.minYield) params.push(`minYield=${encodeURIComponent(filters.minYield)}`);
      if (filters?.limit) params.push(`limit=${filters.limit}`);
      if (params.length > 0) endpoint += `?${params.join('&')}`;

      const data = await apiFetch<any[]>(endpoint);
      return data;
    } catch (error) {
      console.error('[stockAPI] getETFs error:', error);
      return [];
    }
  },

  // Stock comparison methods
  async compareStocks(symbol1: string, symbol2: string, period: string = '1mo'): Promise<APIResponse<{ stock1: Stock; stock2: Stock; data1: HistoricalData[]; data2: HistoricalData[] }>> {
    try {
      const [stock1Response, stock2Response, data1Response, data2Response] = await Promise.all([
        this.getStockQuote(symbol1),
        this.getStockQuote(symbol2),
        this.getHistoricalData(symbol1, period),
        this.getHistoricalData(symbol2, period),
      ]);

      return {
        data: {
          stock1: stock1Response.data,
          stock2: stock2Response.data,
          data1: data1Response.data,
          data2: data2Response.data,
        },
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[stockAPI] compareStocks error:', error);
      throw error;
    }
  },
};

export default stockAPI;
