'use client';

import React from 'react';
import { DollarSign, TrendingUp, Percent, BarChart3 } from 'lucide-react';
import { FilterValues } from './types';

interface Props {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  availableSectors: string[];
  availableIndustries: string[];
}

const MARKET_CAP_PRESETS = [
  { label: 'Micro (<$300M)', min: 0, max: 300000000 },
  { label: 'Small ($300M-$2B)', min: 300000000, max: 2000000000 },
  { label: 'Mid ($2B-$10B)', min: 2000000000, max: 10000000000 },
  { label: 'Large ($10B+)', min: 10000000000, max: undefined },
];

export default function MultiCriteriaFilters({ filters, onChange, availableSectors, availableIndustries }: Props) {
  const updateFilter = (key: keyof FilterValues, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleSector = (sector: string) => {
    const current = filters.sectors;
    const updated = current.includes(sector)
      ? current.filter(s => s !== sector)
      : [...current, sector];
    updateFilter('sectors', updated);
  };

  const setMarketCapPreset = (min?: number, max?: number) => {
    onChange({ ...filters, minMarketCap: min, maxMarketCap: max });
  };

  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
          <DollarSign className="h-4 w-4" />
          Price Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => updateFilter('minPrice', Number(e.target.value) || undefined)}
            className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => updateFilter('maxPrice', Number(e.target.value) || undefined)}
            className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Market Cap */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
          <BarChart3 className="h-4 w-4" />
          Market Cap
        </label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {MARKET_CAP_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setMarketCapPreset(preset.min, preset.max)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                filters.minMarketCap === preset.min && filters.maxMarketCap === preset.max
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min (Billions)"
            value={filters.minMarketCap ? filters.minMarketCap / 1000000000 : ''}
            onChange={(e) => updateFilter('minMarketCap', (Number(e.target.value) || 0) * 1000000000)}
            className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm"
          />
          <input
            type="number"
            placeholder="Max (Billions)"
            value={filters.maxMarketCap ? filters.maxMarketCap / 1000000000 : ''}
            onChange={(e) => updateFilter('maxMarketCap', (Number(e.target.value) || 0) * 1000000000)}
            className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* P/E Ratio */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
          <TrendingUp className="h-4 w-4" />
          P/E Ratio
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPE || ''}
            onChange={(e) => updateFilter('minPE', Number(e.target.value) || undefined)}
            className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPE || ''}
            onChange={(e) => updateFilter('maxPE', Number(e.target.value) || undefined)}
            className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Dividend Yield */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
          <Percent className="h-4 w-4" />
          Min Dividend Yield (%)
        </label>
        <input
          type="number"
          placeholder="e.g., 3"
          value={filters.minDividendYield || ''}
          onChange={(e) => updateFilter('minDividendYield', Number(e.target.value) || undefined)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm"
        />
      </div>

      {/* Sectors */}
      <div>
        <label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">
          Sectors
        </label>
        <div className="flex flex-wrap gap-2">
          {availableSectors.map((sector) => (
            <button
              key={sector}
              onClick={() => toggleSector(sector)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                filters.sectors.includes(sector)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
