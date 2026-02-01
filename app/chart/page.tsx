'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
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

  // Load market movers data
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
          Technical Chart
        </h1>
        <p className="text-gray-600">Interactive price chart with real-time data and AI-powered analysis.</p>
      </motion.div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-3 md:p-4 shadow-lg border border-gray-100 mb-4">
        <div className="flex flex-col gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search stocks..."
              />
              {loading && (
                <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 animate-spin" />
              )}
            </div>
            
            {/* Search Suggestions */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock)}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{stock.symbol}</div>
                        <div className="text-xs text-gray-500 truncate">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 text-sm">{formatPrice(stock.price || 0)}</div>
                        <div className={`text-xs ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.changePercent >= 0 ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Stock Info */}
          {stockInfo && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  {stockInfo.name} ({stockInfo.symbol})
                </h2>
                <p className="text-xs text-gray-500">{stockInfo.sector} • {stockInfo.exchange}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">
                  {formatPrice(stockInfo.price || 0)}
                </div>
                <div className={`text-xs font-medium flex items-center justify-end gap-1 ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isPositive ? '+' : ''}{(stockInfo.changePercent || 0).toFixed(2)}%
                </div>
              </div>
            </div>
          )}
          
          {/* Period and Chart Type Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Period Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {periods.map(p => (
                <button 
                  key={p} 
                  onClick={() => setPeriod(p)} 
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                    period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            
            {/* Chart Type Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {chartTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setChartType(type.key)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all ${
                    chartType === type.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <type.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              ))}
            </div>

            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {autoRefresh ? 'Auto ON' : 'Auto OFF'}
            </button>
          </div>
        </div>
      </div>

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
                </div>
              </div>
            </div>
            
            {/* Chart Stats - Above Chart */}
            {data.length > 0 && (
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-4 gap-3">
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
                <div>
                  <div className="h-96 md:h-[500px]">
                    <StockChart
                      data={data}
                      isPositive={isPositive}
                      height={384}
                      chartType={chartType}
                    />
                  </div>
                  
                  {/* Most Active Stocks Below Chart */}
                  {mostActive.length > 0 && (
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Market Movers & AI */}
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

          {/* AI Analysis Panel */}
          <AIAnalysisPanel
            title="AI Analysis"
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
            compact={true}
            className="flex-1"
          />
        </div>
      </div>
    </main>
  );
}
