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
    <div className="space-y-6">
      {/* RSI Condition */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
          <Activity className="h-4 w-4" />
          RSI Condition
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => updateFilter('rsiCondition', filters.rsiCondition === 'oversold' ? undefined : 'oversold')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              filters.rsiCondition === 'oversold'
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
            }`}
          >
            Oversold (&lt;30)
          </button>
          <button
            onClick={() => updateFilter('rsiCondition', filters.rsiCondition === 'neutral' ? undefined : 'neutral')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              filters.rsiCondition === 'neutral'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
            }`}
          >
            Neutral (30-70)
          </button>
          <button
            onClick={() => updateFilter('rsiCondition', filters.rsiCondition === 'overbought' ? undefined : 'overbought')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              filters.rsiCondition === 'overbought'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
            }`}
          >
            Overbought (&gt;70)
          </button>
        </div>
      </div>

      {/* Moving Average Condition */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
          <TrendingUp className="h-4 w-4" />
          Moving Average Signal
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateFilter('maCondition', filters.maCondition === 'golden_cross' ? undefined : 'golden_cross')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              filters.maCondition === 'golden_cross'
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
            }`}
          >
            Golden Cross
          </button>
          <button
            onClick={() => updateFilter('maCondition', filters.maCondition === 'death_cross' ? undefined : 'death_cross')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              filters.maCondition === 'death_cross'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
            }`}
          >
            Death Cross
          </button>
          <button
            onClick={() => updateFilter('maCondition', filters.maCondition === 'above_ma' ? undefined : 'above_ma')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              filters.maCondition === 'above_ma'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
            }`}
          >
            Above 200 MA
          </button>
          <button
            onClick={() => updateFilter('maCondition', filters.maCondition === 'below_ma' ? undefined : 'below_ma')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              filters.maCondition === 'below_ma'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
            }`}
          >
            Below 200 MA
          </button>
        </div>
      </div>

      {/* Volume Spike */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
          <Volume2 className="h-4 w-4" />
          Volume Analysis
        </label>
        <button
          onClick={() => updateFilter('volumeSpike', !filters.volumeSpike)}
          className={`w-full px-4 py-3 text-sm font-medium rounded-lg transition-all ${
            filters.volumeSpike
              ? 'bg-purple-600 text-white'
              : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
          }`}
        >
          {filters.volumeSpike ? '✓ ' : ''}Volume Spike (2x+ Average)
        </button>
      </div>
    </div>
  );
}
