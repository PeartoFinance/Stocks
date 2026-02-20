'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  Activity,
  Maximize2,
  Minimize2,
  BarChart3,
  LineChart,
  CandlestickChart,
  AreaChart,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  PieChart
} from 'lucide-react';
import { 
  createChart, 
  ColorType, 
  AreaSeries, 
  CandlestickSeries, 
  LineSeries, 
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  Time,
  CrosshairMode
} from 'lightweight-charts';
import { marketService } from '../../../utils/marketService';
import { HistoricalData } from '../../../types';
import { useCurrency } from '../../../context/CurrencyContext';
import { useTheme } from '../../../context/ThemeContext';

// Technical indicator types
type ChartType = 'candlestick' | 'line' | 'area' | 'bar' | 'heikinashi';
type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';
type Interval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1mo';

interface IndicatorSettings {
  sma: { visible: boolean; period: number; color: string };
  ema: { visible: boolean; period: number; color: string };
  rsi: { visible: boolean; period: number; color: string; upper: number; lower: number };
  macd: { visible: boolean; fast: number; slow: number; signal: number };
  bollinger: { visible: boolean; period: number; stdDev: number; upperColor: string; lowerColor: string };
  volume: { visible: boolean; color: string };
  atr: { visible: boolean; period: number; color: string };
}

