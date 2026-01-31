'use client';

/**
 * Profile API Service
 * Fetches profile stats (watchlist count, alerts count, net worth) from backend.
 * Uses authenticatedFetch; all routes require JWT.
 */

import { authenticatedFetch } from './auth';

const RAW = process.env.NEXT_PUBLIC_API_URL || 'https://api.pearto.com/api';
const API_BASE = RAW.replace(/\/$/, '');

export interface ProfileStats {
  watchlistCount: number;
  alertsCount: number;
  netWorth: number;
  netWorthChange: number;
  netWorthChangePercent: number;
  portfolioCount: number;
}

export async function fetchProfileStats(): Promise<ProfileStats> {
  const defaults: ProfileStats = {
    watchlistCount: 0,
    alertsCount: 0,
    netWorth: 0,
    netWorthChange: 0,
    netWorthChangePercent: 0,
    portfolioCount: 0,
  };

  try {
    const [watchlistRes, alertsRes, netWorthRes] = await Promise.allSettled([
      authenticatedFetch<unknown[]>(`${API_BASE}/portfolio/watchlist`),
      authenticatedFetch<unknown[]>(`${API_BASE}/user/alerts`),
      authenticatedFetch<{ netWorth?: number; netWorthChange?: number; netWorthChangePercent?: number; portfolioCount?: number }>(
        `${API_BASE}/user/net-worth`
      ),
    ]);

    if (watchlistRes.status === 'fulfilled' && Array.isArray(watchlistRes.value)) {
      defaults.watchlistCount = watchlistRes.value.length;
    }
    if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value)) {
      defaults.alertsCount = alertsRes.value.length;
    }
    if (netWorthRes.status === 'fulfilled' && netWorthRes.value) {
      const n = netWorthRes.value;
      defaults.netWorth = typeof n.netWorth === 'number' ? n.netWorth : 0;
      defaults.netWorthChange = typeof n.netWorthChange === 'number' ? n.netWorthChange : 0;
      defaults.netWorthChangePercent = typeof n.netWorthChangePercent === 'number' ? n.netWorthChangePercent : 0;
      defaults.portfolioCount = typeof n.portfolioCount === 'number' ? n.portfolioCount : 0;
    }
  } catch (e) {
    console.error('[profileAPI] fetchProfileStats error:', e);
  }

  return defaults;
}

export default { fetchProfileStats };
