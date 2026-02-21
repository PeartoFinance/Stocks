'use client';

import React from 'react';
import { HistoricalData } from '../../types';

interface ChartStatsProps {
  data: HistoricalData[];
  formatPrice: (price: number) => string;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  className?: string;
}

export default function ChartStats({
  data,
  formatPrice,
  onToggleFullscreen,
  isFullscreen,
  className = ''
}: ChartStatsProps) {
  if (data.length === 0) return null;

  const latest = data[data.length - 1];
  const first = data[0];
  const high = Math.max(...data.map(d => d.high));
  const low = Math.min(...data.map(d => d.low));
  const totalVolume = data.reduce((sum, d) => sum + (d.volume || 0), 0);

  const stats = [
    { 
      label: 'Current', 
      value: formatPrice(latest.close), 
      change: latest.close - first.close,
      changePercent: ((latest.close - first.close) / first.close * 100),
      color: 'blue' 
    },
    { 
      label: 'High', 
      value: formatPrice(high), 
      change: high - first.close,
      changePercent: ((high - first.close) / first.close * 100),
      color: 'green' 
    },
    { 
      label: 'Low', 
      value: formatPrice(low), 
      change: low - first.close,
      changePercent: ((low - first.close) / first.close * 100),
      color: 'red' 
    },
    { 
      label: 'Volume', 
      value: `${(totalVolume / 1e6).toFixed(1)}M`, 
      change: null,
      changePercent: null,
      color: 'purple' 
    }
  ];

  return (
    <div className={`px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className={`p-2 rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">{stat.label}</p>
                <div className={`w-1.5 h-1.5 rounded-full bg-${stat.color}-500`} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{stat.value}</p>
                {stat.change !== null && (
                  <div className={`text-xs font-medium ${
                    stat.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.changePercent >= 0 ? '+' : ''}{stat.changePercent.toFixed(2)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Fullscreen Button */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors"
          title="Toggle Fullscreen"
        >
          <svg className="h-4 w-4 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isFullscreen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
