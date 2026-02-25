# Subscription System — stocks.pearto.com Implementation Guide

Complete reference for integrating the Pearto subscription system into the Stocks app (`stocks.pearto.com`).

---

## Architecture Overview

```
┌──────────────────────┐     ┌──────────────────────────┐     ┌─────────────────────┐
│  stocks.pearto.com   │     │   apipearto.ashlya.com   │     │   pearto.com        │
│  (Stocks Next.js)    │────▶│   (Flask Backend)        │◀────│   (Main Frontend)   │
│                      │     │                          │     │                     │
│  • Read sub status   │     │  /api/subscription/*     │     │  • Pricing page     │
│  • Feature gating    │     │  /api/user/subscription  │     │  • Checkout flow    │
│  • Usage tracking    │     │  /api/user/usage/*       │     │  • Payment capture  │
│  • Upgrade CTAs      │     │                          │     │  • Cancel flow      │
└──────────────────────┘     └──────────────────────────┘     └─────────────────────┘
```

**Key principle:** The Stocks app does NOT handle checkout/payment. It reads subscription state, enforces feature gates, tracks usage, and redirects to `pearto.com/pricing` for upgrades.

---

## 1. Backend API Endpoints

### 1.1 Subscription Plans (Public)

```
GET /api/subscription/plans
```

**Auth:** None

**Response:**
```json
[
  {
    "id": 1,
    "name": "Free",
    "description": "...",
    "price": 0.00,
    "currency": "USD",
    "interval": "monthly",
    "features": {
      "real_time_data": true,
      "portfolio_tracking": true,
      "advanced_charts": false,
      "ai_insights": false,
      "download_reports": false,
      "unlimited_alerts": false,
      "priority_support": false,
      "ai_queries_limit": 5,
      "advanced_charts_limit": 3,
      "download_reports_limit": 3,
      "alerts_limit": 3,
      "chart_templates_limit": 1,
      "comparison_limit": 5,
      "saved_screeners_limit": 1
    },
    "trial_enabled": false,
    "trial_days": 7
  },
  {
    "id": 2,
    "name": "Pro Plan",
    "price": 19.99,
    "interval": "monthly",
    "features": {
      "real_time_data": true,
      "portfolio_tracking": true,
      "advanced_charts": true,
      "ai_insights": true,
      "download_reports": true,
      "unlimited_alerts": true,
      "priority_support": false,
      "ai_queries_limit": -1,
      "advanced_charts_limit": -1,
      "download_reports_limit": -1,
      "alerts_limit": -1,
      "chart_templates_limit": -1,
      "comparison_limit": -1,
      "saved_screeners_limit": -1
    },
    "trial_enabled": true,
    "trial_days": 7,
    "is_featured": true
  }
]
```

### 1.2 User Subscription Status (Authenticated)

```
GET /api/user/subscription
```

**Auth:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "has_subscription": true,
  "plan_name": "Pro Plan",
  "plan_id": 2,
  "status": "active",
  "expires_at": "2026-03-25T00:00:00Z",
  "subscription": {
    "auto_renew": true,
    "payment_gateway": "stripe",
    "current_period_end": "2026-03-25T00:00:00Z"
  },
  "features": {
    "real_time_data": true,
    "portfolio_tracking": true,
    "advanced_charts": true,
    "ai_insights": true,
    "download_reports": true,
    "unlimited_alerts": true,
    "priority_support": false
  },
  "usage": {
    "ai_queries_limit": {
      "limit": -1,
      "used": 0,
      "remaining": -1,
      "period": "daily"
    },
    "advanced_charts_limit": {
      "limit": -1,
      "used": 0,
      "remaining": -1,
      "period": "daily"
    }
  }
}
```

**Free user response:**
```json
{
  "has_subscription": false,
  "plan_name": "Free",
  "plan_id": 1,
  "status": "active",
  "expires_at": null,
  "features": {
    "real_time_data": true,
    "portfolio_tracking": true,
    "advanced_charts": false,
    "ai_insights": false,
    "download_reports": false,
    "unlimited_alerts": false,
    "priority_support": false
  },
  "usage": {
    "ai_queries_limit": {
      "limit": 5,
      "used": 2,
      "remaining": 3,
      "period": "daily"
    }
  }
}
```

### 1.3 Track Feature Usage (Authenticated)

```
POST /api/user/usage/<feature_key>
```

**Auth:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "allowed": true,
  "remaining": 2,
  "used": 3,
  "limit": 5,
  "period": "daily"
}
```

