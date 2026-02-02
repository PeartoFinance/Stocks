'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, AreaChart, CandlestickChart, LineChart, Search, Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { marketService } from '../utils/marketService';
import { stockAPI } from '../utils/api';
import { HistoricalData } from '../types';
import StockChart from '../components/StockChart';
import AIAnalysisPanel from '../components/ai/AIAnalysisPanel';
import toast from 'react-hot-toast';

export default function TechnicalChartPage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
  
  // Market Movers State
  const [topGainers, setTopGainers] = useState<any[]>([]);
  const [topLosers, setTopLosers] = useState<any[]>([]);
  const [mostActive, setMostActive] = useState<any[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [sparklineData, setSparklineData] = useState<{ [key: string]: number[] }>({});

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const sparklineRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  const periods = ['1D', '5D', '1M', '3M', '6M', '1Y'];
  const chartTypes = [
    { key: 'area', label: 'Area', icon: AreaChart },
    { key: 'candlestick', label: 'Candle', icon: CandlestickChart },
    { key: 'line', label: 'Line', icon: LineChart },
    { key: 'mountain', label: 'Mountain', icon: AreaChart },
  ] as const;

  // Calculate moving averages
  const calculateMovingAverages = useCallback((data: HistoricalData[], periods: number[]) => {
    return periods.map(period => {
      const ma = [];
      for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
        ma.push({
          time: data[i].date || i.toString(),
          value: sum / period
        });
      }
      return { period, data: ma };
    });
  }, []);

  // Calculate volume profile
  const calculateVolumeProfile = useCallback((data: HistoricalData[]) => {
    const priceRanges: { [key: string]: number } = {};
    const rangeSize = 1; // $1 price ranges
    
    data.forEach(d => {
      const priceRange = Math.floor(d.close / rangeSize) * rangeSize;
      priceRanges[priceRange] = (priceRanges[priceRange] || 0) + (d.volume || 0);
    });
    
    return Object.entries(priceRanges)
      .map(([price, volume]) => ({
        price: parseFloat(price),
        volume
      }))
      .sort((a, b) => a.price - b.price);
  }, []);

  // Detect price gaps
  const detectPriceGaps = useCallback((data: HistoricalData[]) => {
    const gaps = [];
    for (let i = 1; i < data.length; i++) {
      const prevClose = data[i - 1].close;
      const currOpen = data[i].open || data[i].close;
      const gapPercent = ((currOpen - prevClose) / prevClose) * 100;
      
      if (Math.abs(gapPercent) > 2) { // Gap > 2%
        gaps.push({
          time: data[i].date || i.toString(),
          prevClose,
          currOpen,
          gapPercent,
          isGapUp: gapPercent > 0
        });
      }
    }
    return gaps;
  }, []);

  // Convert data to percentage mode
  const convertToPercentage = useCallback((data: HistoricalData[]) => {
    if (data.length === 0) return [];
    const basePrice = data[0].close;
    return data.map(d => ({
      ...d,
      close: ((d.close - basePrice) / basePrice) * 100,
      high: ((d.high - basePrice) / basePrice) * 100,
      low: ((d.low - basePrice) / basePrice) * 100,
      open: ((d.open - basePrice) / basePrice) * 100
    }));
  }, []);

  // Get processed chart data
  const getProcessedChartData = useCallback(() => {
    let processedData = [...data];
    
    if (percentMode) {
      processedData = convertToPercentage(processedData);
    }
    
    return processedData;
  }, [data, percentMode, convertToPercentage]);

  // Get moving averages data
  const movingAveragesData = useMemo(() => {
    if (!showMovingAverages || data.length === 0) return [];
    return calculateMovingAverages(data, [8, 13, 21, 55]);
  }, [showMovingAverages, data, calculateMovingAverages]);

  // Get volume profile data
  const volumeProfileData = useMemo(() => {
    if (!showVolumeProfile || data.length === 0) return [];
    return calculateVolumeProfile(data);
  }, [showVolumeProfile, data, calculateVolumeProfile]);

  // Get price gaps data
  const priceGapsData = useMemo(() => {
    if (!showGaps || data.length === 0) return [];
    return detectPriceGaps(data);
  }, [showGaps, data, detectPriceGaps]);
  const loadMarketMovers = useCallback(async () => {
    try {
      setMarketLoading(true);
      const [gainersResponse, losersResponse] = await Promise.all([
        stockAPI.getMarketMovers('gainers'),
        stockAPI.getMarketMovers('losers')
      ]);

      if (gainersResponse.success && Array.isArray(gainersResponse.data)) {
        setTopGainers(gainersResponse.data);
        // Load sparkline data for gainers
        gainersResponse.data.forEach(async (stock: any) => {
          try {
            const historyResponse = await marketService.getStockHistory(stock.symbol, '5d', '1d');
            if (Array.isArray(historyResponse)) {
              const prices = historyResponse.slice(-7).map((item: any) => item.close);
              setSparklineData(prev => ({ ...prev, [stock.symbol]: prices }));
            }
          } catch (error) {
            console.error(`Failed to load sparkline for ${stock.symbol}:`, error);
          }
        });
      }

      if (losersResponse.success && Array.isArray(losersResponse.data)) {
        setTopLosers(losersResponse.data);
        // Load sparkline data for losers
        losersResponse.data.forEach(async (stock: any) => {
          try {
            const historyResponse = await marketService.getStockHistory(stock.symbol, '5d', '1d');
            if (Array.isArray(historyResponse)) {
              const prices = historyResponse.slice(-7).map((item: any) => item.close);
              setSparklineData(prev => ({ ...prev, [stock.symbol]: prices }));
            }
          } catch (error) {
            console.error(`Failed to load sparkline for ${stock.symbol}:`, error);
          }
        });
      }

      // Load most active stocks using marketService
      try {
        const mostActiveData = await marketService.getMostActive(10);
        if (Array.isArray(mostActiveData)) {
          setMostActive(mostActiveData);
        }
      } catch (error) {
        console.error('Failed to load most active stocks:', error);
        // Fallback: use gainers and losers combined as most active
        const combinedActive = [...gainersResponse.data, ...losersResponse.data]
          .sort((a, b) => (b.volume || 0) - (a.volume || 0))
          .slice(0, 10);
        setMostActive(combinedActive);
      }
    } catch (error) {
      console.error('Failed to load market movers:', error);
    } finally {
      setMarketLoading(false);
    }
  }, []);

  // Draw sparkline using Canvas API
  const drawSparkline = useCallback((canvas: HTMLCanvasElement, data: number[], isPositive: boolean) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || data.length === 0) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const color = isPositive ? '#008016' : '#d0021b';
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');
    
    // Draw filled area
    ctx.beginPath();
    ctx.moveTo(0, height);
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, []);

  // Draw sparklines when data changes
  useEffect(() => {
    Object.entries(sparklineData).forEach(([symbol, data]) => {
      const canvas = sparklineRefs.current[symbol];
      if (canvas && data.length > 0) {
        const stock = [...topGainers, ...topLosers].find(s => s.symbol === symbol);
        if (stock) {
          drawSparkline(canvas, data, stock.changePercent >= 0);
        }
      }
    });
  }, [sparklineData, topGainers, topLosers, drawSparkline]);

  // Load market movers on mount
  useEffect(() => {
    loadMarketMovers();
    const interval = setInterval(loadMarketMovers, 30000);
    return () => clearInterval(interval);
  }, [loadMarketMovers]);

  // Search for stocks with debouncing
  const searchStocks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await marketService.searchStocks(query, 8);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchStocks(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchStocks]);

  // Load data automatically when symbol or period changes
  useEffect(() => {
    if (symbol) {
      loadData();
    }
  }, [symbol, period]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, symbol, period]);

  const loadData = async () => {
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
      
      if (profileResponse) {
        setStockInfo(profileResponse);
      }
      
      if ((historyResponse as any)?.data) {
        const transformedData: HistoricalData[] = (historyResponse as any).data.map((item: any) => ({
          date: item.date,
          open: item.open || item.close,
          high: item.high || item.close,
          low: item.low || item.close,
          close: item.close,
          volume: item.volume || 0,
        }));
        setData(transformedData);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStock = (stock: any) => {
    setSymbol(stock.symbol);
    setSearchQuery(`${stock.symbol} - ${stock.name}`);
    setShowSuggestions(false);
    searchInputRef.current?.blur();
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const isPositive = stockInfo ? (stockInfo.change || 0) >= 0 : true;

  const MarketMoverItem = ({ stock, isGainer }: { stock: any; isGainer: boolean }) => (
    <div
      onClick={() => handleSelectStock(stock)}
      className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors border border-gray-100"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-medium text-xs text-gray-900 truncate">{stock.symbol}</span>
          <Activity className="h-3 w-3 text-gray-400 flex-shrink-0" />
        </div>
        <div className="text-xs text-gray-500 truncate">{stock.name}</div>
      </div>
      
      <div className="w-12 h-6 flex-shrink-0">
        <canvas
          ref={(el) => {
            sparklineRefs.current[stock.symbol] = el;
          }}
          width={48}
          height={24}
          className="w-full h-full"
        />
      </div>
      
      <div className="text-right flex-shrink-0">
        <div className={`text-xs font-medium tabular-nums ${
          isGainer ? 'text-[#008016]' : 'text-[#d0021b]'
        }`}>
          {formatPrice(stock.price || 0)}
        </div>
        <div className={`text-xs font-medium tabular-nums ${
          isGainer ? 'text-[#008016]' : 'text-[#d0021b]'
        }`}>
          {isGainer ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%
        </div>
      </div>
    </div>
  );

  return (
    <main className="p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Technical Chart Analysis
        </h1>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search stocks..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => handleSelectStock(stock)}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-sm text-gray-900">{stock.symbol}</span>
                          <span className="text-xs text-gray-500 ml-2">{stock.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatPrice(stock.price || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Chart Section */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Chart Filters */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {symbol} - {period} Chart
                  </h3>
                  <span className="text-xs text-gray-500">
                    {data.length} points • {period === '1D' ? '1-min' : 'Daily'}
                  </span>
                  <button
                    onClick={() => setIsAIPanelOpen(true)}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Brain className="h-3 w-3" />
                    AI Analysis
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                    onClick={() => {
                      // TODO: Implement compare functionality
                      toast('Compare feature coming soon!');
                    }}
                    title="Compare"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Compare
                  </button>
                </div>
              </div>
              
              {/* Period and Chart Type Filters */}
              <div className="flex flex-wrap gap-3 mt-3">
                {/* Period Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">Period:</span>
                  <div className="flex gap-1">
                    {periods.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          period === p
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart Type Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">Type:</span>
                  <div className="flex gap-1">
                    {chartTypes.map((type) => (
                      <button
                        key={type.key}
                        onClick={() => setChartType(type.key)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                          chartType === type.key
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <type.icon className="h-3 w-3" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Analytical Controls */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => setShowVolumeProfile(!showVolumeProfile)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      showVolumeProfile ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Volume Profile
                  </button>
                  <button
                    onClick={() => setShowMovingAverages(!showMovingAverages)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      showMovingAverages ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    MA Ribbon
                  </button>
                  <button
                    onClick={() => setShowGaps(!showGaps)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      showGaps ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Price Gaps
                  </button>
                  <button
                    onClick={() => setPercentMode(!percentMode)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      percentMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    % Mode
                  </button>
                  <button
                    onClick={() => setShowCorrelation(!showCorrelation)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      showCorrelation ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Correlation
                  </button>
                </div>
              </div>
            </div>
            
            {/* Chart Stats - Above Chart */}
            {data.length > 0 && (
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(() => {
                      const latest = data[data.length - 1];
                      const first = data[0];
                      const high = Math.max(...data.map(d => d.high));
                      const low = Math.min(...data.map(d => d.low));
                      const totalVolume = data.reduce((sum, d) => sum + (d.volume || 0), 0);
                      
                      return [
                        { 
                          label: 'Current', 
                          value: formatPrice(latest.close), 
                          change: latest.close - first.close,
                          changePercent: ((latest.close - first.close) / first.close * 100),
                          color: 'blue' 
                        },
                        { 
                          label: 'High', 
                          value: formatPrice(high), 
                          change: high - first.close,
                          changePercent: ((high - first.close) / first.close * 100),
                          color: 'green' 
                        },
                        { 
                          label: 'Low', 
                          value: formatPrice(low), 
                          change: low - first.close,
                          changePercent: ((low - first.close) / first.close * 100),
                          color: 'red' 
                        },
                        { 
                          label: 'Volume', 
                          value: `${(totalVolume / 1e6).toFixed(1)}M`, 
                          change: null,
                          changePercent: null,
                          color: 'purple' 
                        }
                      ].map((stat, i) => (
                        <div key={i} className={`p-2 rounded-lg border bg-white`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                            <div className={`w-1.5 h-1.5 rounded-full bg-${stat.color}-500`} />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                            {stat.change !== null && (
                              <div className={`text-xs font-medium ${
                                stat.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {stat.changePercent >= 0 ? '+' : ''}{stat.changePercent.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                  
                  {/* Fullscreen Button */}
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                    title="Toggle Fullscreen"
                  >
                    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isFullscreen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            <div className="p-4">
              {loading ? (
                <div className="h-96 md:h-[500px] flex items-center justify-center text-gray-500">
                  <Activity className="h-8 w-8 animate-spin mr-3" />
                  <span className="text-sm">Loading chart data...</span>
                </div>
              ) : data.length === 0 ? (
                <div className="h-96 md:h-[500px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Search for a Stock</h3>
                    <p className="text-sm text-gray-600">Enter a stock symbol or name to view its chart</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Chart Container */}
                  <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white p-8' : ''}`}>
                    {isFullscreen && (
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">{symbol} - Fullscreen Chart</h2>
                        <button
                          onClick={() => setIsFullscreen(false)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    <div className={`${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96 md:h-[500px]'} relative`}>
                      <StockChart
                        data={getProcessedChartData()}
                        isPositive={isPositive}
                        height={isFullscreen ? window.innerHeight - 120 : 384}
                        chartType={chartType}
                      />
                      
                      {/* Moving Averages Overlay */}
                      {showMovingAverages && movingAveragesData.length > 0 && (
                        <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded text-xs">
                          <div className="font-semibold mb-1">MA Ribbon</div>
                          {movingAveragesData.map((ma: any) => (
                            <div key={ma.period} className="flex items-center gap-2">
                              <div className={`w-3 h-0.5 ${
                                ma.period === 8 ? 'bg-blue-500' :
                                ma.period === 13 ? 'bg-green-500' :
                                ma.period === 21 ? 'bg-orange-500' :
                                'bg-red-500'
                              }`} />
                              <span>MA{ma.period}: {ma.data.length > 0 ? formatPrice(ma.data[ma.data.length - 1].value) : 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Volume Profile Overlay */}
                      {showVolumeProfile && volumeProfileData.length > 0 && (
                        <div className="absolute top-2 right-12 bg-white bg-opacity-90 p-2 rounded text-xs max-w-32">
                          <div className="font-semibold mb-1">Volume Profile</div>
                          {volumeProfileData.slice(-5).map((vp: any, i: number) => (
                            <div key={i} className="flex justify-between gap-2">
                              <span>${vp.price}</span>
                              <span>{(vp.volume / 1e6).toFixed(1)}M</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Price Gaps Overlay */}
                      {showGaps && priceGapsData.length > 0 && (
                        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 p-2 rounded text-xs">
                          <div className="font-semibold mb-1">Price Gaps</div>
                          {priceGapsData.slice(0, 3).map((gap: any, i: number) => (
                            <div key={i} className={`flex items-center gap-1 ${gap.isGapUp ? 'text-green-600' : 'text-red-600'}`}>
                              <span>{gap.isGapUp ? '↑' : '↓'}</span>
                              <span>{gap.gapPercent.toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Percent Mode Indicator */}
                      {percentMode && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Percentage Mode (%)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Stats Table */}
                  {data.length > 0 && !isFullscreen && (
                    <div className="border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Quick Stats</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(() => {
                          const latest = data[data.length - 1];
                          const first = data[0];
                          const high = Math.max(...data.map(d => d.high));
                          const low = Math.min(...data.map(d => d.low));
                          const avgVolume = data.reduce((sum, d) => sum + (d.volume || 0), 0) / data.length;
                          
                          // Calculate RSI (simplified)
                          const gains = [];
                          const losses = [];
                          for (let i = 1; i < data.length; i++) {
                            const change = data[i].close - data[i-1].close;
                            if (change > 0) gains.push(change);
                            else if (change < 0) losses.push(Math.abs(change));
                          }
                          const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
                          const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
                          const rs = avgLoss > 0 ? avgGain / avgLoss : 0;
                          const rsi = 100 - (100 / (1 + rs));
                          
                          return [
                            { label: '52-Week High/Low', value: `${formatPrice(high)} / ${formatPrice(low)}` },
                            { label: 'Avg. Daily Volume', value: `${(avgVolume / 1e6).toFixed(1)}M Shares` },
                            { label: 'Volatility (Beta)', value: '1.15' }, // Placeholder
                            { label: 'Current RSI', value: `${rsi.toFixed(0)} (${rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'})` }
                          ];
                        })().map((stat, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
                            <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Most Active Stocks Below Chart */}
                  {mostActive.length > 0 && !isFullscreen && (
                    <div className="border-t border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <h4 className="text-sm font-semibold text-gray-900">Most Active Stocks</h4>
                          <span className="text-xs text-gray-500">({mostActive.length} stocks)</span>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <div className="flex gap-2 pb-1">
                          {mostActive.slice(0, 10).map((stock) => {
                            const isPositive = (stock.changePercent || 0) >= 0;
                            const bgColor = isPositive ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-red-50 to-red-100';
                            const borderColor = isPositive ? 'border-green-300 hover:border-green-400 hover:bg-green-100' : 'border-red-300 hover:border-red-400 hover:bg-red-100';
                            
                            return (
                              <div
                                key={stock.symbol}
                                onClick={() => handleSelectStock(stock)}
                                className={`flex-shrink-0 p-2 border rounded-lg cursor-pointer transition-all min-w-[160px] ${bgColor} ${borderColor}`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm text-gray-900 truncate">{stock.symbol}</span>
                                  <Activity className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                </div>
                                <div className="text-xs text-gray-600 truncate mb-1">{stock.name}</div>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="text-sm font-bold text-gray-900">
                                    {formatPrice(stock.price || 0)}
                                  </div>
                                  <div className={`text-xs font-bold ${
                                    isPositive ? 'text-green-700' : 'text-red-700'
                                  }`}>
                                    {stock.changePercent !== undefined && stock.changePercent !== null 
                                      ? `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`
                                      : stock.change !== undefined && stock.change !== null
                                        ? `${stock.change >= 0 ? '+' : ''}${((stock.change / (stock.price - stock.change)) * 100).toFixed(2)}%`
                                        : '0.00%'
                                    }
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Vol: {((stock.volume || 0) / 1e6).toFixed(1)}M
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Correlation Matrix */}
                  {showCorrelation && !isFullscreen && (
                    <div className="border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Correlation Matrix (90 days)</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-2 py-1 text-left font-medium text-gray-900">Symbol</th>
                              <th className="px-2 py-1 text-center font-medium text-gray-900">AAPL</th>
                              <th className="px-2 py-1 text-center font-medium text-gray-900">MSFT</th>
                              <th className="px-2 py-1 text-center font-medium text-gray-900">GOOGL</th>
                              <th className="px-2 py-1 text-center font-medium text-gray-900">TSLA</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="px-2 py-1 font-medium">{symbol}</td>
                              <td className="px-2 py-1 text-center">0.85</td>
                              <td className="px-2 py-1 text-center">0.72</td>
                              <td className="px-2 py-1 text-center">0.68</td>
                              <td className="px-2 py-1 text-center">0.45</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Market Movers */}
        <div className="xl:col-span-1 space-y-4">
          {/* Market Movers */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Market Movers</h3>
              {marketLoading && (
                <RefreshCw className="h-3 w-3 text-gray-400 animate-spin" />
              )}
            </div>
            
            {/* 2-Column Layout */}
            <div className="grid grid-cols-2 gap-3">
              {/* Top Gainers Column */}
              <div>
                <div className="flex items-center gap-1 mb-2 p-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <TrendingUp className="h-3 w-3 text-[#008016]" />
                  <span className="text-xs font-medium text-[#008016]">Gainers</span>
                </div>
                <div className="space-y-1">
                  {topGainers.slice(0, 5).map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => handleSelectStock(stock)}
                      className="p-2 border border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs text-gray-900 truncate">{stock.symbol}</span>
                        <Activity className="h-2.5 w-2.5 text-green-400 flex-shrink-0" />
                      </div>
                      <div className="text-xs text-gray-600 truncate mb-1">
                        {stock.name ? (stock.name.split(' ')[0].length > 6 ? stock.name.split(' ')[0].substring(0, 6) : stock.name.split(' ')[0]) : ''}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{formatPrice(stock.price || 0)}</span>
                        <span className="text-xs font-bold text-[#008016]">
                          +{(stock.changePercent || 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Top Losers Column */}
              <div>
                <div className="flex items-center gap-1 mb-2 p-2 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                  <TrendingDown className="h-3 w-3 text-[#d0021b]" />
                  <span className="text-xs font-medium text-[#d0021b]">Losers</span>
                </div>
                <div className="space-y-1">
                  {topLosers.slice(0, 5).map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => handleSelectStock(stock)}
                      className="p-2 border border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs text-gray-900 truncate">{stock.symbol}</span>
                        <Activity className="h-2.5 w-2.5 text-red-400 flex-shrink-0" />
                      </div>
                      <div className="text-xs text-gray-600 truncate mb-1">
                        {stock.name ? (stock.name.split(' ')[0].length > 6 ? stock.name.split(' ')[0].substring(0, 6) : stock.name.split(' ')[0]) : ''}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{formatPrice(stock.price || 0)}</span>
                        <span className="text-xs font-bold text-[#d0021b]">
                          {(stock.changePercent || 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sliding AI Panel */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isAIPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* AI Panel Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">AI Analysis</h3>
              </div>
              <button
                onClick={() => setIsAIPanelOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* AI Panel Content */}
          <div className="flex-1 overflow-y-auto">
            <AIAnalysisPanel
              title=""
              pageType="chart"
              pageData={{
                symbol: stockInfo?.symbol,
                name: stockInfo?.name,
                price: stockInfo?.price,
                change: stockInfo?.change,
                changePercent: stockInfo?.changePercent,
                volume: stockInfo?.volume,
                period: period,
                chartType: chartType,
                dataPoints: data.length
              }}
              quickPrompts={[
                "Analyze chart pattern",
                "Predict price movement",
                "Support/resistance levels",
                "Market sentiment",
                "Risk analysis"
              ]}
              compact={false}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isAIPanelOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsAIPanelOpen(false)}
        />
      )}
    </main>
  );
}
