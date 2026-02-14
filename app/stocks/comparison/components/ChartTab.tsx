'use client';

import { ComparisonStock } from './types';
import { Activity, Maximize2, X } from 'lucide-react';
import Link from 'next/link';
import MultiStockChart from '../../../components/MultiStockChart';
import PriceDisplay from '../../../components/common/PriceDisplay';

interface ChartTabProps {
  comparedStocks: ComparisonStock[];
  chartPeriod: string;
  chartType: 'line' | 'area' | 'candle';
  chartLoading: boolean;
  periods: string[];
  onPeriodChange: (period: string) => void;
  onChartTypeChange: (type: 'line' | 'area' | 'candle') => void;
  onRemoveStock: (symbol: string) => void;
  onFullscreen: () => void;
}

export default function ChartTab({
  comparedStocks,
  chartPeriod,
  chartType,
  chartLoading,
  periods,
  onPeriodChange,
  onChartTypeChange,
  onRemoveStock,
  onFullscreen
}: ChartTabProps) {
  const stocksWithData = comparedStocks.filter(stock => stock.historicalData && stock.historicalData.length > 0);

  if (comparedStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No stocks selected</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Add stocks to see the chart</p>
      </div>
    );
  }

  if (stocksWithData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-blue-600 dark:text-emerald-500 animate-spin mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Chart Data</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Fetching historical data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Price Comparison</h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            {[{ key: 'line', label: 'Line' }, { key: 'area', label: 'Area' }, { key: 'candle', label: 'Candle' }].map((type) => (
              <button
                key={type.key}
                onClick={() => onChartTypeChange(type.key as 'line' | 'area' | 'candle')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  chartType === type.key
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[#fafafa]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => onPeriodChange(period)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  chartPeriod === period
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[#fafafa]'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 flex-1">
          {stocksWithData.map((stock) => {
            const isPositive = stock.change >= 0;
            return (
              <div key={stock.symbol} className={`bg-white dark:bg-gray-700 rounded-lg p-3 border-2 ${isPositive ? 'border-green-200 dark:border-green-500/30' : 'border-red-200 dark:border-red-500/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white dark:border-[#171717]" style={{ backgroundColor: stock.color }} />
                    <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="text-sm font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-emerald-500">
                      {stock.symbol}
                    </Link>
                  </div>
                  <button onClick={() => onRemoveStock(stock.symbol)} className="text-gray-400 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Price</span>
                    <PriceDisplay amount={stock.price} className="text-sm font-semibold dark:text-white" />
                  </div>
                  <div className={`flex justify-between items-center p-1 rounded ${isPositive ? 'bg-green-100 dark:bg-green-500/10' : 'bg-red-100 dark:bg-red-500/10'}`}>
                    <span className="text-xs text-gray-700 dark:text-gray-400">Change</span>
                    <span className={`text-sm font-bold ${isPositive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={onFullscreen} className="ml-4 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-emerald-500/50 transition-all">
          <Maximize2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="relative bg-gray-50 dark:bg-gray-700 h-[32rem] rounded-lg p-3">
        {chartLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-700/50 z-10 rounded-lg">
            <Activity className="h-6 w-6 text-blue-600 dark:text-emerald-500 animate-spin" />
          </div>
        )}
        <div className="w-full h-full">
          <MultiStockChart
            stocks={stocksWithData.map(stock => ({
              symbol: stock.symbol,
              name: stock.name,
              color: stock.color,
              data: stock.historicalData || [],
              currentPrice: stock.price,
              change: stock.change,
              changePercent: stock.changePercent
            }))}
            height={480}
            period={chartPeriod}
            chartType={chartType}
          />
        </div>
      </div>
    </div>
  );
}