**Response (429 — limit reached):**
```json
{
  "allowed": false,
  "remaining": 0,
  "used": 5,
  "limit": 5,
  "period": "daily",
  "error": "Usage limit reached"
}
```

---

## 2. Subscription Plans & Feature Matrix

### 2.1 Boolean Features

| Feature Key | Free | Pro Monthly | Pro Yearly |
|---|---|---|---|
| `real_time_data` | ✅ | ✅ | ✅ |
| `portfolio_tracking` | ✅ | ✅ | ✅ |
| `advanced_charts` | ❌ | ✅ | ✅ |
| `ai_insights` | ❌ | ✅ | ✅ |
| `download_reports` | ❌ | ✅ | ✅ |
| `unlimited_alerts` | ❌ | ✅ | ✅ |
| `priority_support` | ❌ | ❌ | ✅ |

### 2.2 Usage Limits (numeric, `-1` = unlimited)

| Limit Key | Free | Pro | Period |
|---|---|---|---|
| `ai_queries_limit` | 5 | ∞ | daily |
| `advanced_charts_limit` | 3 | ∞ | daily |
| `download_reports_limit` | 3 | ∞ | monthly |
| `alerts_limit` | 3 | ∞ | total |
| `chart_templates_limit` | 1 | ∞ | total |
| `comparison_limit` | 5 | ∞ | daily |
| `saved_screeners_limit` | 1 | ∞ | total |

---

## 3. Implementation — Service Layer

### File: `app/utils/subscriptionAPI.ts`

Replace the existing minimal implementation with the full service:

```typescript
'use client';

import { authenticatedFetch, getToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://apipearto.ashlya.com/api';

// ──────────────────────────────────────────
//  Types
// ──────────────────────────────────────────

export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: string;            // "monthly" | "yearly" | "lifetime"
  features: Record<string, boolean | number>;
  trial_enabled?: boolean;
  trial_days?: number;
  is_featured?: boolean;
}

export interface UsageInfo {
  limit: number;       // -1 = unlimited
  used: number;
  remaining: number;   // -1 = unlimited
  period: string;      // "daily" | "monthly" | "total"
}

export interface SubscriptionStatus {
  has_subscription: boolean;
  plan_name: string;
  plan_id: number;
  status: string;              // "active" | "cancelled" | "expired" | "trialing"
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

// ──────────────────────────────────────────
//  API Functions
// ──────────────────────────────────────────

/**
 * Fetch all active subscription plans (public, no auth).
 */
export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  const res = await fetch(`${API_BASE}/subscription/plans`);
  if (!res.ok) throw new Error('Failed to fetch plans');
  return res.json();
}

/**
 * Fetch current user's subscription status + features + usage.
 */
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

/**
 * Track usage of a metered feature.
 * Call BEFORE performing the action. If `allowed` is false, block the action.
 */
export async function trackUsage(featureKey: string): Promise<UsageTrackResult> {
  const data = await authenticatedFetch<UsageTrackResult>(
    `${API_BASE}/user/usage/${encodeURIComponent(featureKey)}`,
    { method: 'POST' }
  );
  return data;
}
```

---

## 4. Implementation — Context Provider

### File: `app/context/SubscriptionContext.tsx`

Replace the existing minimal context with the full-featured provider:

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchSubscription,
  trackUsage as apiTrackUsage,
  type SubscriptionStatus,
  type UsageInfo,
} from '@/app/utils/subscriptionAPI';

// ──────────────────────────────────────────
//  Types
// ──────────────────────────────────────────

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
  /** Check if a boolean feature is enabled for the user */
  hasFeature: (key: string) => boolean;
  /** Check if user has remaining quota for a metered feature */
  checkLimit: (key: string) => boolean;
  /** Get remaining uses (-1 = unlimited) */
  getRemaining: (key: string) => number;
  /** Increment usage counter. Returns { allowed, remaining }. */
  trackUsage: (key: string) => Promise<{ allowed: boolean; remaining: number }>;
  /** Re-fetch subscription data from backend */
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

// Free-tier limits (used for non-authenticated localStorage fallback)
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

