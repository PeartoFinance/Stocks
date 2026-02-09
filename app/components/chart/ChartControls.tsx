'use client';

import React from 'react';
import { AreaChart, CandlestickChart, LineChart } from 'lucide-react';

interface ChartControlsProps {
  period: string;
  chartType: 'area' | 'candlestick' | 'line' | 'mountain';
  showVolumeProfile: boolean;
  showMovingAverages: boolean;
  showGaps: boolean;
  showCorrelation: boolean;
  percentMode: boolean;
  onPeriodChange: (period: string) => void;
  onChartTypeChange: (type: 'area' | 'candlestick' | 'line' | 'mountain') => void;
  onToggleVolumeProfile: () => void;
  onToggleMovingAverages: () => void;
  onToggleGaps: () => void;
  onToggleCorrelation: () => void;
  onTogglePercentMode: () => void;
  className?: string;
}

const periods = ['1D', '5D', '1M', '3M', '6M', '1Y'];
const chartTypes = [
  { key: 'area', label: 'Area', icon: AreaChart },
  { key: 'candlestick', label: 'Candle', icon: CandlestickChart },
  { key: 'line', label: 'Line', icon: LineChart },
  { key: 'mountain', label: 'Mountain', icon: AreaChart },
] as const;

export default function ChartControls({
  period,
  chartType,
  showVolumeProfile,
  showMovingAverages,
  showGaps,
  showCorrelation,
  percentMode,
  onPeriodChange,
  onChartTypeChange,
  onToggleVolumeProfile,
  onToggleMovingAverages,
  onToggleGaps,
  onToggleCorrelation,
  onTogglePercentMode,
  className = ''
}: ChartControlsProps) {
  return (
    <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Period and Chart Type Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Period:</span>
          <div className="flex gap-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Type:</span>
          <div className="flex gap-1">
            {chartTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => onChartTypeChange(type.key)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  chartType === type.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <type.icon className="h-3 w-3" />
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analytical Controls */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={onToggleVolumeProfile}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            showVolumeProfile ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Volume Profile
        </button>
        <button
          onClick={onToggleMovingAverages}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            showMovingAverages ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          MA Ribbon
        </button>
        <button
          onClick={onToggleGaps}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            showGaps ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Price Gaps
        </button>
        <button
          onClick={onTogglePercentMode}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            percentMode ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          % Mode
        </button>
        <button
          onClick={onToggleCorrelation}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            showCorrelation ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Correlation
        </button>
      </div>
    </div>
  );
}
