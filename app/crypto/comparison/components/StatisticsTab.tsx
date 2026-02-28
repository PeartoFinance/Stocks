'use client';

import { ComparisonCrypto } from './types';
import { Activity, DollarSign, TrendingUp, BarChart3, Zap, TrendingDown, Percent } from 'lucide-react';
import { useState } from 'react';

interface StatisticsTabProps {
  comparedCryptos: ComparisonCrypto[];
  formatLargeNumber: (num: number | undefined | null) => string;
}

export default function StatisticsTab({ comparedCryptos, formatLargeNumber }: StatisticsTabProps) {
  const [activeCategory, setActiveCategory] = useState('overview');

  const categories = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'market', label: 'Market', icon: DollarSign },
    { key: 'supply', label: 'Supply', icon: BarChart3 },
    { key: 'performance', label: 'Performance', icon: TrendingUp },
    { key: 'trading', label: 'Trading', icon: Zap }
  ];

  const getMetrics = () => {
    switch (activeCategory) {
      case 'overview':
        return [
          { key: 'price', label: 'Current Price', format: 'currency', icon: DollarSign },
          { key: 'change', label: 'Price Change', format: 'currency', icon: TrendingUp },
          { key: 'changePercent', label: 'Change %', format: 'percentage', icon: Percent },
          { key: 'marketCap', label: 'Market Cap', format: 'marketCap', icon: BarChart3 },
          { key: 'volume', label: '24h Volume', format: 'volume', icon: Activity },
          { key: 'rank', label: 'Market Rank', format: 'number', icon: null }
        ];
      case 'market':
        return [
          { key: 'marketCap', label: 'Market Capitalization', format: 'marketCap', icon: BarChart3 },
          { key: 'volume', label: '24h Trading Volume', format: 'volume', icon: Activity },
          { key: 'rank', label: 'Market Rank', format: 'number', icon: null },
          { key: 'high24h', label: '24h High', format: 'currency', icon: TrendingUp },
          { key: 'low24h', label: '24h Low', format: 'currency', icon: TrendingDown }
        ];
      case 'supply':
        return [
          { key: 'circulatingSupply', label: 'Circulating Supply', format: 'supply', icon: Activity },
          { key: 'totalSupply', label: 'Total Supply', format: 'supply', icon: BarChart3 },
          { key: 'maxSupply', label: 'Max Supply', format: 'supply', icon: DollarSign }
        ];
      case 'performance':
        return [
          { key: 'changePercent', label: '24h Change', format: 'percentage', icon: Percent },
          { key: 'ath', label: 'All-Time High', format: 'currency', icon: TrendingUp },
          { key: 'atl', label: 'All-Time Low', format: 'currency', icon: TrendingDown },
          { key: 'high24h', label: '24h High', format: 'currency', icon: TrendingUp },
          { key: 'low24h', label: '24h Low', format: 'currency', icon: TrendingDown }
        ];
      case 'trading':
        return [
          { key: 'volume', label: '24h Volume', format: 'volume', icon: Activity },
          { key: 'price', label: 'Current Price', format: 'currency', icon: DollarSign },
          { key: 'high24h', label: '24h High', format: 'currency', icon: TrendingUp },
          { key: 'low24h', label: '24h Low', format: 'currency', icon: TrendingDown },
          { key: 'changePercent', label: '24h Change', format: 'percentage', icon: Percent }
        ];
      default:
        return [];
    }
  };

  const formatValue = (value: any, format: string) => {
    if (value == null || value === undefined) return '-';

    switch (format) {
      case 'currency':
        return `$${Number(value).toFixed(2)}`;
      case 'percentage':
        return `${Number(value).toFixed(2)}%`;
      case 'number':
        return Number(value).toLocaleString();
      case 'marketCap':
      case 'volume':
        return formatLargeNumber(Number(value));
      case 'supply':
        const num = Number(value);
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toLocaleString();
      default:
        return String(value);
    }
  };

  if (comparedCryptos.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No cryptos to compare</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Add cryptocurrencies to see detailed statistics</p>
      </div>
    );
  }

  const metrics = getMetrics();

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.key;
          return (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-emerald-600 dark:to-emerald-700 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-900/95 text-gray-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-emerald-500/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-3">
        {metrics.map((metric) => {
          const shouldHighlight = metric.format === 'currency' || metric.format === 'marketCap' || metric.format === 'percentage';
          const values = comparedCryptos.map(crypto => crypto[metric.key as keyof ComparisonCrypto]);
          const numValues = values.filter(v => v != null && v !== undefined && !isNaN(Number(v))).map(Number);
          const maxValue = numValues.length > 0 ? Math.max(...numValues) : 0;
          const minValue = numValues.length > 0 ? Math.min(...numValues) : 0;
          const MetricIcon = metric.icon;

          return (
            <div key={metric.key} className="bg-white dark:bg-slate-900/95 rounded-xl p-3 md:p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-emerald-500/5 transition-all">
              <div className="flex items-center gap-1.5 mb-3">
                {MetricIcon && <MetricIcon className="h-4 w-4 text-blue-600 dark:text-emerald-500" />}
                <h4 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white">{metric.label}</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {comparedCryptos.map((crypto) => {
                  const value = crypto[metric.key as keyof ComparisonCrypto];
                  const numValue = value != null && !isNaN(Number(value)) ? Number(value) : null;
                  const isNegative = metric.format === 'percentage' && numValue !== null && numValue < 0;
                  const isBest = shouldHighlight && numValue !== null && numValue === maxValue && maxValue > 0 && numValues.length > 1;
                  const isWorst = shouldHighlight && numValue !== null && numValue === minValue && minValue > 0 && numValues.length > 1 && maxValue !== minValue;

                  return (
                    <div
                      key={crypto.symbol}
                      className={`relative p-2.5 md:p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        isBest
                          ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/5 border-green-500 dark:border-green-500/50 shadow-md'
                          : isWorst
                          ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/5 border-red-500 dark:border-red-500/50 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isBest && (
                        <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-lg">
                          Best
                        </div>
                      )}
                      {isWorst && (
                        <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-lg">
                          Worst
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: crypto.color }} />
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{crypto.symbol}</span>
                      </div>
                      <div className={`text-sm md:text-base font-semibold mb-0.5 ${
                        metric.key === 'changePercent' || metric.key === 'change'
                          ? isNegative
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                          : isBest
                          ? 'text-green-600 dark:text-green-400'
                          : isWorst
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {formatValue(value, metric.format)}
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 truncate">{crypto.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
