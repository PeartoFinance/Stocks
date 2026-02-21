'use client';

import { ComparisonCrypto } from './types';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

interface OverviewTabProps {
  comparedCryptos: ComparisonCrypto[];
  formatLargeNumber: (num: number | undefined | null) => string;
}

export default function OverviewTab({ comparedCryptos, formatLargeNumber }: OverviewTabProps) {
  if (comparedCryptos.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No cryptos selected</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400">Add cryptocurrencies to see the overview</p>
      </div>
    );
  }

  const bestPerformer = comparedCryptos.reduce((best, current) =>
    current.changePercent > best.changePercent ? current : best
  );

  const worstPerformer = comparedCryptos.reduce((worst, current) =>
    current.changePercent < worst.changePercent ? current : worst
  );

  const highestVolume = comparedCryptos.reduce((highest, current) =>
    (current.volume || 0) > (highest.volume || 0) ? current : highest
  );

  const largestCap = comparedCryptos.reduce((largest, current) =>
    (current.marketCap || 0) > (largest.marketCap || 0) ? current : largest
  );

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Performance Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/5 rounded-lg border border-green-200 dark:border-green-500/20">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase">Best</span>
            </div>
            <div className="text-base font-medium text-green-900 dark:text-white mb-1">{bestPerformer.symbol}</div>
            <div className="text-sm font-medium text-green-700 dark:text-green-400">+{bestPerformer.changePercent.toFixed(2)}%</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/5 rounded-lg border border-red-200 dark:border-red-500/20">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-500" />
              <span className="text-xs font-medium text-red-700 dark:text-red-400 uppercase">Worst</span>
            </div>
            <div className="text-base font-medium text-red-900 dark:text-white mb-1">{worstPerformer.symbol}</div>
            <div className="text-sm font-medium text-red-700 dark:text-red-400">{worstPerformer.changePercent.toFixed(2)}%</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 rounded-lg border border-blue-200 dark:border-blue-500/20">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-500" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase">Volume</span>
            </div>
            <div className="text-base font-medium text-blue-900 dark:text-white mb-1">{highestVolume.symbol}</div>
            <div className="text-sm font-medium text-blue-700 dark:text-blue-400">{formatLargeNumber(highestVolume.volume)}</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-500/5 rounded-lg border border-purple-200 dark:border-purple-500/20">
            <div className="flex items-center justify-center gap-1 mb-2">
              <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-500" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-400 uppercase">Cap</span>
            </div>
            <div className="text-base font-medium text-purple-900 dark:text-white mb-1">{largestCap.symbol}</div>
            <div className="text-sm font-medium text-purple-700 dark:text-purple-400">{formatLargeNumber(largestCap.marketCap)}</div>
          </div>
        </div>
      </div>

      {/* Crypto Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparedCryptos.map((crypto) => {
          const isPositive = crypto.changePercent >= 0;
          return (
            <div key={crypto.symbol} className={`bg-white dark:bg-slate-800 rounded-lg p-4 border-2 ${isPositive ? 'border-green-200 dark:border-green-500/30' : 'border-red-200 dark:border-red-500/30'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{crypto.symbol}</h4>
                  <p className="text-xs text-gray-600 dark:text-slate-400 truncate">{crypto.name}</p>
                </div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: crypto.color }} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Price</span>
                  <span className="text-lg font-medium text-gray-900 dark:text-white">${crypto.price.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded ${isPositive ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                  <span className="text-sm text-gray-700 dark:text-slate-400">24h Change</span>
                  <span className={`text-base font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositive ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-slate-400">Market Cap</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatLargeNumber(crypto.marketCap)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-slate-400">24h Volume</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatLargeNumber(crypto.volume)}</span>
                  </div>
                  {crypto.rank && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-slate-400">Rank</span>
                      <span className="font-medium text-gray-900 dark:text-white">#{crypto.rank}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
