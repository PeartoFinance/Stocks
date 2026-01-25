'use client';

import { authenticatedFetch } from './auth';

const RAW = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
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
