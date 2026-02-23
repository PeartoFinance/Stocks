'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { stockAPI } from '@/app/utils/api';
import cryptoService from '@/app/utils/cryptoService';
import ComparisonChart from '@/app/components/detailedChart/ComparisonChart';
import ChartControls from '@/app/components/detailedChart/ChartControls';

export default function CompareDetailedPage() {
  const params = useParams();
  const router = useRouter();
  const name = params.name as string;
  const symbolParam = (params.symbol as string)?.toUpperCase();
  const symbols = symbolParam?.split('.').slice(0, 5) || [];
  const isCrypto = name === 'crypto';
  
  const [assetsData, setAssetsData] = useState<any[]>([]);
  const [chartsData, setChartsData] = useState<any[][]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('1D');
  const [selectedChartType, setSelectedChartType] = useState<'candlestick' | 'line' | 'area' | 'bar' | 'baseline' | 'histogram'>('line');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    if (!symbols.length) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const dataPromises = symbols.map(async (symbol) => {
          if (isCrypto) {
            const response: any = await cryptoService.getCoinDetails(symbol);
            return response?.symbol ? response : null;
          } else {
            const response = await stockAPI.getStockQuote(symbol);
            return response.success && response.data ? response.data : null;
          }
        });
        const results = await Promise.all(dataPromises);
        setAssetsData(results.filter(Boolean));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [symbolParam, isCrypto]);

  useEffect(() => {
    if (!symbols.length) return;
    
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        const periodMap: Record<string, string> = {
          '1D': '1d', '1W': '5d', '1M': '1mo', '3M': '3mo', '1Y': '1y', 'ALL': '5y'
        };
        const mappedPeriod = periodMap[selectedPeriod] || '1d';
        const interval = (isCrypto && selectedPeriod === '1D') ? '1d' : (selectedPeriod === '1D' ? '1m' : '1d');
        
        const chartPromises = symbols.map(async (symbol) => {
          let response;
          if (isCrypto) {
            response = await cryptoService.getHistory(symbol, mappedPeriod, interval);
          } else {
            const histResponse = await stockAPI.getHistoricalData(symbol, mappedPeriod, interval);
            response = { data: histResponse.data };
          }
          
          if (response && response.data) {
            return response.data
              .filter((item: any) => item.close != null && !isNaN(item.close))
              .map((item: any) => {
                const timestamp = new Date(item.date).getTime() / 1000;
                
                return {
                  time: timestamp,
                  open: item.open || item.close,
                  high: item.high || item.close,
                  low: item.low || item.close,
                  close: item.close,
                  value: item.close,
                  volume: item.volume != null && !isNaN(Number(item.volume)) ? Number(item.volume) : 0,
                };
              });
          }
          return [];
        });
        
        const results = await Promise.all(chartPromises);
        setChartsData(results);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setChartLoading(false);
      }
    };
    
    fetchChartData();
  }, [symbolParam, selectedPeriod, selectedChartType, isCrypto]);

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
              <div className="flex items-center gap-2 flex-wrap">
                {symbols.map((sym, idx) => (
                  <div key={sym} className="flex items-center gap-1">
                    <h1 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">{sym}</h1>
                    {idx < symbols.length - 1 && <span className="text-slate-400">vs</span>}
                  </div>
                ))}
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                  {isCrypto ? 'Crypto' : 'Stock'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
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
            <ComparisonChart data={chartsData} chartType={selectedChartType} symbols={symbols} />
          </div>
        </div>
      </div>
    </div>
  );
}
