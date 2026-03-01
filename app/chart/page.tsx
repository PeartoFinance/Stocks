'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Search, Brain, RefreshCw, Activity, Maximize2, AreaChart, BarChart3, LineChart, Maximize } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { marketService } from '../utils/marketService';
import { HistoricalData } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import {
  StockSearch,
  ChartHeader,
  ChartControls,
  ChartStats,
  ChartDisplay,
  QuickStats,
  MostActiveStocks,
  MarketMovers,
  ChartAIPanel
} from '../components/chart';

export default function TechnicalChartPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sparklineRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  const { formatPrice } = useCurrency();

  const [symbol, setSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('1M');
  const [data, setData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<'area' | 'candlestick' | 'line' | 'mountain'>('area');
  const [stockInfo, setStockInfo] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showVolumeProfile, setShowVolumeProfile] = useState(false);
  const [showMovingAverages, setShowMovingAverages] = useState(false);
  const [showGaps, setShowGaps] = useState(false);
  const [showCorrelation, setShowCorrelation] = useState(false);
  const [percentMode, setPercentMode] = useState(false);

  const [mostActive, setMostActive] = useState<any[]>([]);

  const calculateMovingAverages = useCallback((data: HistoricalData[], periods: number[]) => {
    return periods.map(p => {
      const ma = [];
      for (let i = p - 1; i < data.length; i++) {
        const sum = data.slice(i - p + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
        ma.push({
          time: data[i].date || i.toString(),
          value: sum / p
        });
      }
      return { period: p, data: ma };
    });
  }, []);

  const calculateVolumeProfile = useCallback((data: HistoricalData[]) => {
    const priceRanges: { [key: string]: number } = {};
    const rangeSize = 1;
    data.forEach(d => {
      const priceRange = Math.floor(d.close / rangeSize) * rangeSize;
      priceRanges[priceRange] = (priceRanges[priceRange] || 0) + (d.volume || 0);
    });
    return Object.entries(priceRanges)
      .map(([price, volume]) => ({ price: parseFloat(price), volume }))
      .sort((a, b) => a.price - b.price);
  }, []);

  const detectPriceGaps = useCallback((data: HistoricalData[]) => {
    const gaps = [];
    for (let i = 1; i < data.length; i++) {
      const prevClose = data[i - 1].close;
      const currOpen = data[i].open || data[i].close;
      const gapPercent = ((currOpen - prevClose) / prevClose) * 100;
      if (Math.abs(gapPercent) > 2) {
        gaps.push({
          time: data[i].date || i.toString(),
          prevClose, currOpen, gapPercent,
          isGapUp: gapPercent > 0
        });
      }
    }
    return gaps;
  }, []);

  const getProcessedChartData = useCallback(() => {
    if (!percentMode || data.length === 0) return data;
    const basePrice = data[0].close;
    return data.map(d => ({
      ...d,
      close: ((d.close - basePrice) / basePrice) * 100,
      high: ((d.high - basePrice) / basePrice) * 100,
      low: ((d.low - basePrice) / basePrice) * 100,
      open: ((d.open - basePrice) / basePrice) * 100
    }));
  }, [data, percentMode]);

  // --- Memoized Values ---
  const movingAveragesData = useMemo(() =>
    showMovingAverages && data.length ? calculateMovingAverages(data, [8, 13, 21, 55]) : [],
    [showMovingAverages, data, calculateMovingAverages]);

  const volumeProfileData = useMemo(() =>
    showVolumeProfile && data.length ? calculateVolumeProfile(data) : [],
    [showVolumeProfile, data, calculateVolumeProfile]);

  const priceGapsData = useMemo(() =>
    showGaps && data.length ? detectPriceGaps(data) : [],
    [showGaps, data, detectPriceGaps]);

  // --- Data Loading ---

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const periodMap: Record<string, string> = {
        '1D': '1d', '5D': '5d', '1M': '1mo', '3M': '3mo', '6M': '6mo', '1Y': '1y'
      };
      const mappedPeriod = periodMap[period] || '1mo';
      const interval = period === '1D' ? '1m' : '1d';

      const [profileResponse, historyResponse] = await Promise.all([
        marketService.getStockProfile(symbol),
        marketService.getStockHistory(symbol, mappedPeriod, interval)
      ]);

      if (profileResponse) setStockInfo(profileResponse);

      if ((historyResponse as any)?.data) {
        setData((historyResponse as any).data);
      }
    } catch (e) {
      toast.error('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  }, [symbol, period]);

  const loadMostActive = useCallback(async () => {
    try {
      const activeData = await marketService.getMostActive(10);
      if (Array.isArray(activeData)) setMostActive(activeData);
    } catch (error) {
      console.error('Failed to load active stocks', error);
    }
  }, []);

  // --- Effects ---
  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    loadMostActive();
    const interval = setInterval(loadMostActive, 60000);
    return () => clearInterval(interval);
  }, [loadMostActive]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  const handleSelectStock = (stock: any) => setSymbol(stock.symbol);

  const handleOpenDetailedChart = () => {
    router.push(`/stockchart/${symbol}/detailedpage`);
  };

  const isPositive = stockInfo ? (stockInfo.change || 0) >= 0 : true;

  return (
    <main className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">
          Technical Analysis
        </h1>
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center">
          <StockSearch onStockSelect={handleSelectStock} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="xl:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <ChartHeader
              symbol={symbol}
              period={period}
              dataLength={data.length}
              loading={loading}
              onRefresh={loadData}
              onAIAnalysis={() => setIsAIPanelOpen(true)}
              onCompare={() => router.push(`/stocks/comparison?stocks=${symbol}`)}
              onFullscreen={handleOpenDetailedChart}
            />

            <ChartControls
              period={period}
              chartType={chartType}
              showVolumeProfile={showVolumeProfile}
              showMovingAverages={showMovingAverages}
              showGaps={showGaps}
              showCorrelation={showCorrelation}
              percentMode={percentMode}
              onPeriodChange={setPeriod}
              onChartTypeChange={setChartType}
              onToggleVolumeProfile={() => setShowVolumeProfile(!showVolumeProfile)}
              onToggleMovingAverages={() => setShowMovingAverages(!showMovingAverages)}
              onToggleGaps={() => setShowGaps(!showGaps)}
              onToggleCorrelation={() => setShowCorrelation(!showCorrelation)}
              onTogglePercentMode={() => setPercentMode(!percentMode)}
            />

            <div className="p-3 sm:p-4">
              <ChartDisplay
                data={data}
                processedData={getProcessedChartData()}
                loading={loading}
                symbol={symbol}
                chartType={chartType}
                isPositive={isPositive}
                isFullscreen={isFullscreen}
                showVolumeProfile={showVolumeProfile}
                showMovingAverages={showMovingAverages}
                showGaps={showGaps}
                showCorrelation={showCorrelation}
                percentMode={percentMode}
                movingAveragesData={movingAveragesData}
                volumeProfileData={volumeProfileData}
                priceGapsData={priceGapsData}
                formatPrice={formatPrice}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              />

              <QuickStats data={data} formatPrice={formatPrice} />

              <MostActiveStocks
                stocks={mostActive}
                onSelectStock={handleSelectStock}
                formatPrice={formatPrice}
              />
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <MarketMovers onSelectStock={handleSelectStock} formatPrice={formatPrice} />
        </div>
      </div>

      <ChartAIPanel
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
        stockInfo={stockInfo}
        period={period}
        chartType={chartType}
        dataLength={data.length}
      />
    </main>
  );
}