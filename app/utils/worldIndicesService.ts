/**
 * World Indices Service
 * Fetches global market indices data
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.pearto.com/api';

// Helper to make API requests
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Country': 'US',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export interface WorldIndex {
  symbol: string;
  name: string;
  price: number;
  value?: number; // Backend returns 'value' field
  change: number;
  changePercent: number;
  region: 'americas' | 'europe' | 'asia-pacific';
  country?: string;
  countryCode?: string; // Backend returns countryCode field
}

export interface AssetData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'commodity' | 'currency' | 'bond';
  unit?: string;
}

export interface SectorData {
  sector: string;
  advancers: number;
  decliners: number;
  unchanged: number;
  stockCount: number;
  turnover: number;
  turnoverPercent: number;
  volume: number;
  volumePercent: number;
  avgChangePercent: number;
  avgYtdReturn: number;
  weight: number;
}

export interface BackendSectorData {
  sector: string;
  advancers: number;
  avgChangePercent: number;
  avgYtdReturn: number;
  decliners: number;
  stockCount: number;
  turnover: number;
  turnoverPercent: number;
  unchanged: number;
  volume: number;
  volumePercent: number;
  weight: number;
}

export interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap: number;
  volume?: number;
}

export interface ETFData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  expenseRatio?: number;
  type: 'etf' | 'mutual_fund';
}

export interface PrivateCompany {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  lastFunding?: number;
  valuation?: number;
}

export const worldIndicesService = {
  // World Indices
  async getWorldIndices(): Promise<{ americas: WorldIndex[]; europe: WorldIndex[]; asiaPacific: WorldIndex[] }> {
    try {
      const response = await apiRequest<WorldIndex[]>('/market/indices');
      console.log('Raw indices from backend:', response);

      // Group indices by country code
      const americas = response.filter(idx => idx.countryCode === 'US' ||
        ['SPY', 'DIA', 'IXIC', 'QQQ', 'IWM'].includes(idx.symbol));
      const europe = response.filter(idx => idx.countryCode === 'DE' || idx.countryCode === 'GB' || idx.countryCode === 'FR' ||
        ['DAX', 'FTSE', 'CAC', 'STOXX', 'SMI'].includes(idx.symbol));
      const asiaPacific = response.filter(idx => idx.countryCode === 'JP' || idx.countryCode === 'HK' || idx.countryCode === 'AU' ||
        ['Nikkei', 'HSI', 'ASX', 'N225', 'NKY'].includes(idx.symbol));

      console.log('Filtered results:', { americas: americas.length, europe: europe.length, asiaPacific: asiaPacific.length });

      return { americas, europe, asiaPacific };
    } catch (error) {
      console.error('Error fetching world indices:', error);
      throw error;
    }
  },

  // Assets (Commodities, Currencies, Bonds)
  async getAssets(): Promise<{ commodities: AssetData[]; currencies: AssetData[]; bonds: AssetData[] }> {
    try {
      // Mock data - replace with actual API call
      const mockCommodities: AssetData[] = [
        { symbol: 'GC=F', name: 'Gold', price: 2034.50, change: 12.30, changePercent: 0.61, type: 'commodity', unit: 'USD/oz' },
        { symbol: 'CL=F', name: 'Crude Oil', price: 78.45, change: -1.23, changePercent: -1.55, type: 'commodity', unit: 'USD/bbl' },
        { symbol: 'SI=F', name: 'Silver', price: 23.45, change: 0.23, changePercent: 0.99, type: 'commodity', unit: 'USD/oz' },
        { symbol: 'NG=F', name: 'Natural Gas', price: 2.45, change: -0.12, changePercent: -4.67, type: 'commodity', unit: 'USD/MMBtu' },
      ];

      const mockCurrencies: AssetData[] = [
        { symbol: 'EURUSD=X', name: 'EUR/USD', price: 1.0876, change: 0.0023, changePercent: 0.21, type: 'currency' },
        { symbol: 'GBPUSD=X', name: 'GBP/USD', price: 1.2745, change: -0.0034, changePercent: -0.27, type: 'currency' },
        { symbol: 'USDJPY=X', name: 'USD/JPY', price: 148.23, change: 0.45, changePercent: 0.30, type: 'currency' },
        { symbol: 'AUDUSD=X', name: 'AUD/USD', price: 0.6543, change: 0.0012, changePercent: 0.18, type: 'currency' },
      ];

      const mockBonds: AssetData[] = [
        { symbol: '^TNX', name: '10-Year Treasury', price: 4.23, change: 0.05, changePercent: 1.19, type: 'bond', unit: 'Yield %' },
        { symbol: '^FVX', name: '5-Year Treasury', price: 4.12, change: 0.03, changePercent: 0.73, type: 'bond', unit: 'Yield %' },
        { symbol: '^TYX', name: '30-Year Treasury', price: 4.45, change: 0.07, changePercent: 1.60, type: 'bond', unit: 'Yield %' },
        { symbol: '^IRX', name: '13-Week Treasury', price: 5.23, change: 0.12, changePercent: 2.35, type: 'bond', unit: 'Yield %' },
      ];

      return { commodities: mockCommodities, currencies: mockCurrencies, bonds: mockBonds };
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  },

  // Sectors data
  async getSectors(): Promise<SectorData[]> {
    try {
      const response = await apiRequest<{ sectors: BackendSectorData[] }>('/market/sector-analysis');

      // Transform API response to match expected interface
      return response.sectors.map(sector => ({
        sector: sector.sector,
        advancers: sector.advancers,
        decliners: sector.decliners,
        unchanged: sector.unchanged,
        stockCount: sector.stockCount,
        turnover: sector.turnover,
        turnoverPercent: sector.turnoverPercent,
        volume: sector.volume,
        volumePercent: sector.volumePercent,
        avgChangePercent: sector.avgChangePercent,
        avgYtdReturn: sector.avgYtdReturn,
        weight: sector.weight
      }));
    } catch (error) {
      console.error('Error fetching sectors:', error);
      throw error;
    }
  },

  // Cryptocurrencies
  async getCryptocurrencies(): Promise<CryptoData[]> {
    try {
      // Use existing crypto service if available
      const cryptoModule = await import('./cryptoService');
      const cryptoService = cryptoModule.cryptoService || cryptoModule.default;
      const cryptoData = await cryptoService.getMarkets({ limit: 10 }) as any[];

      return cryptoData.map((crypto: any) => ({
        symbol: crypto.symbol || crypto.id,
        name: crypto.name || crypto.name,
        price: crypto.price || crypto.current_price || 0,
        changePercent: crypto.changePercent || crypto.percent_change_24h || 0,
        marketCap: crypto.marketCap || crypto.market_cap || 0,
        volume: crypto.volume || crypto.total_volume || 0,
      }));
    } catch (error) {
      console.error('Error fetching cryptocurrencies:', error);
      // Fallback mock data
      return [
        { symbol: 'BTC', name: 'Bitcoin', price: 43234.56, changePercent: 2.3, marketCap: 845000000000 },
        { symbol: 'ETH', name: 'Ethereum', price: 2234.78, changePercent: 1.8, marketCap: 268000000000 },
        { symbol: 'BNB', name: 'Binance Coin', price: 312.45, changePercent: -0.5, marketCap: 48000000000 },
        { symbol: 'SOL', name: 'Solana', price: 98.76, changePercent: 3.2, marketCap: 42000000000 },
        { symbol: 'XRP', name: 'Ripple', price: 0.6234, changePercent: 1.2, marketCap: 34000000000 },
      ];
    }
  },

  // ETFs and Mutual Funds
  async getETFs(): Promise<{ mostActive: ETFData[]; topGainers: ETFData[]; topLosers: ETFData[] }> {
    try {
      // Mock data - replace with actual API call
      const mockETFs: ETFData[] = [
        { symbol: 'SPY', name: 'SPDR S&P 500', price: 498.23, change: 2.34, changePercent: 0.47, volume: 45000000, expenseRatio: 0.09, type: 'etf' },
        { symbol: 'QQQ', name: 'Invesco QQQ', price: 423.45, change: 3.21, changePercent: 0.76, volume: 32000000, expenseRatio: 0.20, type: 'etf' },
        { symbol: 'VTI', name: 'Vanguard Total Stock', price: 234.56, change: 1.23, changePercent: 0.53, volume: 18000000, expenseRatio: 0.03, type: 'etf' },
        { symbol: 'ARKK', name: 'ARK Innovation', price: 45.67, change: -1.23, changePercent: -2.62, volume: 25000000, expenseRatio: 0.75, type: 'etf' },
      ];

      const mostActive = [...mockETFs].sort((a, b) => b.volume - a.volume).slice(0, 5);
      const topGainers = [...mockETFs].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
      const topLosers = [...mockETFs].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

      return { mostActive, topGainers, topLosers };
    } catch (error) {
      console.error('Error fetching ETFs:', error);
      throw error;
    }
  },

  // Mutual Funds
  async getMutualFunds(): Promise<{ mostActive: ETFData[]; topGainers: ETFData[]; topLosers: ETFData[] }> {
    try {
      // Mock data - replace with actual API call
      const mockFunds: ETFData[] = [
        { symbol: 'VFIAX', name: 'Vanguard 500 Index', price: 345.67, change: 1.45, changePercent: 0.42, volume: 1200000, expenseRatio: 0.14, type: 'mutual_fund' },
        { symbol: 'FXAIX', name: 'Fidelity 500 Index', price: 123.45, change: 0.89, changePercent: 0.72, volume: 980000, expenseRatio: 0.015, type: 'mutual_fund' },
        { symbol: 'SWPPX', name: 'Schwab S&P 500', price: 56.78, change: 0.34, changePercent: 0.60, volume: 760000, expenseRatio: 0.02, type: 'mutual_fund' },
      ];

      const mostActive = [...mockFunds].sort((a, b) => b.volume - a.volume).slice(0, 5);
      const topGainers = [...mockFunds].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
      const topLosers = [...mockFunds].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

      return { mostActive, topGainers, topLosers };
    } catch (error) {
      console.error('Error fetching mutual funds:', error);
      throw error;
    }
  },

  // Private Companies
  async getPrivateCompanies(): Promise<PrivateCompany[]> {
    try {
      const response = await apiRequest<{ data: PrivateCompany[] }>('/private-companies');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching private companies:', error);
      // Fallback mock data
      return [
        { symbol: 'SPACE', name: 'SpaceX', price: 210.00, changePercent: 15.6, lastFunding: 8700000000, valuation: 180000000000 },
        { symbol: 'STRIPE', name: 'Stripe', price: 45.23, changePercent: 8.9, lastFunding: 6500000000, valuation: 50000000000 },
        { symbol: 'DISCORD', name: 'Discord', price: 67.89, changePercent: -2.3, lastFunding: 1000000000, valuation: 15000000000 },
        { symbol: 'REDBULL', name: 'Reddit', price: 54.32, changePercent: 5.6, lastFunding: 410000000, valuation: 10000000000 },
      ];
    }
  },
};