export default function DetailedChartPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params?.symbol as string || 'AAPL';
  const { formatPrice, convertPrice } = useCurrency();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Chart refs
  const mainChartRef = useRef<HTMLDivElement>(null);
  const indicatorChartRef = useRef<HTMLDivElement>(null);
  const mainChartRefApi = useRef<IChartApi | null>(null);
  const indicatorChartRefApi = useRef<IChartApi | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const isInitialized = useRef(false);

  // Core state
  const [data, setData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockInfo, setStockInfo] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Chart settings state
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [interval, setInterval] = useState<Interval>('1d');

  // Indicator state
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    sma: { visible: true, period: 20, color: '#2563eb' },
    ema: { visible: false, period: 12, color: '#ea580c' },
    rsi: { visible: true, period: 14, color: '#8b5cf6', upper: 70, lower: 30 },
    macd: { visible: false, fast: 12, slow: 26, signal: 9 },
    bollinger: { visible: false, period: 20, stdDev: 2, upperColor: 'rgba(37, 99, 235, 0.3)', lowerColor: 'rgba(239, 68, 68, 0.3)' },
    volume: { visible: true, color: isDark ? 'rgba(100, 116, 139, 0.5)' : 'rgba(100, 116, 139, 0.5)' },
    atr: { visible: false, period: 14, color: '#10b981' },
  });

  const [showIndicators, setShowIndicators] = useState(true);

  // Cleanup function
  const cleanupCharts = useCallback(() => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    
    if (mainChartRefApi.current) {
      try {
        mainChartRefApi.current.remove();
      } catch (e) {
        // Ignore disposal errors
      }
      mainChartRefApi.current = null;
    }
    
    if (indicatorChartRefApi.current) {
      try {
        indicatorChartRefApi.current.remove();
      } catch (e) {
        // Ignore disposal errors
      }
      indicatorChartRefApi.current = null;
    }
    
    isInitialized.current = false;
  }, []);

  // Calculate SMA
  const calculateSMA = useCallback((data: HistoricalData[], period: number) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      sma.push({
        time: data[i].date.split('T')[0] as Time,
        value: sum / period
      });
    }
    return sma;
  }, []);

  // Calculate EMA
  const calculateEMA = useCallback((data: HistoricalData[], period: number) => {
    const ema = [];
    const multiplier = 2 / (period + 1);
    let sum = 0;
    
    for (let i = 0; i < period && i < data.length; i++) {
      sum += data[i].close;
    }
    let emaValue = sum / period;
    
    for (let i = period - 1; i < data.length; i++) {
      if (i === period - 1) {
        ema.push({ time: data[i].date.split('T')[0] as Time, value: emaValue });
      } else {
        emaValue = ((data[i].close - emaValue) * multiplier) + emaValue;
        ema.push({ time: data[i].date.split('T')[0] as Time, value: emaValue });
      }
    }
    return ema;
  }, []);

  // Calculate RSI
  const calculateRSI = useCallback((data: HistoricalData[], period: number) => {
    const rsi = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    for (let i = period; i < gains.length; i++) {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push({ time: data[i].date.split('T')[0] as Time, value: rsiValue });
    }
    return rsi;
  }, []);

  // Calculate MACD
  const calculateMACD = useCallback((data: HistoricalData[], fast: number, slow: number, signal: number) => {
    const fastEMA = calculateEMA(data, fast);
    const slowEMA = calculateEMA(data, slow);
    
    const macdLine: { time: Time; value: number }[] = [];
    const slowMap = new Map(slowEMA.map(d => [d.time, d.value]));
    
    for (const fastPoint of fastEMA) {
      const slowValue = slowMap.get(fastPoint.time);
      if (slowValue !== undefined) {
        macdLine.push({ time: fastPoint.time, value: fastPoint.value - slowValue });
      }
    }
    
    const signalLine: { time: Time; value: number }[] = [];
    const multiplier = 2 / (signal + 1);
    let signalValue = macdLine.slice(0, signal).reduce((a, b) => a + b.value, 0) / signal;
    
    for (let i = signal; i < macdLine.length; i++) {
      signalValue = ((macdLine[i].value - signalValue) * multiplier) + signalValue;
      signalLine.push({ time: macdLine[i].time, value: signalValue });
    }
    
    const histogram: { time: Time; value: number; color: string }[] = [];
    const signalMap = new Map(signalLine.map(d => [d.time, d.value]));
    
    for (const macdPoint of macdLine) {
      const signalValue = signalMap.get(macdPoint.time);
      if (signalValue !== undefined) {
        const value = macdPoint.value - signalValue;
        histogram.push({ 
          time: macdPoint.time, 
          value, 
          color: value >= 0 ? (isDark ? '#0aff8d' : '#10b981') : (isDark ? '#e02d75' : '#ef4444')
        });
      }
    }
    
    return { macdLine, signalLine, histogram };
  }, [calculateEMA, isDark]);

  // Calculate Bollinger Bands
  const calculateBollinger = useCallback((data: HistoricalData[], period: number, stdDev: number) => {
    const bands = [];
    const upperBand = [];
    const lowerBand = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const sma = slice.reduce((a, b) => a + b.close, 0) / period;
      const variance = slice.reduce((a, b) => a + Math.pow(b.close - sma, 2), 0) / period;
      const std = Math.sqrt(variance);
      
      const time = data[i].date.split('T')[0] as Time;
      bands.push({ time, sma, upper: sma + (stdDev * std), lower: sma - (stdDev * std) });
      upperBand.push({ time, value: sma + (stdDev * std) });
      lowerBand.push({ time, value: sma - (stdDev * std) });
    }
    
    return { bands, upperBand, lowerBand };
  }, []);

  // Calculate Heikin-Ashi
  const calculateHeikinAshi = useCallback((data: HistoricalData[]) => {
    const haData = [];
    let prevHA = { open: data[0].open, close: data[0].close };
    
    for (let i = 0; i < data.length; i++) {
      const haClose = (data[i].open + data[i].high + data[i].low + data[i].close) / 4;
      const haOpen = i === 0 ? data[i].open : (prevHA.open + prevHA.close) / 2;
      const haHigh = Math.max(data[i].high, haOpen, haClose);
      const haLow = Math.min(data[i].low, haOpen, haClose);
      
      const time = data[i].date.includes('T') ? data[i].date.split('T')[0] : data[i].date;
      
      haData.push({
        time: time as Time,
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose,
      });
      
      prevHA = { open: haOpen, close: haClose };
    }
    return haData;
  }, []);

  // Calculate ATR
  const calculateATR = useCallback((data: HistoricalData[], period: number) => {
    const atr = [];
    const trueRanges: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i - 1].close;
      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      trueRanges.push(tr);
    }
    
    let atrValue = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < trueRanges.length; i++) {
      atrValue = ((atrValue * (period - 1)) + trueRanges[i]) / period;
      atr.push({ time: data[i + 1].date.split('T')[0] as Time, value: atrValue });
    }
    
    return atr;
  }, []);

  // Format time for chart
  const formatTime = useCallback((dateStr: string): Time => {
    if (dateStr.includes('T')) {
      const date = new Date(dateStr);
      if (interval === '1m' || interval === '5m' || interval === '15m' || interval === '30m' || interval === '1h') {
        return Math.floor(date.getTime() / 1000) as Time;
      }
      return dateStr.split('T')[0] as Time;
    }
    return dateStr as Time;
  }, [interval]);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const periodMap: Record<Timeframe, string> = {
        '1D': '1d', '5D': '5d', '1M': '1mo', '3M': '3mo', '6M': '6mo', '1Y': '1y', '5Y': '5y', 'ALL': '10y'
      };
      const intervalMap: Record<Interval, string> = {
        '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m', '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1w', '1mo': '1mo'
      };

      const [profileResponse, historyResponse] = await Promise.all([
        marketService.getStockProfile(symbol),
        marketService.getStockHistory(symbol, periodMap[timeframe], intervalMap[interval])
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
  }, [symbol, timeframe, interval]);

  // Initialize charts
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      cleanupCharts();
    };
  }, [cleanupCharts]);

  // Create charts when data changes
  useEffect(() => {
    if (!mainChartRef.current || !indicatorChartRef.current || data.length === 0) return;

    // Always cleanup before creating new charts
    try {
      if (mainChartRefApi.current) {
        mainChartRefApi.current.remove();
        mainChartRefApi.current = null;
      }
      if (indicatorChartRefApi.current) {
        indicatorChartRefApi.current.remove();
        indicatorChartRefApi.current = null;
      }
    } catch (e) {
      // Ignore disposal errors
    }

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const gridColor = isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.5)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    // Main chart
    const mainChart = createChart(mainChartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor,
        attributionLogo: false,
      },
      width: mainChartRef.current.clientWidth,
      height: showIndicators && (indicators.rsi.visible || indicators.macd.visible) ? 500 : 700,
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      timeScale: {
        borderColor: isDark ? '#334155' : '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    });

    mainChartRefApi.current = mainChart;

    // Add main series based on chart type
    let mainSeries: ISeriesApi<any>;
    
    if (chartType === 'candlestick' || chartType === 'bar') {
      mainSeries = mainChart.addSeries(CandlestickSeries, {
        upColor: isDark ? '#0aff8d' : '#2563eb',
        downColor: isDark ? '#e02d75' : '#ef4444',
        borderVisible: false,
        wickUpColor: isDark ? '#0aff8d' : '#2563eb',
        wickDownColor: isDark ? '#e02d75' : '#ef4444',
      });
      mainSeries.setData(data.map(item => ({
        time: formatTime(item.date),
        open: convertPrice(item.open),
        high: convertPrice(item.high),
        low: convertPrice(item.low),
        close: convertPrice(item.close),
      })));
    } else if (chartType === 'heikinashi') {
      mainSeries = mainChart.addSeries(CandlestickSeries, {
        upColor: isDark ? '#0aff8d' : '#10b981',
        downColor: isDark ? '#e02d75' : '#ef4444',
        borderVisible: false,
        wickUpColor: isDark ? '#0aff8d' : '#10b981',
        wickDownColor: isDark ? '#e02d75' : '#ef4444',
      });
      const haData = calculateHeikinAshi(data);
      mainSeries.setData(haData.map(item => ({
        time: item.time,
        open: convertPrice(item.open),
        high: convertPrice(item.high),
        low: convertPrice(item.low),
        close: convertPrice(item.close),
      })));
    } else if (chartType === 'line') {
      mainSeries = mainChart.addSeries(LineSeries, {
        color: isDark ? '#0aff8d' : '#2563eb',
        lineWidth: 2,
      });
      mainSeries.setData(data.map(item => ({
        time: formatTime(item.date),
        value: convertPrice(item.close),
      })));
    } else if (chartType === 'area') {
      mainSeries = mainChart.addSeries(AreaSeries, {
        lineColor: isDark ? '#0aff8d' : '#2563eb',
        topColor: isDark ? 'rgba(10, 255, 141, 0.4)' : 'rgba(37, 99, 235, 0.4)',
        bottomColor: isDark ? 'rgba(10, 255, 141, 0.0)' : 'rgba(37, 99, 235, 0.0)',
        lineWidth: 2,
      });
      mainSeries.setData(data.map(item => ({
        time: formatTime(item.date),
        value: convertPrice(item.close),
      })));
    }

    // Add Volume
    if (indicators.volume.visible) {
      const volumeSeries = mainChart.addSeries(HistogramSeries, {
        color: isDark ? 'rgba(100, 116, 139, 0.5)' : 'rgba(100, 116, 139, 0.5)',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
      });
      volumeSeries.setData(data.map(item => ({
        time: formatTime(item.date),
        value: item.volume || 0,
      })));
    }

    // Add SMA
    if (indicators.sma.visible) {
      const smaSeries = mainChart.addSeries(LineSeries, {
        color: indicators.sma.color,
        lineWidth: 2,
      });
      const smaData = calculateSMA(data, indicators.sma.period);
      smaSeries.setData(smaData);
    }

    // Add EMA
    if (indicators.ema.visible) {
      const emaSeries = mainChart.addSeries(LineSeries, {
        color: indicators.ema.color,
        lineWidth: 2,
      });
      const emaData = calculateEMA(data, indicators.ema.period);
      emaSeries.setData(emaData);
    }

    // Add Bollinger Bands
    if (indicators.bollinger.visible) {
      const { upperBand, lowerBand } = calculateBollinger(data, indicators.bollinger.period, indicators.bollinger.stdDev);
      
      const upperSeries = mainChart.addSeries(LineSeries, {
        color: '#2563eb',
        lineWidth: 1,
        lineStyle: 2,
      });
      upperSeries.setData(upperBand);
      
      const lowerSeries = mainChart.addSeries(LineSeries, {
        color: '#ef4444',
        lineWidth: 1,
        lineStyle: 2,
      });
      lowerSeries.setData(lowerBand);
    }

    mainChart.timeScale().fitContent();

    // Indicator chart (RSI/MACD)
    if (showIndicators && (indicators.rsi.visible || indicators.macd.visible)) {
      const indicatorChart = createChart(indicatorChartRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: bgColor },
          textColor,
          attributionLogo: false,
        },
        width: indicatorChartRef.current.clientWidth,
        height: 200,
        grid: {
          vertLines: { color: gridColor },
          horzLines: { color: gridColor },
        },
        timeScale: {
          borderColor: isDark ? '#334155' : '#e2e8f0',
          visible: true,
        },
        rightPriceScale: {
          borderVisible: false,
        },
      });

      indicatorChartRefApi.current = indicatorChart;

      // Add RSI
      if (indicators.rsi.visible) {
        const rsiSeries = indicatorChart.addSeries(LineSeries, {
          color: indicators.rsi.color,
          lineWidth: 2,
        });
        const rsiData = calculateRSI(data, indicators.rsi.period);
        rsiSeries.setData(rsiData);
        rsiSeries.priceScale().applyOptions({
          scaleMargins: { top: 0.1, bottom: 0.1 },
        });
      }

      // Add MACD
      if (indicators.macd.visible) {
        const { macdLine, signalLine, histogram } = calculateMACD(data, indicators.macd.fast, indicators.macd.slow, indicators.macd.signal);
        
        const macdSeries = indicatorChart.addSeries(LineSeries, {
          color: '#2563eb',
          lineWidth: 1,
        });
        macdSeries.setData(macdLine);
        
        const signalSeries = indicatorChart.addSeries(LineSeries, {
          color: '#ea580c',
          lineWidth: 1,
        });
        signalSeries.setData(signalLine);
        
        const histSeries = indicatorChart.addSeries(HistogramSeries, {
          color: isDark ? '#0aff8d' : '#10b981',
        });
        histSeries.setData(histogram.map(d => ({ time: d.time, value: d.value })));
        
        histSeries.priceScale().applyOptions({
          scaleMargins: { top: 0.7, bottom: 0 },
        });
      }

      indicatorChart.timeScale().fitContent();
    }

    // Handle resize
    const handleResize = () => {
      if (mainChartRef.current && mainChartRefApi.current) {
        try {
          mainChartRefApi.current.applyOptions({ width: mainChartRef.current.clientWidth });
        } catch (e) {
          // Ignore resize errors
        }
      }
      if (indicatorChartRef.current && indicatorChartRefApi.current) {
        try {
          indicatorChartRefApi.current.applyOptions({ width: indicatorChartRef.current.clientWidth });
        } catch (e) {
          // Ignore resize errors
        }
      }
    };

    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(mainChartRef.current);

    isInitialized.current = true;
  }, [data, chartType, indicators, showIndicators, isDark, convertPrice, formatTime, calculateSMA, calculateEMA, calculateRSI, calculateMACD, calculateBollinger, calculateATR, calculateHeikinAshi]);

  // Load data on mount and when settings change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle indicator
  const toggleIndicator = (indicator: keyof IndicatorSettings) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: { ...prev[indicator], visible: !prev[indicator].visible }
    }));
  };

  // Chart type options
  const chartTypeOptions = [
    { value: 'candlestick', label: 'Candlestick', icon: CandlestickChart },
    { value: 'line', label: 'Line', icon: LineChart },
    { value: 'area', label: 'Area', icon: AreaChart },
    { value: 'bar', label: 'Bar', icon: BarChart3 },
    { value: 'heikinashi', label: 'Heikin-Ashi', icon: CandlestickChart },
  ] as const;

  // Timeframe options
  const timeframeOptions: Timeframe[] = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'ALL'];

  // Interval options
  const intervalOptions: Interval[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1mo'];

  return (
    <main className={`min-h-screen bg-gray-50 dark:bg-slate-900 ${isFullscreen ? 'fixed inset-0 z-50' : 'pt-6'}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => isFullscreen ? setIsFullscreen(false) : router.push('/chart')}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-105"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5 text-gray-700 dark:text-gray-300" /> : <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{symbol}</h1>
              {stockInfo && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {stockInfo.name || symbol} • <span className="font-semibold">{formatPrice(stockInfo.price || 0)}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-105"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5 text-gray-700 dark:text-gray-300" /> : <Maximize2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />}
            </button>

            {/* Settings toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-lg transition-all hover:scale-105 ${
                showSettings 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Refresh */}
            <button
              onClick={loadData}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-105 hover:rotate-180"
              title="Refresh Data"
            >
              <RefreshCw className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="max-w-[1600px] mx-auto px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Chart Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Chart Type</label>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1">
                {chartTypeOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setChartType(option.value)}
                      className={`flex-1 p-2 rounded-md transition-all ${
                        chartType === option.value
                          ? 'bg-white dark:bg-gray-600 shadow-md scale-105 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                      title={option.label}
                    >
                      <Icon className="h-4 w-4 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Timeframe</label>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1 overflow-x-auto">
                {timeframeOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => setTimeframe(option)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                      timeframe === option
                        ? 'bg-white dark:bg-gray-600 shadow-md scale-105 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Interval */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Interval</label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value as Interval)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
              >
                {intervalOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Indicators Toggle */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Indicators</label>
              <button
                onClick={() => setShowIndicators(!showIndicators)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                  showIndicators
                    ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {showIndicators ? <Eye className="h-4 w-4 inline mr-2" /> : <EyeOff className="h-4 w-4 inline mr-2" />}
                {showIndicators ? 'Hide All' : 'Show All'}
              </button>
            </div>
          </div>

          {/* Individual Indicators */}
          {showIndicators && (
            <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Technical Indicators</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { key: 'sma', label: 'SMA', icon: TrendingUp },
                { key: 'ema', label: 'EMA', icon: Activity },
                { key: 'rsi', label: 'RSI', icon: PieChart },
                { key: 'macd', label: 'MACD', icon: BarChart3 },
                { key: 'bollinger', label: 'Bollinger', icon: AreaChart },
                { key: 'volume', label: 'Volume', icon: BarChart3 },
                { key: 'atr', label: 'ATR', icon: Activity },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => toggleIndicator(key as keyof IndicatorSettings)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                    indicators[key as keyof IndicatorSettings].visible
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 shadow-md border-2 border-green-500 dark:border-green-600'
                      : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {indicators[key as keyof IndicatorSettings].visible && (
                    <span className="ml-auto text-xs font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
            </div>
          )}
          </div>
        </motion.div>
      )}

      {/* Chart Area */}
      <div className={`${isFullscreen ? 'h-[calc(100vh-80px)]' : ''}`}>
        <div className="max-w-[1600px] mx-auto px-6 py-6">
        {loading ? (
          <div className="h-[600px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Loading chart data...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[600px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Data Available</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Try selecting a different symbol or timeframe</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {/* Main Chart */}
            <div 
              ref={mainChartRef} 
              className="min-h-[500px]"
              style={{ height: showIndicators && (indicators.rsi.visible || indicators.macd.visible) ? '500px' : '700px' }}
            />

            {/* Indicator Chart */}
            {showIndicators && (indicators.rsi.visible || indicators.macd.visible) && (
              <div ref={indicatorChartRef} className="h-[200px] border-t border-gray-200 dark:border-gray-700" />
            )}
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
