'use client';

import { authenticatedFetch } from './auth';

const RAW = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';
const API_BASE = RAW.replace(/\/$/, '');

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  gain: number;
  gainPercent: number;
  // Market data properties
  change?: number;
  changePercent?: number;
  high52w?: number;
  low52w?: number;
  peRatio?: number;
  marketCap?: number;
  sector?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  holdings: Holding[];
}

export interface NetWorth {
  netWorth: number;
  netWorthChange: number;
  netWorthChangePercent: number;
  portfolioCount: number;
}

export interface PortfolioTransaction {
  id: string;
  symbol: string;
  type: 'buy' | 'sell' | 'dividend' | 'split';
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  fees: number;
  notes?: string;
  date: string;
  createdAt: string;
}

export interface HoldingDetail {
  holding: {
    id: string;
    symbol: string;
    shares: number;
    avgCost: number;
    currentPrice: number;
    totalValue: number;
    totalCost: number;
    totalGain: number;
    gainPercent: number;
    portfolioWeight: number;
    firstBuyDate?: string;
  };
  market: {
    name: string;
    sector?: string;
    industry?: string;
    dayChange: number;
    dayChangePercent: number;
    high52w?: number;
    low52w?: number;
    peRatio?: number;
    marketCap?: number;
  } | null;
  transactions: {
    id: string;
    type: string;
    shares: number;
    price: number;
    total: number;
    date: string;
  }[];
}

export interface WealthHistoryPoint {
  date: string;
  totalValue: number;
  totalCash: number;
  totalInvestments: number;
  dailyChange: number;
}

export interface PortfolioAnalytics {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  holdingsCount: number;
  allocation: {
    symbol: string;
    name: string;
    value: number;
    gain: number;
    gainPercent: number;
    shares: number;
    sector: string;
    weight: number;
  }[];
  sectorBreakdown: {
    sector: string;
    value: number;
    weight: number;
  }[];
  topPerformers: any[];
  worstPerformers: any[];
}

export async function getPortfolios(): Promise<Portfolio[]> {
  const data = await authenticatedFetch<Portfolio[]>(`${API_BASE}/portfolio/list`);
  return Array.isArray(data) ? data : [];
}

export async function getNetWorth(): Promise<NetWorth> {
  try {
    const data = await authenticatedFetch<NetWorth>(`${API_BASE}/user/net-worth`);
    return {
      netWorth: typeof data?.netWorth === 'number' ? data.netWorth : 0,
      netWorthChange: typeof data?.netWorthChange === 'number' ? data.netWorthChange : 0,
      netWorthChangePercent: typeof data?.netWorthChangePercent === 'number' ? data.netWorthChangePercent : 0,
      portfolioCount: typeof data?.portfolioCount === 'number' ? data.portfolioCount : 0,
    };
  } catch {
    return { netWorth: 0, netWorthChange: 0, netWorthChangePercent: 0, portfolioCount: 0 };
  }
}

export async function createPortfolio(name: string): Promise<Portfolio> {
  return authenticatedFetch<Portfolio>(`${API_BASE}/portfolio`, {
    method: 'POST',
    body: JSON.stringify({ name: name || 'My Portfolio' }),
  });
}

export async function addHolding(
  portfolioId: string,
  payload: { symbol: string; shares: number; avgBuyPrice: number }
): Promise<{ id: string; message: string; holding: Holding }> {
  return authenticatedFetch<{ id: string; message: string; holding: Holding }>(
    `${API_BASE}/portfolio/${portfolioId}/holdings`,
    {
      method: 'POST',
      body: JSON.stringify({
        symbol: payload.symbol.trim().toUpperCase(),
        shares: payload.shares,
        avgBuyPrice: payload.avgBuyPrice,
      }),
    }
  );
}

export async function deleteHolding(portfolioId: string, holdingId: string): Promise<{ message: string }> {
  return authenticatedFetch<{ message: string }>(
    `${API_BASE}/portfolio/${portfolioId}/holdings/${holdingId}`,
    { method: 'DELETE' }
  );
}

/**
 * Get portfolio transactions
 */
export async function getTransactions(
  portfolioId: string,
  options?: { symbol?: string; type?: string; limit?: number }
): Promise<PortfolioTransaction[]> {
  const params = new URLSearchParams();
  if (options?.symbol) params.set('symbol', options.symbol);
  if (options?.type) params.set('type', options.type);
  if (options?.limit) params.set('limit', String(options.limit));
  const query = params.toString() ? `?${params.toString()}` : '';
  return authenticatedFetch<PortfolioTransaction[]>(`${API_BASE}/portfolio/${portfolioId}/transactions${query}`);
}

/**
 * Add transaction to portfolio
 */
export async function addTransaction(
  portfolioId: string,
  data: {
    symbol: string;
    type: 'buy' | 'sell' | 'dividend' | 'split';
    shares: number;
    price: number;
    fees?: number;
    notes?: string;
    date?: string;
  }
): Promise<{ id: string; message: string; transaction: any }> {
  return authenticatedFetch<{ id: string; message: string; transaction: any }>(
    `${API_BASE}/portfolio/${portfolioId}/transactions`,
    { method: 'POST', body: JSON.stringify(data) }
  );
}

/**
 * Get holding detail with transactions
 */
export async function getHoldingDetail(portfolioId: string, holdingId: string): Promise<HoldingDetail> {
  return authenticatedFetch<HoldingDetail>(`${API_BASE}/portfolio/${portfolioId}/holdings/${holdingId}`);
}

/**
 * Get wealth history for net worth chart
 */
export async function getWealthHistory(days = 30): Promise<WealthHistoryPoint[]> {
  return authenticatedFetch<WealthHistoryPoint[]>(`${API_BASE}/portfolio/wealth-history?days=${days}`);
}

/**
 * Get portfolio analytics
 */
export async function getPortfolioAnalytics(portfolioId: string): Promise<PortfolioAnalytics> {
  return authenticatedFetch<PortfolioAnalytics>(`${API_BASE}/portfolio/${portfolioId}/analytics`);
}
