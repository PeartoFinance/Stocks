'use client';

import { ComparisonStock } from './types';
import { Activity, Maximize2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const stocksWithData = comparedStocks.filter(stock => stock.historicalData && stock.historicalData.length > 0);

  const handleFullscreen = () => {
    if (stocksWithData.length === 1) {
      router.push(`/stockchart/${stocksWithData[0].symbol.toLowerCase()}/detailedpage`);
    } else {
      const symbols = stocksWithData.map(s => s.symbol).join('.');
      router.push(`/comparedata/stocks/${symbols}/detailedchart`);
    }
  };

  if (comparedStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No stocks selected</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400">Add stocks to see the chart</p>
      </div>
    );
  }

  if (stocksWithData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/95 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-blue-600 dark:text-emerald-500 animate-spin mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading Chart Data</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">Fetching historical data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/95 rounded-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">Price Comparison</h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
            {[{ key: 'line', label: 'Line' }, { key: 'area', label: 'Area' }, { key: 'candle', label: 'Candle' }].map((type) => (
              <button
                key={type.key}
                onClick={() => onChartTypeChange(type.key as 'line' | 'area' | 'candle')}
                className={`px-2 md:px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  chartType === type.key
                    ? 'bg-white dark:bg-slate-900/95 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-[#fafafa]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => onPeriodChange(period)}
                className={`px-2 md:px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  chartPeriod === period
                    ? 'bg-white dark:bg-slate-900/95 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-[#fafafa]'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 flex-1 w-full">
          {stocksWithData.map((stock) => {
            const isPositive = stock.change >= 0;
            return (
              <div key={stock.symbol} className={`bg-gradient-to-br ${isPositive ? 'from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/5 border-green-200 dark:border-green-500/30' : 'from-red-50 to-rose-50 dark:from-red-500/10 dark:to-rose-500/5 border-red-200 dark:border-red-500/30'} rounded-lg p-2.5 border-2 shadow-sm hover:shadow-md transition-all`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" style={{ backgroundColor: stock.color }} />
                    <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="text-xs font-semibold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      {stock.symbol}
                    </Link>
                  </div>
                  <button onClick={() => onRemoveStock(stock.symbol)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-0.5 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-600 dark:text-slate-400">Price</span>
                    <PriceDisplay amount={stock.price} className="text-xs font-bold dark:text-white" />
                  </div>
                  <div className={`flex justify-between items-center px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-green-100 dark:bg-green-500/20' : 'bg-red-100 dark:bg-red-500/20'}`}>
                    <span className="text-[10px] text-gray-700 dark:text-slate-400">Change</span>
                    <span className={`text-[10px] font-semibold ${isPositive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {isPositive ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={handleFullscreen} 
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:ml-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all w-full sm:w-auto justify-center font-medium"
        >
          <Maximize2 className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Detailed Chart</span>
        </button>
      </div>

      <div id="chart-container" className="relative bg-slate-50 dark:bg-slate-900/95 h-[32rem] rounded-lg p-3 border border-slate-200/50 dark:border-slate-700/50">
        {chartLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 z-10 rounded-lg">
            <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-500 animate-spin mb-2" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Loading chart data...</p>
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
