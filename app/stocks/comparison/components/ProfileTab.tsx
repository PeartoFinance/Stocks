'use client';

import { ComparisonStock } from './types';
import { Activity, Building2, Globe, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface ProfileTabProps {
  comparedStocks: ComparisonStock[];
  formatLargeNumber: (num: number | undefined | null) => string;
}

export default function ProfileTab({ comparedStocks, formatLargeNumber }: ProfileTabProps) {
  if (comparedStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No stocks selected</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400">Add stocks to see profiles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {comparedStocks.map((stock) => {
        const isPositive = stock.changePercent >= 0;
        return (
          <div key={stock.symbol} className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${stock.color}20` }}>
                  <span className="text-xl font-medium" style={{ color: stock.color }}>{stock.symbol.charAt(0)}</span>
                </div>
                <div>
                  <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="text-xl font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-emerald-500">
                    {stock.symbol}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{stock.name}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPositive
                  ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
              }`}>
                {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </div>
            </div>

            {/* Price Info */}
            <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-medium text-gray-900 dark:text-white">${stock.price.toFixed(2)}</span>
                <span className={`text-lg font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isPositive ? '+' : ''}{stock.change?.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Current Price</p>
            </div>

            {/* Company Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-slate-400 dark:text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">Sector & Industry</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{stock.sector || 'N/A'}</p>
                  <p className="text-xs text-gray-600 dark:text-slate-400">{stock.industry || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-slate-400 dark:text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">Exchange</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{stock.exchange || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Key Metrics
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">Market Cap</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatLargeNumber(stock.marketCap)}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">P/E Ratio</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{stock.peRatio?.toFixed(2) || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">EPS</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">${stock.eps?.toFixed(2) || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">Beta</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{stock.beta?.toFixed(2) || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">Volume</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatLargeNumber(stock.volume)}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">Div Yield</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{stock.dividendYield?.toFixed(2) || 'N/A'}%</p>
                </div>
              </div>

              {/* 52 Week Range */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">52 Week Range</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">${stock.week52Low?.toFixed(2) || 'N/A'}</span>
                  <div className="flex-1 mx-3 h-2 bg-gray-200 dark:bg-[#262626] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                      style={{
                        width: stock.week52Low && stock.week52High
                          ? `${((stock.price - stock.week52Low) / (stock.week52High - stock.week52Low)) * 100}%`
                          : '50%'
                      }}
                    />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">${stock.week52High?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
