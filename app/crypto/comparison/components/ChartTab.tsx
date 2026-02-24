'use client';

import { ComparisonCrypto } from './types';
import { useState, useEffect } from 'react';
import { Activity, Calendar, BarChart3, TrendingUp, X, Maximize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cryptoService } from '../../../utils/cryptoService';
import toast from 'react-hot-toast';
import MultiStockChart from '../../../components/MultiStockChart';
import { HistoricalData } from '../../../types';

type ChartType = 'line' | 'area' | 'candle';

interface ChartTabProps {
  comparedCryptos: ComparisonCrypto[];
  formatLargeNumber: (num: number | undefined | null) => string;
  removeFromComparison: (symbol: string) => void;
}

export default function ChartTab({ comparedCryptos, formatLargeNumber, removeFromComparison }: ChartTabProps) {
  const router = useRouter();
  const [chartData, setChartData] = useState<HistoricalData[][]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('1mo');
  const [chartType, setChartType] = useState<ChartType>('line');

  const handleFullscreen = () => {
    if (comparedCryptos.length === 1) {
      router.push(`/cryptochart/${comparedCryptos[0].symbol.toLowerCase()}/detailedpage`);
    } else {
      const symbols = comparedCryptos.map(c => c.symbol).join('.');
      router.push(`/comparedata/crypto/${symbols}/detailedchart`);
    }
  };

  const periods = [
    { value: '1d', label: '1D' },
    { value: '5d', label: '5D' },
    { value: '1mo', label: '1M' },
    { value: '3mo', label: '3M' },
    { value: '6mo', label: '6M' },
    { value: '1y', label: '1Y' }
  ];

  const chartTypes = [
    { value: 'line' as ChartType, label: 'Line', icon: TrendingUp },
    { value: 'area' as ChartType, label: 'Area', icon: BarChart3 },
    { value: 'candle' as ChartType, label: 'Candle', icon: Activity }
  ];

  useEffect(() => {
    if (comparedCryptos.length > 0) {
      loadChartData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparedCryptos, period]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const dataPromises = comparedCryptos.map(crypto =>
        cryptoService.getHistory(crypto.symbol, period, '1d')
      );
      const results = await Promise.all(dataPromises);

      const formattedData = results.map((result, index) => {
        if (result?.data) {
          return result.data.map((point: any) => ({
            date: point.date,
            open: point.open,
            high: point.high,
            low: point.low,
            close: point.close,
            volume: point.volume
          }));
        }
        return [];
      });

      setChartData(formattedData);
    } catch (error) {
      toast.error('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  if (comparedCryptos.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No cryptos selected</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400">Add cryptocurrencies to see price charts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Combined Period and Chart Type Selector */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-3 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          {/* Period Selector */}
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-emerald-500 flex-shrink-0" />
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {periods.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  disabled={loading}
                  className={`px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-medium transition-all flex-shrink-0 ${
                    period === p.value
                      ? 'bg-blue-600 dark:bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-[#262626]'
                  } disabled:opacity-50`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-2">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-emerald-500 flex-shrink-0" />
            <div className="flex gap-1">
              {chartTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setChartType(type.value)}
                    disabled={loading}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-medium transition-all flex-shrink-0 ${
                      chartType === type.value
                        ? 'bg-blue-600 dark:bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-gray-700 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-[#262626]'
                    } disabled:opacity-50`}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-3 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Price Comparison</h3>
          <button 
            onClick={handleFullscreen} 
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all font-medium"
          >
            <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Detailed Chart</span>
          </button>
        </div>

        {/* Crypto Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
          {comparedCryptos.map((crypto) => {
            const isPositive = crypto.changePercent >= 0;
            return (
              <div key={crypto.symbol} className={`bg-gradient-to-br ${isPositive ? 'from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/5 border-green-200 dark:border-green-500/30' : 'from-red-50 to-rose-50 dark:from-red-500/10 dark:to-rose-500/5 border-red-200 dark:border-red-500/30'} rounded-lg p-2.5 border-2 shadow-sm hover:shadow-md transition-all`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" style={{ backgroundColor: crypto.color }} />
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-900 dark:text-white">{crypto.symbol}</span>
                  </div>
                  <button onClick={() => removeFromComparison(crypto.symbol)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-0.5 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-1">${crypto.price.toFixed(2)}</div>
                <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold ${isPositive ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'}`}>
                  {isPositive ? '▲' : '▼'} {Math.abs(crypto.changePercent).toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 dark:text-emerald-500 animate-spin mb-2" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Loading chart data...</p>
          </div>
        ) : chartData.length > 0 && chartData.every(data => data.length > 0) ? (
          <div className="relative bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 sm:p-3 border border-slate-200/50 dark:border-slate-700/50">
            <MultiStockChart
              stocks={comparedCryptos.map((crypto, index) => ({
                symbol: crypto.symbol,
                name: crypto.name,
                color: crypto.color,
                data: chartData[index] || [],
                currentPrice: crypto.price,
                change: crypto.change,
                changePercent: crypto.changePercent
              }))}
              height={window.innerWidth < 640 ? 250 : 400}
              period={period}
              chartType={chartType}
            />
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400">No chart data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
