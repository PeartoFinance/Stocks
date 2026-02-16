'use client';

import React from 'react';
import { DollarSign, TrendingUp, Percent, BarChart3, Building2 } from 'lucide-react';
import { FilterValues } from './types';

interface Props {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  availableSectors: string[];
  availableIndustries: string[];
}

const MARKET_CAP_PRESETS = [
  { label: 'Micro', sublabel: '<$300M', min: 0, max: 300000000 },
  { label: 'Small', sublabel: '$300M-$2B', min: 300000000, max: 2000000000 },
  { label: 'Mid', sublabel: '$2B-$10B', min: 2000000000, max: 10000000000 },
  { label: 'Large', sublabel: '$10B+', min: 10000000000, max: undefined },
];

export default function MultiCriteriaFilters({ filters, onChange, availableSectors, availableIndustries }: Props) {
  const updateFilter = (key: keyof FilterValues, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleSector = (sector: string) => {
    const current = filters.sectors || [];
    const updated = current.includes(sector)
      ? current.filter(s => s !== sector)
      : [...current, sector];
    updateFilter('sectors', updated);
  };

  const toggleIndustry = (industry: string) => {
    const current = filters.industries || [];
    const updated = current.includes(industry)
      ? current.filter(i => i !== industry)
      : [...current, industry];
    updateFilter('industries', updated);
  };

  const setMarketCapPreset = (min?: number, max?: number) => {
    onChange({ ...filters, minMarketCap: min, maxMarketCap: max });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Range */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', Number(e.target.value) || undefined)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', Number(e.target.value) || undefined)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* P/E Ratio */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            P/E Ratio
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min P/E"
              value={filters.minPE || ''}
              onChange={(e) => updateFilter('minPE', Number(e.target.value) || undefined)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm"
            />
            <input
              type="number"
              placeholder="Max P/E"
              value={filters.maxPE || ''}
              onChange={(e) => updateFilter('maxPE', Number(e.target.value) || undefined)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Market Cap */}
        <div className="lg:col-span-2 space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Market Cap
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MARKET_CAP_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setMarketCapPreset(preset.min, preset.max)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-all border ${
                  filters.minMarketCap === preset.min && filters.maxMarketCap === preset.max
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                    : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500'
                }`}
              >
                <div className="font-semibold">{preset.label}</div>
                <div className="text-xs opacity-80">{preset.sublabel}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dividend Yield */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Percent className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Min Dividend Yield (%)
          </label>
          <input
            type="number"
            placeholder="e.g., 3"
            value={filters.minDividendYield || ''}
            onChange={(e) => updateFilter('minDividendYield', Number(e.target.value) || undefined)}
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-slate-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Sectors */}
      {availableSectors.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
            <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Sectors {filters.sectors && filters.sectors.length > 0 && <span className="text-emerald-600 dark:text-emerald-400">({filters.sectors.length} selected)</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSectors.slice(0, 15).map((sector) => (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
                  filters.sectors?.includes(sector)
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                    : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Industries */}
      {availableIndustries.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
            <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Industries {filters.industries && filters.industries.length > 0 && <span className="text-emerald-600 dark:text-emerald-400">({filters.industries.length} selected)</span>}
          </label>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {availableIndustries.slice(0, 20).map((industry) => (
              <button
                key={industry}
                onClick={() => toggleIndustry(industry)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
                  filters.industries?.includes(industry)
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                    : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
