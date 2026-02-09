'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  AreaChart,
  LineChart,
  Mountain
} from 'lucide-react';
import StockChart from '../StockChart';

interface HistoricalData {
  time: string;
  price: number;
  volume: number;
  marketCap: number;
}

interface ChartTabProps {
  crypto: {
    symbol: string;
    name: string;
    change: number;
    changePercent: number;
  };
  historicalData: HistoricalData[];
  chartPeriod: string;
  chartType: 'area' | 'candlestick' | 'line' | 'mountain';
  onPeriodChange: (period: string) => void;
  onChartTypeChange: (type: 'area' | 'candlestick' | 'line' | 'mountain') => void;
  chartLoading: boolean;
}

export default function ChartTab({ 
  crypto, 
  historicalData, 
  chartPeriod, 
  chartType, 
  onPeriodChange, 
  onChartTypeChange,
  chartLoading 
}: ChartTabProps) {
  const [showVolume, setShowVolume] = useState(true);

  const formatPrice = (price: number | null | undefined) => {
    // Check if price is a valid number
    if (price === null || price === undefined || isNaN(price)) {
      return '---';
    }
    
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
    }
  };

  const formatNumber = (num: number | null | undefined, decimals = 2): string => {
    if (num === null || num === undefined || isNaN(num)) {
      return '0.00';
    }
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const periods = ['1D', '1W', '1M', '3M', '1Y', '5Y'];
  const chartTypes = [
    { key: 'area', label: 'Area', icon: AreaChart },
    { key: 'line', label: 'Line', icon: LineChart },
    { key: 'mountain', label: 'Mountain', icon: Mountain },
  ];

  const isPositive = crypto.change >= 0;

  // Calculate price change for the selected period
  const calculatePeriodChange = () => {
    if (historicalData.length < 2) return { change: 0, changePercent: 0 };
    
    const firstPrice = historicalData[0].price;
    const lastPrice = historicalData[historicalData.length - 1].price;
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;
    
    return { change, changePercent };
  };

  const periodChange = calculatePeriodChange();

  return (
    <div className="space-y-6">
      {/* Chart Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 lg:p-6 transition-colors duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              {crypto.name} ({crypto.symbol}) Price Chart
            </h2>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${
                isPositive ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20" : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
              }`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {formatPrice(historicalData[historicalData.length - 1]?.price || crypto.change)}
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${
                periodChange.change >= 0 ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20" : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
              }`}>
                {periodChange.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {periodChange.change >= 0 ? '+' : ''}{formatNumber(periodChange.change)} ({periodChange.change >= 0 ? '+' : ''}{formatNumber(periodChange.changePercent)}%)
                <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">({chartPeriod})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Period Selector */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block transition-colors duration-300">Time Period</label>
              <div className="flex flex-wrap gap-2">
                {periods.map((p) => (
                  <button
                    key={p}
                    onClick={() => onPeriodChange(p)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      chartPeriod === p 
                        ? "bg-emerald-600 text-white shadow-sm" 
                        : "bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-500"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Type Selector */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block transition-colors duration-300">Chart Type</label>
              <div className="flex flex-wrap gap-2">
                {chartTypes.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => onChartTypeChange(type.key as any)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      chartType === type.key 
                        ? "bg-blue-600 text-white shadow-sm" 
                        : "bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-500"
                    }`}
                  >
                    <type.icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
                className="w-4 h-4 text-emerald-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-emerald-500 transition-colors duration-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">Show Volume</span>
            </label>
          </div>
        </div>

        {/* Main Chart Container */}
        <div className="h-[500px] lg:h-[600px] relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          {chartLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800/50 z-10 transition-colors duration-300">
              <div className="text-center">
                <Activity className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4 transition-colors duration-300" />
                <p className="text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">Loading chart data...</p>
              </div>
            </div>
          ) : null}
          
          {historicalData.length > 0 ? (
            <div className="h-full p-4">
              <StockChart 
                data={historicalData.map(item => ({
                  date: item.time,
                  open: item.price,
                  high: item.price,
                  low: item.price,
                  close: item.price,
                  volume: item.volume
                }))} 
                isPositive={periodChange.change >= 0} 
                height={450} 
                chartType={chartType} 
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium transition-colors duration-300">No chart data available</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try selecting a different time period</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Period High', 
            value: historicalData.length > 0 ? formatPrice(Math.max(...historicalData.map(d => d.price))) : '-',
            icon: TrendingUp,
            color: 'emerald'
          },
          { 
            label: 'Period Low', 
            value: historicalData.length > 0 ? formatPrice(Math.min(...historicalData.map(d => d.price))) : '-',
            icon: TrendingDown,
            color: 'red'
          },
          { 
            label: 'Average Price', 
            value: historicalData.length > 0 ? formatPrice(historicalData.reduce((sum, d) => sum + d.price, 0) / historicalData.length) : '-',
            icon: BarChart3,
            color: 'blue'
          },
          { 
            label: 'Volatility', 
            value: historicalData.length > 1 ? `${((Math.max(...historicalData.map(d => d.price)) - Math.min(...historicalData.map(d => d.price))) / Math.min(...historicalData.map(d => d.price)) * 100).toFixed(2)}%` : '-',
            icon: Activity,
            color: 'purple'
          },
        ].map((item, i) => (
          <div key={i} className={`bg-${item.color}-50 dark:bg-gray-800 p-4 rounded-xl border border-${item.color}-100 dark:border-gray-700`}>
            <div className="flex items-center gap-2 mb-2">
              <item.icon className={`h-4 w-4 text-${item.color}-600 dark:text-${item.color}-400`} />
              <span className={`text-sm font-medium text-${item.color}-700 dark:text-${item.color}-300`}>{item.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Volume Analysis */}
      {showVolume && historicalData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 lg:p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Volume Analysis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { 
                label: 'Total Volume', 
                value: `${(historicalData.reduce((sum, d) => sum + d.volume, 0) / 1e9).toFixed(2)}B`,
                icon: Activity,
                color: 'blue'
              },
              { 
                label: 'Average Volume', 
                value: `${(historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length / 1e6).toFixed(2)}M`,
                icon: BarChart3,
                color: 'emerald'
              },
              { 
                label: 'Max Volume', 
                value: `${(Math.max(...historicalData.map(d => d.volume)) / 1e6).toFixed(2)}M`,
                icon: TrendingUp,
                color: 'purple'
              },
            ].map((item, i) => (
              <div key={i} className={`bg-${item.color}-50 dark:bg-gray-800 p-4 rounded-xl border border-${item.color}-100 dark:border-gray-700`}>
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className={`h-4 w-4 text-${item.color}-600 dark:text-${item.color}-400`} />
                  <span className={`text-sm font-medium text-${item.color}-700 dark:text-${item.color}-300`}>{item.label}</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
