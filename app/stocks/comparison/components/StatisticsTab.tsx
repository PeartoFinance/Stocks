'use client';

import { ComparisonStock } from './types';
import { Activity, DollarSign, TrendingUp, BarChart3, Zap, TrendingDown, Percent } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import PriceDisplay from '../../../components/common/PriceDisplay';

interface StatisticsTabProps {
  comparedStocks: ComparisonStock[];
  formatLargeNumber: (num: number | undefined | null) => string;
}

export default function StatisticsTab({ comparedStocks, formatLargeNumber }: StatisticsTabProps) {
  const [activeCategory, setActiveCategory] = useState('overview');

  const categories = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'valuation', label: 'Valuation', icon: DollarSign },
    { key: 'profitability', label: 'Profitability', icon: TrendingUp },
    { key: 'financial', label: 'Financial', icon: BarChart3 },
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
          { key: 'volume', label: 'Volume', format: 'volume', icon: Activity },
          { key: 'avgVolume', label: 'Avg Volume', format: 'volume', icon: Activity },
          { key: 'sector', label: 'Sector', format: 'text', icon: null },
          { key: 'industry', label: 'Industry', format: 'text', icon: null }
        ];
      case 'valuation':
        return [
          { key: 'peRatio', label: 'P/E Ratio', format: 'number', icon: DollarSign },
          { key: 'forwardPe', label: 'Forward P/E', format: 'number', icon: DollarSign },
          { key: 'eps', label: 'EPS', format: 'currency', icon: DollarSign },
          { key: 'dividendYield', label: 'Dividend Yield', format: 'percentage', icon: Percent },
          { key: 'week52High', label: '52 Week High', format: 'currency', icon: TrendingUp },
          { key: 'week52Low', label: '52 Week Low', format: 'currency', icon: TrendingDown },
          { key: 'marketCap', label: 'Market Cap', format: 'marketCap', icon: BarChart3 }
        ];
      case 'profitability':
        return [
          { key: 'eps', label: 'Earnings Per Share', format: 'currency', icon: DollarSign },
          { key: 'peRatio', label: 'P/E Ratio', format: 'number', icon: DollarSign },
          { key: 'forwardPe', label: 'Forward P/E', format: 'number', icon: DollarSign },
          { key: 'dividendYield', label: 'Dividend Yield', format: 'percentage', icon: Percent },
          { key: 'beta', label: 'Beta (Volatility)', format: 'number', icon: Activity },
          { key: 'marketCap', label: 'Market Cap', format: 'marketCap', icon: BarChart3 }
        ];
      case 'financial':
        return [
          { key: 'marketCap', label: 'Market Capitalization', format: 'marketCap', icon: BarChart3 },
          { key: 'volume', label: 'Trading Volume', format: 'volume', icon: Activity },
          { key: 'avgVolume', label: 'Average Volume', format: 'volume', icon: Activity },
          { key: 'beta', label: 'Beta', format: 'number', icon: Activity },
          { key: 'week52High', label: '52W High', format: 'currency', icon: TrendingUp },
          { key: 'week52Low', label: '52W Low', format: 'currency', icon: TrendingDown },
          { key: 'exchange', label: 'Exchange', format: 'text', icon: null }
        ];
      case 'trading':
        return [
          { key: 'volume', label: 'Current Volume', format: 'volume', icon: Activity },
          { key: 'avgVolume', label: 'Average Volume', format: 'volume', icon: Activity },
          { key: 'week52High', label: '52 Week High', format: 'currency', icon: TrendingUp },
          { key: 'week52Low', label: '52 Week Low', format: 'currency', icon: TrendingDown },
          { key: 'beta', label: 'Beta (Risk)', format: 'number', icon: Activity },
          { key: 'price', label: 'Current Price', format: 'currency', icon: DollarSign },
          { key: 'changePercent', label: 'Daily Change', format: 'percentage', icon: Percent }
        ];
      default:
        return [];
    }
  };

  const formatValue = (value: any, format: string) => {
    if (value == null || value === undefined) return '-';

    switch (format) {
      case 'currency':
        return <PriceDisplay amount={Number(value)} />;
      case 'percentage':
        return `${Number(value).toFixed(2)}%`;
      case 'number':
        return Number(value).toFixed(2);
      case 'marketCap':
      case 'volume':
        return formatLargeNumber(Number(value));
      case 'text':
      default:
        return String(value);
    }
  };

  if (comparedStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No stocks to compare</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400">Add stocks to see detailed statistics</p>
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
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-emerald-600 dark:to-emerald-700 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-emerald-500/50'
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
          const values = comparedStocks.map(stock => stock[metric.key as keyof ComparisonStock]);
          const numValues = values.filter(v => v != null && v !== undefined && !isNaN(Number(v))).map(Number);
          const maxValue = numValues.length > 0 ? Math.max(...numValues) : 0;
          const minValue = numValues.length > 0 ? Math.min(...numValues) : 0;
          const MetricIcon = metric.icon;

          return (
            <div key={metric.key} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-emerald-500/5 transition-all">
              <div className="flex items-center gap-2 mb-4">
                {MetricIcon && <MetricIcon className="h-5 w-5 text-blue-600 dark:text-emerald-500" />}
                <h4 className="text-base font-medium text-gray-900 dark:text-white">{metric.label}</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {comparedStocks.map((stock) => {
                  const value = stock[metric.key as keyof ComparisonStock];
                  const numValue = Number(value);
                  const isNegative = metric.format === 'percentage' && numValue < 0;
                  const isBest = shouldHighlight && numValue === maxValue && numValue > 0 && numValues.length > 1;
                  const isWorst = shouldHighlight && numValue === minValue && numValue > 0 && numValues.length > 1;

                  return (
                    <div
                      key={stock.symbol}
                      className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        isBest
                          ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/5 border-green-500 dark:border-green-500/50 shadow-md'
                          : isWorst
                          ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/5 border-red-500 dark:border-red-500/50 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isBest && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-lg">
                          Best
                        </div>
                      )}
                      {isWorst && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-lg">
                          Worst
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: stock.color }} />
                        <Link
                          href={`/stock/${stock.symbol.toLowerCase()}`}
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-emerald-500 transition-colors"
                        >
                          {stock.symbol}
                        </Link>
                      </div>
                      <div className={`text-xl font-medium mb-1 ${
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
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{stock.name}</p>
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
