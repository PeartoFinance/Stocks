'use client';

import { CandlestickChart, BarChart3, LineChart, AreaChart, TrendingUp, Activity, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ChartControlsProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  selectedChartType: 'candlestick' | 'line' | 'area' | 'bar' | 'baseline' | 'histogram';
  onChartTypeChange: (type: 'candlestick' | 'line' | 'area' | 'bar' | 'baseline' | 'histogram') => void;
}

const periods = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '1Y', value: '1Y' },
  { label: 'ALL', value: 'ALL' },
];

const chartTypes = [
  { icon: CandlestickChart, value: 'candlestick' as const, label: 'Candlestick' },
  { icon: BarChart3, value: 'bar' as const, label: 'Bar' },
  { icon: LineChart, value: 'line' as const, label: 'Line' },
  { icon: AreaChart, value: 'area' as const, label: 'Area' },
  { icon: TrendingUp, value: 'baseline' as const, label: 'Baseline' },
  { icon: Activity, value: 'histogram' as const, label: 'Histogram' },
];

export default function ChartControls({
  selectedPeriod,
  onPeriodChange,
  selectedChartType,
  onChartTypeChange,
}: ChartControlsProps) {
  const [showChartTypeDropdown, setShowChartTypeDropdown] = useState(false);

  const selectedChartTypeObj = chartTypes.find(t => t.value === selectedChartType);

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => onPeriodChange(period.value)}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedPeriod === period.value
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
        
        {/* Chart Type Selector - Mobile Dropdown, Desktop Icons */}
        <div className="flex items-center gap-1">
          {/* Mobile Dropdown */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowChartTypeDropdown(!showChartTypeDropdown)}
              className="flex items-center gap-1 p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-600"
            >
              {selectedChartTypeObj && <selectedChartTypeObj.icon className="h-4 w-4" />}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showChartTypeDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-50 min-w-[140px]">
                {chartTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      onChartTypeChange(type.value);
                      setShowChartTypeDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-left hover:bg-slate-100 dark:hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg ${
                      selectedChartType === type.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Desktop Icons */}
          <div className="hidden sm:flex items-center gap-1">
            {chartTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => onChartTypeChange(type.value)}
                className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                  selectedChartType === type.value
                    ? 'bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
                }`}
                title={type.label}
              >
                <type.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
