'use client';

import { ComparisonCrypto } from './types';
import { Activity, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

interface ProfileTabProps {
  comparedCryptos: ComparisonCrypto[];
  formatLargeNumber: (num: number | undefined | null) => string;
}

export default function ProfileTab({ comparedCryptos, formatLargeNumber }: ProfileTabProps) {
  if (comparedCryptos.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No cryptos selected</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Add cryptocurrencies to see profiles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {comparedCryptos.map((crypto) => {
        const isPositive = crypto.changePercent >= 0;
        return (
          <div key={crypto.symbol} className="bg-white dark:bg-slate-900/95 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className={`p-3 ${isPositive ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/5' : 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: crypto.color }} />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{crypto.symbol}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{crypto.name}</p>
                  </div>
                </div>
                {crypto.rank && (
                  <div className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] font-medium text-gray-700 dark:text-white">#{crypto.rank}</span>
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 dark:text-white">${crypto.price.toFixed(2)}</span>
                <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isPositive ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-3 space-y-3">
              {/* Market Data */}
              <div>
                <h4 className="text-[10px] font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3 text-blue-600 dark:text-emerald-500" />
                  Market
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 mb-0.5">Market Cap</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{formatLargeNumber(crypto.marketCap)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 mb-0.5">24h Volume</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{formatLargeNumber(crypto.volume)}</p>
                  </div>
                </div>
              </div>

              {/* 24h Range */}
              {(crypto.high24h || crypto.low24h) && (
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1">
                    <Activity className="h-3 w-3 text-blue-600 dark:text-emerald-500" />
                    24h Range
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {crypto.low24h && (
                      <div className="bg-red-50 dark:bg-red-500/10 p-2 rounded border border-red-200 dark:border-red-500/20">
                        <p className="text-[9px] text-red-700 dark:text-red-400 mb-0.5">Low</p>
                        <p className="text-xs font-medium text-red-900 dark:text-white">${crypto.low24h.toFixed(2)}</p>
                      </div>
                    )}
                    {crypto.high24h && (
                      <div className="bg-green-50 dark:bg-green-500/10 p-2 rounded border border-green-200 dark:border-green-500/20">
                        <p className="text-[9px] text-green-700 dark:text-green-400 mb-0.5">High</p>
                        <p className="text-xs font-medium text-green-900 dark:text-white">${crypto.high24h.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Supply */}
              {(crypto.circulatingSupply || crypto.maxSupply) && (
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-blue-600 dark:text-emerald-500" />
                    Supply
                  </h4>
                  <div className="space-y-1">
                    {crypto.circulatingSupply && (
                      <div className="flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-700 rounded">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400">Circulating</span>
                        <span className="text-[10px] font-semibold text-slate-900 dark:text-white">
                          {crypto.circulatingSupply >= 1e9 ? `${(crypto.circulatingSupply / 1e9).toFixed(2)}B` : `${(crypto.circulatingSupply / 1e6).toFixed(2)}M`}
                        </span>
                      </div>
                    )}
                    {crypto.maxSupply && (
                      <div className="flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-700 rounded">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400">Max</span>
                        <span className="text-[10px] font-semibold text-slate-900 dark:text-white">
                          {crypto.maxSupply >= 1e9 ? `${(crypto.maxSupply / 1e9).toFixed(2)}B` : `${(crypto.maxSupply / 1e6).toFixed(2)}M`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
