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
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-emerald-600">Total Market Cap</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {formatMarketCap(globalMetrics?.totalMarketCap || 0)}
        </div>
        <div className={`flex items-center text-sm font-medium ${(globalMetrics?.marketCapChange24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {(globalMetrics?.marketCapChange24h || 0) >= 0 ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          {(globalMetrics?.marketCapChange24h || 0) >= 0 ? '+' : ''}{(globalMetrics?.marketCapChange24h || 0).toFixed(2)}%
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Activity className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-emerald-600">24h Volume</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {formatVolume(globalMetrics?.totalVolume24h || 0)}
        </div>
        <div className="text-sm text-gray-500">Last 24 hours</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <div className="h-5 w-5 text-emerald-600 font-bold text-center">₿</div>
          </div>
          <span className="text-sm font-medium text-emerald-600">BTC Dominance</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {(globalMetrics?.btcDominance || 0).toFixed(1)}%
        </div>
        <div className="text-sm text-gray-500">Market share</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <div className="h-5 w-5 text-emerald-600 font-bold text-center">#</div>
          </div>
          <span className="text-sm font-medium text-emerald-600">Active Cryptos</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {globalMetrics?.activeCryptos?.toLocaleString() || '0'}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Tracked</div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
