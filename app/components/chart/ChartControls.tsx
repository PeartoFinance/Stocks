'use client';

import React, { useState } from 'react';
import { AreaChart, CandlestickChart, LineChart, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  return (
    <div className={`px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700 ${className}`}>
      {/* Mobile: Collapsible All Controls */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all"
        >
          <span className="text-sm font-medium">Chart Controls</span>
          {isMobileExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {isMobileExpanded && (
          <div className="mt-3 space-y-3">
            {/* Period Selector */}
            <div>
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2 block">Period:</span>
              <div className="grid grid-cols-3 gap-2">
                {periods.map((p) => (
                  <button
                    key={p}
                    onClick={() => onPeriodChange(p)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      period === p
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Type Selector */}
            <div>
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2 block">Type:</span>
              <div className="grid grid-cols-2 gap-2">
                {chartTypes.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => onChartTypeChange(type.key)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                      chartType === type.key
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <type.icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div>
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2 block">Filters:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onToggleVolumeProfile}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    showVolumeProfile 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Volume Profile
                </button>
                <button
                  onClick={onToggleMovingAverages}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    showMovingAverages 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  MA Ribbon
                </button>
                <button
                  onClick={onToggleGaps}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    showGaps 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Price Gaps
                </button>
                <button
                  onClick={onTogglePercentMode}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    percentMode 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  % Mode
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Main Controls - Always Visible */}
      <div className="hidden md:flex flex-wrap items-center gap-4">
        {/* Period Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Period:</span>
          <div className="flex gap-2">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  period === p
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Type:</span>
          <div className="flex gap-2">
            {chartTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => onChartTypeChange(type.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                  chartType === type.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <type.icon className="h-4 w-4" />
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Filters Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-auto px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all flex items-center gap-2"
        >
          <span>Filters</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Collapsible Analytical Controls */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onToggleVolumeProfile}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                showVolumeProfile 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Volume Profile
            </button>
            <button
              onClick={onToggleMovingAverages}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                showMovingAverages 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              MA Ribbon
            </button>
            <button
              onClick={onToggleGaps}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                showGaps 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Price Gaps
            </button>
            <button
              onClick={onTogglePercentMode}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                percentMode 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              % Mode
            </button>
            <button
              onClick={onToggleCorrelation}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                showCorrelation 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Correlation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
