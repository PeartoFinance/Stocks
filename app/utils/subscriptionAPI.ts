'use client';

import { authenticatedFetch } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://apipearto.ashlya.com/api';

export interface SubscriptionData {
  tier: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  autoRenew: boolean;
}

/**
 * Fetches the current user's subscription information
 */
export async function fetchSubscription(): Promise<SubscriptionData> {
  try {
    const data = await authenticatedFetch<SubscriptionData>(`${API_BASE}/user/subscription`);
    return data;
  } catch (error) {
    console.error('[subscriptionAPI] fetchSubscription error:', error);
    // Return default free tier on error
    return {
      tier: 'free',
      status: 'active',
      startDate: null,
      endDate: null,
      autoRenew: false,
    };
  }
}

export default { fetchSubscription };
