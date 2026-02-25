'use client';

import { useState } from 'react';
import { TrendingUp, X, Settings, Plus } from 'lucide-react';
import { useUsageLimit } from '@/app/context/SubscriptionContext';
import { UpgradeModal } from '@/app/components/subscription/FeatureGating';
import { LIMITS } from '@/app/utils/featureKeys';

interface Indicator {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  settings?: Record<string, any>;
}

interface IndicatorsPanelProps {
  onAddIndicator: (indicator: Indicator) => void;
  onRemoveIndicator: (id: string) => void;
  activeIndicators: Indicator[];
}

const AVAILABLE_INDICATORS = [
  { id: 'sma', name: 'SMA', description: 'Simple Moving Average', category: 'Trend' },
  { id: 'ema', name: 'EMA', description: 'Exponential Moving Average', category: 'Trend' },
  { id: 'rsi', name: 'RSI', description: 'Relative Strength Index', category: 'Momentum' },
  { id: 'macd', name: 'MACD', description: 'Moving Average Convergence Divergence', category: 'Momentum' },
  { id: 'bb', name: 'Bollinger Bands', description: 'Volatility Bands', category: 'Volatility' },
  { id: 'volume', name: 'Volume', description: 'Trading Volume', category: 'Volume' },
  { id: 'stoch', name: 'Stochastic', description: 'Stochastic Oscillator', category: 'Momentum' },
  { id: 'atr', name: 'ATR', description: 'Average True Range', category: 'Volatility' },
];

export default function IndicatorsPanel({ onAddIndicator, onRemoveIndicator, activeIndicators }: IndicatorsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { trackUsage } = useUsageLimit(LIMITS.ADVANCED_CHARTS);

  const categories = ['All', 'Trend', 'Momentum', 'Volatility', 'Volume'];

  const filteredIndicators = selectedCategory === 'All'
    ? AVAILABLE_INDICATORS
    : AVAILABLE_INDICATORS.filter(ind => ind.category === selectedCategory);

  const handleAddIndicator = async (indicator: typeof AVAILABLE_INDICATORS[0]) => {
    const result = await trackUsage();
    if (!result.allowed) {
      setShowUpgrade(true);
      return;
    }

    const newIndicator: Indicator = {
      id: `${indicator.id}-${Date.now()}`,
      name: indicator.name,
      type: indicator.id,
      enabled: true,
      settings: {},
    };
    onAddIndicator(newIndicator);
    setIsOpen(false);
  };

  return (
    <>
      {/* Indicator Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all text-sm font-medium"
      >
        <TrendingUp className="h-4 w-4" />
        <span className="hidden sm:inline">Indicators</span>
        {activeIndicators.length > 0 && (
          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
            {activeIndicators.length}
          </span>
        )}
      </button>

      {/* Active Indicators List */}
      {activeIndicators.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeIndicators.map((indicator) => (
            <div
              key={indicator.id}
              className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded text-xs font-medium border border-blue-200 dark:border-blue-500/30"
            >
              <span>{indicator.name}</span>
              <button
                onClick={() => onRemoveIndicator(indicator.id)}
                className="hover:bg-blue-200 dark:hover:bg-blue-500/20 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Indicators Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Indicators</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Category Filter */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Indicators List */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredIndicators.map((indicator) => {
                  const isActive = activeIndicators.some(ind => ind.type === indicator.id);
                  return (
                    <button
                      key={indicator.id}
                      onClick={() => !isActive && handleAddIndicator(indicator)}
                      disabled={isActive}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        isActive
                          ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{indicator.name}</h4>
                        {isActive ? (
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Active</span>
                        ) : (
                          <Plus className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{indicator.description}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 rounded">
                        {indicator.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureKey={LIMITS.ADVANCED_CHARTS}
      />
    </>
  );
}
