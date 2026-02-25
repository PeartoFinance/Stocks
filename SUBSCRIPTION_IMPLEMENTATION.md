# Subscription Feature Implementation Checklist

## ✅ Already Implemented

### 1. AI Analysis Panel
**File:** `app/components/ai/AIAnalysisPanel.tsx`
- ✅ Added `UsageLimitBanner` for AI queries
- ✅ Added `trackUsage` before analysis
- ✅ Added `UpgradeModal` for limit reached

---

## 🔲 To Be Implemented

### 2. Stock Comparison
**Files to update:**
- `app/stocks/comparison/page.tsx` or comparison component
- `app/(full-screen)/comparedata/[name]/[symbol]/detailedchart/page.tsx`

**Implementation:**
```tsx
import { useUsageLimit } from '@/app/context/SubscriptionContext';
import { UpgradeModal } from '@/app/components/subscription/FeatureGating';
import { LIMITS } from '@/app/utils/featureKeys';

const { trackUsage } = useUsageLimit(LIMITS.COMPARISON);

// Before adding stock to comparison
const handleAddToComparison = async (symbol: string) => {
  const result = await trackUsage();
  if (!result.allowed) {
    setShowUpgradeModal(true);
    return;
  }
  // Proceed with comparison
};
```

---

### 3. Chart Templates Save
**Files to update:**
- Chart template save functionality

**Implementation:**
```tsx
import { useUsageLimit } from '@/app/context/SubscriptionContext';
import { LIMITS } from '@/app/utils/featureKeys';

const { trackUsage } = useUsageLimit(LIMITS.CHART_TEMPLATES);

const handleSaveTemplate = async () => {
  const result = await trackUsage();
  if (!result.allowed) {
    setShowUpgradeModal(true);
    return;
  }
  // Save template
};
```

---

### 4. Stock Screener
**Files to update:**
- `app/screener/page.tsx`
- Advanced filter components

**Implementation:**
```tsx
import { FeatureLock } from '@/app/components/subscription/FeatureGating';
import { useUsageLimit } from '@/app/context/SubscriptionContext';
import { FEATURES, LIMITS } from '@/app/utils/featureKeys';

// Lock advanced filters
<FeatureLock featureKey={FEATURES.ADVANCED_CHARTS} title="Advanced Filters">
  <AdvancedFiltersPanel />
</FeatureLock>

// Track saved screeners
const { trackUsage } = useUsageLimit(LIMITS.SAVED_SCREENERS);
const handleSaveScreener = async () => {
  const result = await trackUsage();
  if (!result.allowed) {
    setShowUpgradeModal(true);
    return;
  }
  // Save screener
};
```

---

### 5. CSV/PDF Export
**Files to update:**
- Any export button components
- Download functionality

**Implementation:**
```tsx
import { useSubscription } from '@/app/context/SubscriptionContext';
import { FEATURES, LIMITS } from '@/app/utils/featureKeys';

const { hasFeature, trackUsage } = useSubscription();

const handleExport = async () => {
  if (!hasFeature(FEATURES.DOWNLOAD_REPORTS)) {
    setShowUpgradeModal(true);
    return;
  }

  const result = await trackUsage(LIMITS.DOWNLOAD_REPORTS);
  if (!result.allowed) {
    setShowUpgradeModal(true);
    return;
  }
  
  // Proceed with export
};
```

---

### 6. Alerts Creation
**Files to update:**
- `app/profile/alerts/` or alert creation components

**Implementation:**
```tsx
import { useSubscription } from '@/app/context/SubscriptionContext';
import { FEATURES, LIMITS } from '@/app/utils/featureKeys';

const { hasFeature, trackUsage } = useSubscription();

const handleCreateAlert = async () => {
  if (!hasFeature(FEATURES.UNLIMITED_ALERTS)) {
    const result = await trackUsage(LIMITS.ALERTS);
    if (!result.allowed) {
      setShowUpgradeModal(true);
      return;
    }
  }
  
  // Create alert
};
```

---

### 7. Advanced Chart Indicators
**Files to update:**
- `app/(full-screen)/stockchart/[stockname]/detailedpage/page.tsx`
- `app/components/detailedChart/IndicatorsPanel.tsx`

**Implementation:**
```tsx
import { FeatureLock } from '@/app/components/subscription/FeatureGating';
import { useUsageLimit } from '@/app/context/SubscriptionContext';
import { FEATURES, LIMITS } from '@/app/utils/featureKeys';

// Lock premium indicators
<FeatureLock featureKey={FEATURES.ADVANCED_CHARTS} title="Premium Indicators">
  <PremiumIndicators />
</FeatureLock>

// Track usage when adding indicators
const { trackUsage } = useUsageLimit(LIMITS.ADVANCED_CHARTS);
const handleAddIndicator = async (indicator: string) => {
  const result = await trackUsage();
  if (!result.allowed) {
    setShowUpgradeModal(true);
    return;
  }
  // Add indicator
};
```

---

## Quick Reference

### Import Statements
```tsx
// Components
import { 
  UsageLimitBanner, 
  FeatureLock, 
  UpgradeModal 
} from '@/app/components/subscription/FeatureGating';

// Hooks
import { 
  useSubscription, 
  useFeature, 
  useUsageLimit 
} from '@/app/context/SubscriptionContext';

// Constants
import { FEATURES, LIMITS } from '@/app/utils/featureKeys';
```

### Common Patterns

**Pattern 1: Boolean Feature Gate**
```tsx
const { hasFeature } = useSubscription();

if (!hasFeature(FEATURES.ADVANCED_CHARTS)) {
  // Show upgrade prompt
  return;
}
```

**Pattern 2: Usage Limit Check**
```tsx
const { trackUsage } = useUsageLimit(LIMITS.AI_QUERIES);

const result = await trackUsage();
if (!result.allowed) {
  setShowUpgradeModal(true);
  return;
}
```

**Pattern 3: Visual Lock**
```tsx
<FeatureLock featureKey={FEATURES.ADVANCED_CHARTS}>
  <LockedContent />
</FeatureLock>
```

**Pattern 4: Usage Banner**
```tsx
<UsageLimitBanner 
  featureKey={LIMITS.AI_QUERIES} 
  featureLabel="AI queries" 
/>
```

---

## Priority Order

1. ✅ **AI Analysis Panel** - DONE
2. ✅ **Stock Screener** - DONE (technical filters locked)
3. ✅ **Chart Indicators** - DONE (usage tracking)
4. ✅ **Stock Comparison** - DONE (usage tracking)
5. ✅ **Alerts** - DONE (usage tracking)
6. 🔲 **Export Buttons** - Pending
7. 🔲 **Chart Templates** - Pending

---

## Testing Checklist

- [ ] Free user sees usage limits
- [ ] Free user gets blocked at limit
- [ ] Upgrade modal appears correctly
- [ ] Pro user has unlimited access
- [ ] Usage counters update correctly
- [ ] localStorage fallback works for non-authenticated users
- [ ] Redirect to pricing page works
