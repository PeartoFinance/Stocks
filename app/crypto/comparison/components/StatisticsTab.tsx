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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No cryptos to compare</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Add cryptocurrencies to see detailed statistics</p>
      </div>
    );
  }

  const metrics = getMetrics();

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.key;
          return (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-emerald-600 dark:to-emerald-700 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-emerald-500/50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4">
        {metrics.map((metric) => {
          const shouldHighlight = metric.format === 'currency' || metric.format === 'marketCap' || metric.format === 'percentage';
          const values = comparedCryptos.map(crypto => crypto[metric.key as keyof ComparisonCrypto]);
          const numValues = values.filter(v => v != null && v !== undefined && !isNaN(Number(v))).map(Number);
          const maxValue = numValues.length > 0 ? Math.max(...numValues) : 0;
          const minValue = numValues.length > 0 ? Math.min(...numValues) : 0;
          const MetricIcon = metric.icon;

          return (
            <div key={metric.key} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-emerald-500/5 transition-all">
              <div className="flex items-center gap-2 mb-4">
                {MetricIcon && <MetricIcon className="h-5 w-5 text-blue-600 dark:text-emerald-500" />}
                <h4 className="text-base font-bold text-gray-900 dark:text-white">{metric.label}</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {comparedCryptos.map((crypto) => {
                  const value = crypto[metric.key as keyof ComparisonCrypto];
                  const numValue = Number(value);
                  const isNegative = metric.format === 'percentage' && numValue < 0;
                  const isBest = shouldHighlight && numValue === maxValue && numValue > 0 && numValues.length > 1;
                  const isWorst = shouldHighlight && numValue === minValue && numValue > 0 && numValues.length > 1;

                  return (
                    <div
                      key={crypto.symbol}
                      className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        isBest
                          ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/5 border-green-500 dark:border-green-500/50 shadow-md'
                          : isWorst
                          ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/5 border-red-500 dark:border-red-500/50 shadow-md'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {isBest && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          Best
                        </div>
                      )}
                      {isWorst && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          Worst
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: crypto.color }} />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{crypto.symbol}</span>
                      </div>
                      <div className={`text-xl font-bold mb-1 ${
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
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{crypto.name}</p>
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
