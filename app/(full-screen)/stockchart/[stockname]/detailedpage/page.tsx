'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { stockAPI } from '@/app/utils/api';
import TradingChart from '@/app/components/detailedChart/TradingChart';
import ChartControls from '@/app/components/detailedChart/ChartControls';
import IndicatorsPanel from '@/app/components/detailedChart/IndicatorsPanel';


interface Indicator {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  settings?: Record<string, any>;
}

export default function DetailedTradingPage() {
  const params = useParams();
  const router = useRouter();
  const stockname = (params.stockname as string)?.toUpperCase();
  
  const [stockData, setStockData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [selectedChartType, setSelectedChartType] = useState<'candlestick' | 'line' | 'area' | 'bar' | 'baseline' | 'histogram'>('candlestick');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState<Indicator[]>([]);
  const [selectedDrawingTool, setSelectedDrawingTool] = useState<string | null>(null);

  useEffect(() => {
    if (!stockname) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await stockAPI.getStockQuote(stockname);
        if (response.success && response.data) {
          setStockData(response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [stockname]);

  useEffect(() => {
    if (!stockname) return;
    
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        const periodMap: Record<string, string> = {
          '1D': '1d', '1W': '5d', '1M': '1mo', '3M': '3mo', '1Y': '1y', 'ALL': '5y'
        };
        const mappedPeriod = periodMap[selectedPeriod] || '1mo';
        const interval = selectedPeriod === '1D' ? '1m' : '1d';
        
        const response = await stockAPI.getHistoricalData(stockname, mappedPeriod, interval);
        if (response.success && response.data) {
          console.log('Sample data point:', response.data[0]);
          console.log('Total data points:', response.data.length);
          const formattedData = response.data
            .filter((item: any) => item.close != null && !isNaN(item.close))
            .map((item: any) => {
              const timestamp = new Date(item.date).getTime() / 1000;
              let volume = 0;
              if (item.volume != null && !isNaN(Number(item.volume))) {
                volume = Number(item.volume);
              }
              
              if (selectedChartType === 'candlestick' || selectedChartType === 'bar') {
                return {
                  time: timestamp,
                  open: item.open || item.close,
                  high: item.high || item.close,
                  low: item.low || item.close,
                  close: item.close,
                  volume,
                };
              } else {
                return {
                  time: timestamp,
                  value: item.close,
                  volume,
                };
              }
            });
          console.log('Formatted sample:', formattedData[0]);
          console.log('Volume values:', formattedData.slice(0, 5).map((d: any) => d.volume));
          setChartData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setChartLoading(false);
      }
    };
    
    fetchChartData();
  }, [stockname, selectedPeriod, selectedChartType]);

  const handleAddIndicator = (indicator: Indicator) => {
    setActiveIndicators(prev => [...prev, indicator]);
  };

  const handleRemoveIndicator = (id: string) => {
    setActiveIndicators(prev => prev.filter(ind => ind.id !== id));
  };

  const currentPrice = stockData?.price || 0;
  const priceChange = stockData?.change || 0;
  const priceChangePercent = stockData?.changePercent || 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1 sm:gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Back</span>
            </button>
            <div className="h-4 sm:h-6 w-px bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">{stockname}</h1>
              {stockData && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">${currentPrice.toFixed(2)}</span>
                  <div className={`flex items-center gap-1 text-xs sm:text-sm font-semibold px-2 py-0.5 rounded ${
                    isPositive 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <IndicatorsPanel
              onAddIndicator={handleAddIndicator}
              onRemoveIndicator={handleRemoveIndicator}
              activeIndicators={activeIndicators}
            />
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hidden sm:inline">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-800">
        <ChartControls
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          selectedChartType={selectedChartType}
          onChartTypeChange={setSelectedChartType}
        />
        <div className="flex-1 p-2 sm:p-4 overflow-hidden relative">
          {chartLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 rounded-xl">
              <div className="flex flex-col items-center gap-3">
                <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading chart data...</p>
              </div>
            </div>
          )}
          <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <TradingChart data={chartData} chartType={selectedChartType} indicators={activeIndicators} />
          </div>
        </div>
      </div>
    </div>
  );
}
