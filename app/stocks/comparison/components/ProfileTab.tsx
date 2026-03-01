'use client';

import { ComparisonStock } from './types';
import { Activity, Building2, Globe, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import PriceDisplay from '../../../components/common/PriceDisplay';

interface ProfileTabProps {
  comparedStocks: ComparisonStock[];
  formatLargeNumber: (num: number | undefined | null) => string;
}

export default function ProfileTab({ comparedStocks, formatLargeNumber }: ProfileTabProps) {
  if (comparedStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No stocks selected</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Add stocks to see profiles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {comparedStocks.map((stock) => {
        const isPositive = (stock.changePercent ?? 0) >= 0;
        return (
          <div key={stock.symbol} className="bg-white dark:bg-slate-900/95 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${stock.color}20` }}>
                  <span className="text-lg font-medium" style={{ color: stock.color }}>{stock.symbol.charAt(0)}</span>
                </div>
                <div>
                  <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-emerald-500">
                    {stock.symbol}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stock.name}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                isPositive
                  ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
              }`}>
                {isPositive ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
              </div>
            </div>

            {/* Price Info */}
            <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white"><PriceDisplay amount={stock.price ?? 0} /></span>
                <span className={`text-base font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  <PriceDisplay amount={stock.change ?? 0} showSign />
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current Price</p>
            </div>

            {/* Company Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-slate-400 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Sector</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{stock.sector || 'N/A'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{stock.industry || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-slate-400 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Exchange</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{stock.exchange || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Key Metrics
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Market Cap</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{formatLargeNumber(stock.marketCap)}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">P/E Ratio</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{stock.peRatio?.toFixed(2) || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">EPS</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white"><PriceDisplay amount={stock.eps ?? 0} /></p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Beta</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{stock.beta?.toFixed(2) || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Volume</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{formatLargeNumber(stock.volume)}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Div Yield</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{stock.dividendYield?.toFixed(2) || 'N/A'}%</p>
                </div>
              </div>

              {/* 52 Week Range */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">52 Week Range</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white"><PriceDisplay amount={stock.week52Low ?? 0} /></span>
                  <div className="flex-1 mx-2 h-1.5 bg-gray-200 dark:bg-[#262626] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                      style={{
                        width: stock.week52Low && stock.week52High && stock.week52High > stock.week52Low
                          ? `${((stock.price - stock.week52Low) / (stock.week52High - stock.week52Low)) * 100}%`
                          : '50%'
                      }}
                    />
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white"><PriceDisplay amount={stock.week52High ?? 0} /></span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
