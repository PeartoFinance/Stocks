'use client';

import { ComparisonStock } from './types';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

interface OverviewTabProps {
  comparedStocks: ComparisonStock[];
  formatLargeNumber: (num: number | undefined | null) => string;
}

export default function OverviewTab({ comparedStocks, formatLargeNumber }: OverviewTabProps) {
  if (comparedStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No stocks selected</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Add stocks to see the overview</p>
      </div>
    );
  }

  const bestPerformer = comparedStocks.reduce((best, current) =>
    (current.changePercent ?? -Infinity) > (best.changePercent ?? -Infinity) ? current : best
  );

  const worstPerformer = comparedStocks.reduce((worst, current) =>
    (current.changePercent ?? Infinity) < (worst.changePercent ?? Infinity) ? current : worst
  );

  const highestVolume = comparedStocks.reduce((highest, current) =>
    (current.volume || 0) > (highest.volume || 0) ? current : highest
  );

  const largestCap = comparedStocks.reduce((largest, current) =>
    (current.marketCap || 0) > (largest.marketCap || 0) ? current : largest
  );

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="bg-white dark:bg-slate-900/95 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Performance Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/5 rounded-lg border border-green-200 dark:border-green-500/20">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase">Best</span>
            </div>
            <div className="text-base font-medium text-green-900 dark:text-white mb-1">{bestPerformer.symbol}</div>
            <div className="text-sm font-medium text-green-700 dark:text-green-400">+{(bestPerformer.changePercent ?? 0).toFixed(2)}%</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/5 rounded-lg border border-red-200 dark:border-red-500/20">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-500" />
              <span className="text-xs font-medium text-red-700 dark:text-red-400 uppercase">Worst</span>
            </div>
            <div className="text-base font-medium text-red-900 dark:text-white mb-1">{worstPerformer.symbol}</div>
            <div className="text-sm font-medium text-red-700 dark:text-red-400">{(worstPerformer.changePercent ?? 0).toFixed(2)}%</div>
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

      {/* Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparedStocks.map((stock) => {
          const isPositive = (stock.changePercent ?? 0) >= 0;
          return (
            <div key={stock.symbol} className="bg-white dark:bg-slate-900/95 rounded-xl border-2 p-5" style={{ borderColor: stock.color }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stock.symbol}</h3>
                  <p className="text-sm text-slate-500 truncate max-w-[180px]">{stock.name}</p>
                </div>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stock.color }} />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">${(stock.price ?? 0).toFixed(2)}</span>
                <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-teal-600' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {isPositive ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-slate-500">Mkt Cap</span> <span className="font-medium text-slate-900 dark:text-white ml-1">{formatLargeNumber(stock.marketCap)}</span></div>
                <div><span className="text-slate-500">P/E</span> <span className="font-medium text-slate-900 dark:text-white ml-1">{stock.peRatio?.toFixed(2) || '-'}</span></div>
                <div><span className="text-slate-500">EPS</span> <span className="font-medium text-slate-900 dark:text-white ml-1">${stock.eps?.toFixed(2) || '-'}</span></div>
                <div><span className="text-slate-500">Beta</span> <span className="font-medium text-slate-900 dark:text-white ml-1">{stock.beta?.toFixed(2) || '-'}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
