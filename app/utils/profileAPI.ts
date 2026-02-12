'use client';

/**
 * Profile API Service
 * Fetches profile stats and handles profile updates.
 * Uses authenticatedFetch; all routes require JWT.
 */

import { authenticatedFetch } from './auth';

const RAW = process.env.NEXT_PUBLIC_API_URL || 'https://apipearto.ashlya.com/api';
const API_BASE = RAW.replace(/\/$/, '');

export interface ProfileStats {
  watchlistCount: number;
  alertsCount: number;
  netWorth: number;
  netWorthChange: number;
  netWorthChangePercent: number;
  portfolioCount: number;
}

// Interface for profile updates
export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
}

/**
 * Fetches aggregated stats for the user profile dashboard
 */
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

/**
 * Updates the current user's profile information
 */
export async function updateProfile(data: UpdateProfileData): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const response = await authenticatedFetch<{ success: boolean; user?: any; error?: string }>(
      `${API_BASE}/user/profile`, 
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch (e) {
    console.error('[profileAPI] updateProfile error:', e);
    return { success: false, error: 'Failed to update profile' };
  }
}

export default { fetchProfileStats, updateProfile };