// ──────────────────────────────────────────
//  Provider
// ──────────────────────────────────────────

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<SubscriptionState>(DEFAULT_STATE);

  // Fetch subscription from backend
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

  // Boolean feature check
  const hasFeature = useCallback(
    (key: string): boolean => {
      if (state.isPro) return true;
      return state.features[key] === true;
    },
    [state.features, state.isPro]
  );

  // Metered limit check (remaining > 0 or unlimited)
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

  // Get remaining count (-1 = unlimited)
  const getRemaining = useCallback(
    (key: string): number => {
      if (state.isPro) return -1;
      const u = state.usage[key];
      if (!u) return -1;
      return u.remaining;
    },
    [state.usage, state.isPro]
  );

  // Track usage (call before performing the action)
  const trackUsage = useCallback(
    async (key: string): Promise<{ allowed: boolean; remaining: number }> => {
      if (state.isPro) return { allowed: true, remaining: -1 };

      // Non-authenticated: localStorage fallback
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

      // Authenticated: call backend
      try {
        const result = await apiTrackUsage(key);

        // Update local state
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

// ──────────────────────────────────────────
//  Hooks
// ──────────────────────────────────────────

/** Full subscription context */
export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}

/** Check a single boolean feature */
export function useFeature(key: string) {
  const { hasFeature, isLoading } = useSubscription();
  return { hasFeature: hasFeature(key), isLoading };
}

/** Check a single metered limit */
export function useUsageLimit(key: string) {
  const { checkLimit, getRemaining, trackUsage, isLoading } = useSubscription();
  return {
    canUse: checkLimit(key),
    remaining: getRemaining(key),
    trackUsage: () => trackUsage(key),
    isLoading,
  };
}
```

---

## 5. Implementation — Feature Gating Components

### File: `app/components/subscription/FeatureGating.tsx`

Create these reusable components for gating content across the Stocks app:

```tsx
'use client';

import React from 'react';
import { useSubscription } from '@/app/context/SubscriptionContext';
import { Zap, Crown, AlertTriangle, X } from 'lucide-react';

const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://pearto.com';

// ──────────────────────────────────────────
//  Usage Limit Banner
//  Shows remaining usage with progress bar
// ──────────────────────────────────────────

interface UsageLimitBannerProps {
  featureKey: string;
  featureLabel?: string;
  className?: string;
  compact?: boolean;
}

export function UsageLimitBanner({
  featureKey,
  featureLabel,
  className = '',
  compact = false,
}: UsageLimitBannerProps) {
  const { usage, isPro, isLoading } = useSubscription();

  if (isLoading || isPro) return null;

  const info = usage[featureKey];
  if (!info || info.limit === -1) return null;

  const { limit, used, remaining, period } = info;
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const isLow = remaining <= 1 && remaining > 0;
  const isOut = remaining === 0;
  const periodLabel = period === 'daily' ? 'today' : period === 'monthly' ? 'this month' : 'total';
  const label = featureLabel || featureKey.replace(/_limit$/, '').replace(/_/g, ' ');

  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        {isOut ? (
          <AlertTriangle className="w-4 h-4 text-orange-500" />
        ) : (
          <Zap className="w-4 h-4 text-emerald-500" />
        )}
        <span className={isOut ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}>
          {`${remaining}/${limit} remaining`}
        </span>
        {isOut && (
          <a href={`${MAIN_APP_URL}/pricing`} className="text-emerald-500 hover:text-emerald-600 font-medium">
            Upgrade
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border p-3 ${
        isOut
          ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20'
          : isLow
          ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
          : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isOut ? <AlertTriangle className="w-4 h-4 text-orange-500" /> : <Zap className="w-4 h-4 text-emerald-500" />}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{label}</span>
        </div>
        <span
          className={`text-sm font-semibold ${
            isOut ? 'text-orange-600 dark:text-orange-400' : isLow ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {remaining}/{limit} {periodLabel}
        </span>
      </div>

      <div className="h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all ${isOut ? 'bg-orange-500' : isLow ? 'bg-yellow-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isOut && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-orange-600 dark:text-orange-400">Limit reached for {periodLabel}</span>
          <a
            href={`${MAIN_APP_URL}/pricing`}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
          >
            <Crown className="w-3 h-3" /> Upgrade to Pro
          </a>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
//  Feature Lock Overlay
//  Blurs content and shows upgrade CTA
// ──────────────────────────────────────────

interface FeatureLockProps {
  featureKey: string;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function FeatureLock({ featureKey, children, title, className = '' }: FeatureLockProps) {
  const { hasFeature, isPro, isLoading } = useSubscription();

  if (isLoading) return <div className={`opacity-50 ${className}`}>{children}</div>;
  if (isPro || hasFeature(featureKey)) return <>{children}</>;

  const label = title || featureKey.replace(/_/g, ' ');

  return (
    <div className={`relative ${className}`}>
      <div className="blur-sm pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40 dark:bg-slate-900/60 backdrop-blur-[2px] rounded-lg">
        <div className="text-center p-6 max-w-xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1 capitalize">{label}</h3>
          <p className="text-sm text-gray-300 mb-4">Upgrade to Pro to unlock this feature</p>
          <a
            href={`${MAIN_APP_URL}/pricing`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            <Crown className="w-4 h-4" /> Upgrade Now
          </a>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
//  Upgrade Modal
//  Shown when a 429 / limit-reached occurs
// ──────────────────────────────────────────

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureKey?: string;
  message?: string;
}

export function UpgradeModal({ isOpen, onClose, featureKey, message }: UpgradeModalProps) {
  if (!isOpen) return null;

  const label = featureKey?.replace(/_limit$/, '').replace(/_/g, ' ') || 'this feature';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Limit Reached</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message || `You've reached your limit for ${label}. Upgrade to Pro for unlimited access.`}
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`${MAIN_APP_URL}/pricing`}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" /> Upgrade to Pro
            </a>
            <button
              onClick={onClose}
              className="w-full py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Feature Key Constants

### File: `app/utils/featureKeys.ts`

```typescript
/**
 * Feature key constants — must match backend FeatureKeys / plan features JSON.
 */

// Boolean features (true/false in plan.features)
export const FEATURES = {
  REAL_TIME_DATA: 'real_time_data',
  PORTFOLIO_TRACKING: 'portfolio_tracking',
  ADVANCED_CHARTS: 'advanced_charts',
  AI_INSIGHTS: 'ai_insights',
  DOWNLOAD_REPORTS: 'download_reports',
  UNLIMITED_ALERTS: 'unlimited_alerts',
  PRIORITY_SUPPORT: 'priority_support',
} as const;

// Metered limits (numeric in plan.features, tracked via POST /user/usage/)
export const LIMITS = {
  AI_QUERIES: 'ai_queries_limit',
  ADVANCED_CHARTS: 'advanced_charts_limit',
  DOWNLOAD_REPORTS: 'download_reports_limit',
  ALERTS: 'alerts_limit',
  CHART_TEMPLATES: 'chart_templates_limit',
  COMPARISON: 'comparison_limit',
  SAVED_SCREENERS: 'saved_screeners_limit',
} as const;
```

---

## 7. Usage Examples

### 7.1 Gate a Pro-only component

```tsx
import { FeatureLock } from '@/app/components/subscription/FeatureGating';
import { FEATURES } from '@/app/utils/featureKeys';

export default function ScreenerPage() {
  return (
    <div>
      <h1>Stock Screener</h1>

      {/* Free users see blurred content + upgrade CTA */}
      <FeatureLock featureKey={FEATURES.ADVANCED_CHARTS} title="Advanced Screener">
        <AdvancedScreenerContent />
      </FeatureLock>
    </div>
  );
}
```

### 7.2 Show usage banner

```tsx
import { UsageLimitBanner } from '@/app/components/subscription/FeatureGating';
import { LIMITS } from '@/app/utils/featureKeys';

export default function AIPanel() {
  return (
    <div>
      <UsageLimitBanner featureKey={LIMITS.AI_QUERIES} featureLabel="AI queries" />
      {/* ... AI panel content ... */}
    </div>
  );
}
```

### 7.3 Track usage before an action

```tsx
import { useUsageLimit } from '@/app/context/SubscriptionContext';
import { UpgradeModal } from '@/app/components/subscription/FeatureGating';
import { LIMITS } from '@/app/utils/featureKeys';
import { useState } from 'react';

export function AIQueryButton() {
  const { canUse, remaining, trackUsage } = useUsageLimit(LIMITS.AI_QUERIES);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleClick = async () => {
    const result = await trackUsage();
    if (!result.allowed) {
      setShowUpgrade(true);
      return;
    }
    // Proceed with AI query...
  };

  return (
    <>
      <button onClick={handleClick} disabled={!canUse}>
        Ask AI {remaining !== -1 && `(${remaining} left)`}
      </button>
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey={LIMITS.AI_QUERIES}
      />
    </>
  );
}
```

### 7.4 Conditional rendering with hooks

```tsx
import { useFeature, useSubscription } from '@/app/context/SubscriptionContext';
import { FEATURES } from '@/app/utils/featureKeys';

export function StockHeader({ symbol }: { symbol: string }) {
  const { isPro, planName } = useSubscription();
  const { hasFeature } = useFeature(FEATURES.AI_INSIGHTS);

  return (
    <div>
      <h1>{symbol}</h1>
      {isPro && <span className="badge">PRO</span>}
      {hasFeature && <AIInsightsWidget symbol={symbol} />}
    </div>
  );
}
```

### 7.5 Export/download gating

```tsx
import { useSubscription } from '@/app/context/SubscriptionContext';
import { FEATURES, LIMITS } from '@/app/utils/featureKeys';

export function ExportButton() {
  const { hasFeature, trackUsage } = useSubscription();

  const handleExport = async () => {
    if (!hasFeature(FEATURES.DOWNLOAD_REPORTS)) {
      // Show upgrade prompt
      return;
    }

    const result = await trackUsage(LIMITS.DOWNLOAD_REPORTS);
    if (!result.allowed) {
      // Show limit modal
      return;
    }

    // Proceed with export...
  };

  return <button onClick={handleExport}>Export CSV</button>;
}
```

---

## 8. Provider Setup

Ensure the `SubscriptionProvider` wraps the app. In `app/layout.tsx`:

```tsx
import { SubscriptionProvider } from '@/app/context/SubscriptionContext';

// Inside the providers chain:
<AuthProvider>
  <SubscriptionProvider>
    <CountryProvider>
      {children}
    </CountryProvider>
  </SubscriptionProvider>
</AuthProvider>
```

The provider must be **inside** `AuthProvider` since it depends on `useAuth()` for the authentication token.

---

## 9. Where to Apply Feature Gates in Stocks App

| Page / Component | Feature Key | Gate Type |
|---|---|---|
| AI Analysis Panel (`components/ai/AIAnalysisPanel.tsx`) | `ai_insights` + `ai_queries_limit` | `FeatureLock` + `UsageLimitBanner` + `trackUsage` |
| Stock Comparison (`stocks/comparison/`) | `comparison_limit` | `trackUsage` before each comparison |
| Chart Templates save | `chart_templates_limit` | `trackUsage` before save |
| Screener (`screener/page.tsx`) | `advanced_charts` + `saved_screeners_limit` | `FeatureLock` on advanced filters |
| CSV/PDF Export buttons | `download_reports` + `download_reports_limit` | `hasFeature` check + `trackUsage` |
| Alerts creation (`profile/alerts/`) | `unlimited_alerts` + `alerts_limit` | `trackUsage` before creating alert |
| Advanced chart indicators | `advanced_charts` + `advanced_charts_limit` | `FeatureLock` on premium indicators |
| Pro page (`pro/page.tsx`) | — | Already redirects to pricing |

---

## 10. Environment Variables

```env
# Backend API
NEXT_PUBLIC_API_URL=https://apipearto.ashlya.com/api

# Main app (for pricing/checkout redirects)
NEXT_PUBLIC_MAIN_APP_URL=https://pearto.com
```

---

## 11. Known Issues & Notes

| Issue | Detail |
|---|---|
| **Backend response field mapping** | Backend returns `plan_name`, not `tier`. The updated `subscriptionAPI.ts` above uses the correct field names. |
| **Checkout lives on main app** | All payment flows (Stripe/PayPal) are handled by `pearto.com`. The Stocks app redirects to `NEXT_PUBLIC_MAIN_APP_URL/pricing` for upgrades. |
| **No webhook route** | Backend has no `/api/subscription/webhook` endpoint yet. Recurring payment renewals are not automatically captured. |
| **Backend feature decorators unused** | `@requires_feature` and `@subscription_active` decorators exist but are not applied to any route. All gating is client-side. |
| **localStorage fallback** | For non-authenticated users, usage is tracked in localStorage with daily keys. This is bypassable but acceptable for free-tier soft limits. |
| **Trial detection** | `status === 'trialing'` indicates a user is on a trial. The context treats trialing users as Pro (`plan_name !== 'Free'`). |
