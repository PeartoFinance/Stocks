'use client';

import React from 'react';
import { Activity, TrendingUp, Volume2 } from 'lucide-react';
import { TechnicalFilterValues } from './types';

interface Props {
  filters: TechnicalFilterValues;
  onChange: (filters: TechnicalFilterValues) => void;
}

export default function TechnicalFilters({ filters, onChange }: Props) {
  const updateFilter = (key: keyof TechnicalFilterValues, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
      <div className="space-y-6">
        {/* RSI Condition */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            RSI Condition
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => updateFilter('rsiCondition', filters.rsiCondition === 'oversold' ? undefined : 'oversold')}
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-all border ${
                filters.rsiCondition === 'oversold'
                  ? 'bg-green-500 text-white border-green-500 shadow-md'
                  : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
              }`}
            >
              <div className="font-semibold">Oversold</div>
              <div className="text-xs opacity-80">RSI &lt; 30</div>
            </button>
            <button
              onClick={() => updateFilter('rsiCondition', filters.rsiCondition === 'neutral' ? undefined : 'neutral')}
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-all border ${
                filters.rsiCondition === 'neutral'
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                  : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              <div className="font-semibold">Neutral</div>
              <div className="text-xs opacity-80">RSI 30-70</div>
            </button>
            <button
              onClick={() => updateFilter('rsiCondition', filters.rsiCondition === 'overbought' ? undefined : 'overbought')}
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-all border ${
                filters.rsiCondition === 'overbought'
                  ? 'bg-red-500 text-white border-red-500 shadow-md'
                  : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500'
              }`}
            >
              <div className="font-semibold">Overbought</div>
              <div className="text-xs opacity-80">RSI &gt; 70</div>
            </button>
          </div>
        </div>

        {/* Moving Average Condition */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Moving Average Signal
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => updateFilter('maCondition', filters.maCondition === 'golden_cross' ? undefined : 'golden_cross')}
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-all border ${
                filters.maCondition === 'golden_cross'
                  ? 'bg-green-500 text-white border-green-500 shadow-md'
                  : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
              }`}
            >
              <div className="font-semibold">Golden Cross</div>
              <div className="text-xs opacity-80">50 MA crosses above 200 MA</div>
            </button>
            <button
              onClick={() => updateFilter('maCondition', filters.maCondition === 'death_cross' ? undefined : 'death_cross')}
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-all border ${
                filters.maCondition === 'death_cross'
                  ? 'bg-red-500 text-white border-red-500 shadow-md'
                  : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500'
              }`}
            >
              <div className="font-semibold">Death Cross</div>
              <div className="text-xs opacity-80">50 MA crosses below 200 MA</div>
            </button>
            <button
              onClick={() => updateFilter('maCondition', filters.maCondition === 'above_ma' ? undefined : 'above_ma')}
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-all border ${
                filters.maCondition === 'above_ma'
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                  : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500'
              }`}
            >
              <div className="font-semibold">Above 200 MA</div>
              <div className="text-xs opacity-80">Price above 200-day MA</div>
            </button>
            <button
              onClick={() => updateFilter('maCondition', filters.maCondition === 'below_ma' ? undefined : 'below_ma')}
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-all border ${
                filters.maCondition === 'below_ma'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                  : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500'
              }`}
            >
              <div className="font-semibold">Below 200 MA</div>
              <div className="text-xs opacity-80">Price below 200-day MA</div>
            </button>
          </div>
        </div>

        {/* Volume Spike */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
            <Volume2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Volume Analysis
          </label>
          <button
            onClick={() => updateFilter('volumeSpike', !filters.volumeSpike)}
            className={`w-full px-4 py-3 text-sm font-medium rounded-lg transition-all border ${
              filters.volumeSpike
                ? 'bg-purple-500 text-white border-purple-500 shadow-md'
                : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
            }`}
          >
            <div className="font-semibold">{filters.volumeSpike ? '✓ ' : ''}Volume Spike Detected</div>
            <div className="text-xs opacity-80">Trading volume 2x+ above average</div>
          </button>
        </div>
      </div>
    </div>
  );
}
