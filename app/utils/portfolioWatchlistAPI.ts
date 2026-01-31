'use client';

import { authenticatedFetch } from './auth';

const RAW = process.env.NEXT_PUBLIC_API_URL || 'https://api.pearto.com/api';
const API_BASE = RAW.replace(/\/$/, '');
const WATCHLIST = `${API_BASE}/portfolio/watchlist`;

export interface WatchlistItem {
  id: number;
  symbol: string;
  name: string | null;
  price: number;
  change: number;
  changePercent: number;
  addedAt: string | null;
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const data = await authenticatedFetch<WatchlistItem[]>(WATCHLIST);
  return Array.isArray(data) ? data : [];
}

export async function addToWatchlist(symbol: string): Promise<{ message: string; id?: string }> {
  return authenticatedFetch<{ message: string; id?: string }>(WATCHLIST, {
    method: 'POST',
    body: JSON.stringify({ symbol: symbol.trim().toUpperCase() }),
  });
}

export async function removeFromWatchlist(symbol: string): Promise<{ message: string }> {
  return authenticatedFetch<{ message: string }>(`${WATCHLIST}/${encodeURIComponent(symbol.trim().toUpperCase())}`, {
    method: 'DELETE',
  });
}
