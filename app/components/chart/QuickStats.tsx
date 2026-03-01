'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { HistoricalData } from '../../types';

interface QuickStatsProps {
  data: HistoricalData[];
  formatPrice: (price: number) => string;
  className?: string;
}

export default function QuickStats({ data, formatPrice, className = '' }: QuickStatsProps) {
  if (data.length === 0) return null;

  const latest = data[data.length - 1];
  const first = data[0];
  const high = Math.max(...data.map(d => d?.high ?? 0));
  const low = Math.min(...data.map(d => d?.low ?? 0));
  const avgVolume = data.reduce((sum, d) => sum + (d?.volume ?? 0), 0) / data.length;
  
  // Calculate RSI (simplified)
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const change = (data[i]?.close ?? 0) - (data[i-1]?.close ?? 0);
    if (change > 0) gains.push(change);
    else if (change < 0) losses.push(Math.abs(change));
  }
  const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
  const rs = avgLoss > 0 ? avgGain / avgLoss : 0;
  const rsi = 100 - (100 / (1 + rs));
  
  const stats = [
    { label: '52-Week High/Low', value: `${formatPrice(high)} / ${formatPrice(low)}` },
    { label: 'Avg. Daily Volume', value: `${(avgVolume / 1e6).toFixed(1)}M Shares` },
    { label: 'Volatility (Beta)', value: '1.15' }, // Placeholder
    { label: 'Current RSI', value: `${rsi.toFixed(0)} (${rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'})` }
  ];

  return (
    <div className={`border-t border-gray-200 dark:border-slate-700 ${className}`}>
      <div className="flex items-center gap-2 mb-3 px-4 pt-4">
        <Activity className="h-4 w-4 text-blue-600" />
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Quick Stats</h4>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 pb-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-slate-400 font-medium mb-1">{stat.label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
