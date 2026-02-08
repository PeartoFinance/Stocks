'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, RefreshCw } from 'lucide-react';

interface GlobalMetrics {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  activeCryptos: number;
  marketCapChange24h: number;
}

interface CryptoMetricsProps {
  globalMetrics: GlobalMetrics | null;
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function CryptoMetrics({ globalMetrics, loading = false, onRefresh, refreshing = false }: CryptoMetricsProps) {
  const formatMarketCap = (marketCap: number | undefined | null) => {
    if (!marketCap || isNaN(marketCap)) return '$0';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatVolume = (volume: number | undefined | null) => {
    if (!volume || isNaN(volume)) return '$0';
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${volume.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border dark:border-pearto-border p-6 animate-pulse transition-colors duration-300">
            <div className="h-4 bg-gray-200 rounded w-16 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border dark:border-pearto-border p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-pearto-green transition-colors duration-300" />
          </div>
          <span className="text-sm font-medium text-emerald-600 dark:text-pearto-green transition-colors duration-300">Total Market Cap</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-pearto-luna dark:text-pearto-luna mb-2 transition-colors duration-300">
          {formatMarketCap(globalMetrics?.totalMarketCap || 0)}
        </div>
        <div className={`flex items-center text-sm font-medium ${(globalMetrics?.marketCapChange24h || 0) >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'}`}>
          {(globalMetrics?.marketCapChange24h || 0) >= 0 ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          {(globalMetrics?.marketCapChange24h || 0) >= 0 ? '+' : ''}{(globalMetrics?.marketCapChange24h || 0).toFixed(2)}%
        </div>
      </div>

      <div className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border dark:border-pearto-border p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Activity className="h-5 w-5 text-emerald-600 dark:text-pearto-green transition-colors duration-300" />
          </div>
          <span className="text-sm font-medium text-emerald-600 dark:text-pearto-green transition-colors duration-300">24h Volume</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-pearto-luna dark:text-pearto-luna mb-2 transition-colors duration-300">
          {formatVolume(globalMetrics?.totalVolume24h || 0)}
        </div>
        <div className="text-sm text-gray-500 dark:text-pearto-gray dark:text-pearto-gray transition-colors duration-300">Last 24 hours</div>
      </div>

      <div className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border dark:border-pearto-border p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <div className="h-5 w-5 text-emerald-600 dark:text-pearto-green font-bold text-center transition-colors duration-300">₿</div>
          </div>
          <span className="text-sm font-medium text-emerald-600 dark:text-pearto-green transition-colors duration-300">BTC Dominance</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-pearto-luna dark:text-pearto-luna mb-2 transition-colors duration-300">
          {(globalMetrics?.btcDominance || 0).toFixed(1)}%
        </div>
        <div className="text-sm text-gray-500 dark:text-pearto-gray dark:text-pearto-gray transition-colors duration-300">Market share</div>
      </div>

      <div className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border dark:border-pearto-border p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <div className="h-5 w-5 text-emerald-600 dark:text-pearto-green font-bold text-center transition-colors duration-300">#</div>
          </div>
          <span className="text-sm font-medium text-emerald-600 dark:text-pearto-green transition-colors duration-300">Active Cryptos</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-pearto-luna dark:text-pearto-luna mb-2 transition-colors duration-300">
          {globalMetrics?.activeCryptos?.toLocaleString() || '0'}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-pearto-gray dark:text-pearto-gray transition-colors duration-300">Tracked</div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 dark:text-pearto-gray dark:text-pearto-gray hover:text-gray-700 dark:text-pearto-cloud dark:text-pearto-cloud transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
