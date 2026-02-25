'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchSubscription,
  trackUsage as apiTrackUsage,
  type SubscriptionStatus,
  type UsageInfo,
} from '@/app/utils/subscriptionAPI';

interface SubscriptionState {
  planName: string;
  planId: number;
  status: string;
  expiresAt: string | null;
  features: Record<string, boolean>;
  usage: Record<string, UsageInfo>;
  isLoading: boolean;
  isPro: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  hasFeature: (key: string) => boolean;
  checkLimit: (key: string) => boolean;
  getRemaining: (key: string) => number;
  trackUsage: (key: string) => Promise<{ allowed: boolean; remaining: number }>;
  refreshSubscription: () => Promise<void>;
}

const DEFAULT_STATE: SubscriptionState = {
  planName: 'Free',
  planId: 0,
  status: 'active',
  expiresAt: null,
  features: {},
  usage: {},
  isLoading: true,
  isPro: false,
};

const FREE_LIMITS: Record<string, number> = {
  ai_queries_limit: 5,
  advanced_charts_limit: 3,
  download_reports_limit: 3,
  alerts_limit: 3,
  chart_templates_limit: 1,
  comparison_limit: 5,
  saved_screeners_limit: 1,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<SubscriptionState>(DEFAULT_STATE);

  const refreshSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setState({ ...DEFAULT_STATE, isLoading: false });
      return;
    }

    try {
      const data = await fetchSubscription();
      setState({
        planName: data.plan_name || 'Free',
        planId: data.plan_id || 0,
        status: data.status || 'active',
        expiresAt: data.expires_at,
        features: data.features || {},
        usage: data.usage || {},
        isLoading: false,
        isPro: data.plan_name !== 'Free' && data.status === 'active',
      });
    } catch (error) {
      console.error('[SubscriptionContext] Failed to fetch:', error);
      setState({ ...DEFAULT_STATE, isLoading: false });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription, user?.id]);

  const hasFeature = useCallback(
    (key: string): boolean => {
      if (state.isPro) return true;
      return state.features[key] === true;
    },
    [state.features, state.isPro]
  );

  const checkLimit = useCallback(
    (key: string): boolean => {
      if (state.isPro) return true;
      const u = state.usage[key];
      if (!u) return true;
      if (u.limit === -1) return true;
      return u.remaining > 0;
    },
    [state.usage, state.isPro]
  );

  const getRemaining = useCallback(
    (key: string): number => {
      if (state.isPro) return -1;
      const u = state.usage[key];
      if (!u) return -1;
      return u.remaining;
    },
    [state.usage, state.isPro]
  );

  const trackUsage = useCallback(
    async (key: string): Promise<{ allowed: boolean; remaining: number }> => {
      if (state.isPro) return { allowed: true, remaining: -1 };

      if (!isAuthenticated) {
        const today = new Date().toISOString().split('T')[0];
        const storageKey = `usage_${key}_${today}`;
        const used = parseInt(localStorage.getItem(storageKey) || '0', 10);
        const limit = FREE_LIMITS[key] ?? 3;
        const remaining = limit - used;

        if (remaining > 0) {
          localStorage.setItem(storageKey, String(used + 1));
          return { allowed: true, remaining: remaining - 1 };
        }
        return { allowed: false, remaining: 0 };
      }

      try {
        const result = await apiTrackUsage(key);

        setState((prev) => ({
          ...prev,
          usage: {
            ...prev.usage,
            [key]: {
              ...prev.usage[key],
              used: result.used,
              remaining: result.remaining,
              limit: result.limit,
              period: result.period,
            },
          },
        }));

        return { allowed: result.allowed, remaining: result.remaining };
      } catch (error) {
        console.error('[SubscriptionContext] trackUsage failed:', error);
        return { allowed: false, remaining: 0 };
      }
    },
    [state.isPro, isAuthenticated]
  );

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        hasFeature,
        checkLimit,
        getRemaining,
        trackUsage,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}

export function useFeature(key: string) {
  const { hasFeature, isLoading } = useSubscription();
  return { hasFeature: hasFeature(key), isLoading };
}

export function useUsageLimit(key: string) {
  const { checkLimit, getRemaining, trackUsage, isLoading } = useSubscription();
  return {
    canUse: checkLimit(key),
    remaining: getRemaining(key),
    trackUsage: () => trackUsage(key),
    isLoading,
  };
}
