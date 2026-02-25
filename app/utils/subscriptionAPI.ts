'use client';

import { authenticatedFetch } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://apipearto.ashlya.com/api';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: string;
  features: Record<string, boolean | number>;
  trial_enabled?: boolean;
  trial_days?: number;
  is_featured?: boolean;
}

export interface UsageInfo {
  limit: number;
  used: number;
  remaining: number;
  period: string;
}

export interface SubscriptionStatus {
  has_subscription: boolean;
  plan_name: string;
  plan_id: number;
  status: string;
  expires_at: string | null;
  features: Record<string, boolean>;
  usage: Record<string, UsageInfo>;
  subscription?: {
    auto_renew: boolean;
    payment_gateway: string;
    current_period_end: string;
  };
}

export interface UsageTrackResult {
  allowed: boolean;
  remaining: number;
  used: number;
  limit: number;
  period: string;
}

export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  const res = await fetch(`${API_BASE}/subscription/plans`);
  if (!res.ok) throw new Error('Failed to fetch plans');
  return res.json();
}

export async function fetchSubscription(): Promise<SubscriptionStatus> {
  try {
    const data = await authenticatedFetch<SubscriptionStatus>(
      `${API_BASE}/user/subscription`
    );
    return data;
  } catch (error) {
    console.error('[subscriptionAPI] fetchSubscription error:', error);
    return {
      has_subscription: false,
      plan_name: 'Free',
      plan_id: 0,
      status: 'active',
      expires_at: null,
      features: {
        real_time_data: true,
        portfolio_tracking: true,
        advanced_charts: false,
        ai_insights: false,
        download_reports: false,
        unlimited_alerts: false,
        priority_support: false,
      },
      usage: {},
    };
  }
}

export async function trackUsage(featureKey: string): Promise<UsageTrackResult> {
  const data = await authenticatedFetch<UsageTrackResult>(
    `${API_BASE}/user/usage/${encodeURIComponent(featureKey)}`,
    { method: 'POST' }
  );
  return data;
}
