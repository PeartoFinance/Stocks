'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Star, 
  ArrowUpDown, 
  X, 
  Plus,
  Brain,
  Maximize2,
  Minimize2,
  BarChart3,
  Users, 
  Zap, 
  LineChart, 
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { marketService } from '../../utils/marketService';
import { Stock, HistoricalData } from '../../types';
import StockChart from '../../components/StockChart';
import MultiStockChart from '../../components/MultiStockChart';
import AIAnalysisPanel from '../../components/ai/AIAnalysisPanel';

interface ComparisonStock extends Stock {
  color: string;
  historicalData?: HistoricalData[];
}

const STOCK_COLORS = [
  '#3b82f6', // Bright Blue
  '#ef4444', // Bright Red  
  '#10b981', // Emerald Green
  '#f59e0b', // Amber
  '#8b5cf6'  // Violet
];

export default function StockComparison() {
  const [comparedStocks, setComparedStocks] = useState<ComparisonStock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('overview');
  const [chartPeriod, setChartPeriod] = useState('1Y'); // Changed default to 1Y for full data
  const [chartType, setChartType] = useState<'line' | 'area' | 'candle'>('line');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const periods = ['1D', '5D', '1M', '3M', '6M', '1Y'];

  const categories = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'valuation', label: 'Valuation', icon: DollarSign },
    { key: 'profitability', label: 'Profitability', icon: TrendingUp },
    { key: 'financial', label: 'Financial Health', icon: BarChart3 },
    { key: 'trading', label: 'Trading Data', icon: Zap }
  ];

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatNumber = (num: number | undefined | null, decimals = 2): string => {
    if (num == null) return '-';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatLargeNumber = (num: number | undefined | null): string => {
    if (num == null) return '-';
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  // Fullscreen functions
  const enterFullscreen = () => {
    const chartContainer = document.getElementById('chart-container');
    if (chartContainer) {
      if (chartContainer.requestFullscreen) {
        chartContainer.requestFullscreen();
      } else if ((chartContainer as any).webkitRequestFullscreen) {
        (chartContainer as any).webkitRequestFullscreen();
      } else if ((chartContainer as any).msRequestFullscreen) {
        (chartContainer as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Search stocks using backend API
  useEffect(() => {
    const searchStocks = async () => {
      if (searchTerm.length >= 2) {
        try {
          setLoading(true);
          const response = await marketService.searchStocks(searchTerm, 10);
          if (Array.isArray(response)) {
            const transformedResults: Stock[] = response.map((item: any) => ({
              symbol: item.symbol,
              name: item.name,
              price: item.price || 0,
              change: item.change || 0,
              changePercent: item.changePercent || 0,
              volume: item.volume,
              marketCap: item.marketCap,
              peRatio: item.peRatio,
              eps: item.eps,
              sector: item.sector,
              industry: item.industry,
              exchange: item.exchange,
              currency: item.currency || 'USD'
            }));
            setSearchResults(transformedResults);
          }
        } catch (error) {
          console.error('Search error:', error);
          toast.error('Failed to search stocks');
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchStocks, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Load historical data for comparison chart
  // For 1D period, uses minute-wise data (1m interval) from backend
  // For other periods, uses daily data (1d interval)
  const loadHistoricalData = async (stocks: ComparisonStock[], period: string) => {
    if (stocks.length === 0) return;
    
    try {
      setChartLoading(true);
      const periodMap: Record<string, string> = {
        '1D': '1d', '5D': '5d', '1M': '1mo', '3M': '3mo', '6M': '6mo', '1Y': '1y'
      };
      const mappedPeriod = periodMap[period] || '1mo';
      
      // Use minute interval for 1D period, daily interval for others
      const interval = period === '1D' ? '1m' : '1d';

      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            // Fetch data from backend API with appropriate interval
            const historyResponse = await marketService.getStockHistory(stock.symbol, mappedPeriod, interval);
            
            if ((historyResponse as any)?.data && Array.isArray((historyResponse as any).data)) {
              // Transform data and ensure proper date formatting for minute-wise data
              const transformedData: HistoricalData[] = (historyResponse as any).data
                .map((item: any) => ({
                  date: item.date, // Backend returns ISO format with time for minute data
                  open: item.open || item.close || 0,
                  high: item.high || item.close || 0,
                  low: item.low || item.close || 0,
                  close: item.close || 0,
                  volume: item.volume || 0,
                }))
                .sort((a: HistoricalData, b: HistoricalData) => {
                  // Sort by date to ensure chronological order (important for minute data)
                  return new Date(a.date).getTime() - new Date(b.date).getTime();
                });
              
              return { ...stock, historicalData: transformedData };
            }
            return stock;
          } catch (error) {
            console.error(`Error loading data for ${stock.symbol}:`, error);
            toast.error(`Failed to load data for ${stock.symbol}`);
            return stock;
          }
        })
      );

      setComparedStocks(updatedStocks);
    } catch (error) {
      console.error('Error loading historical data:', error);
      toast.error('Failed to load historical data');
    } finally {
      setChartLoading(false);
    }
  };

  const addToComparison = async (stock: Stock) => {
    if (comparedStocks.length >= 5) {
      toast.error('You can compare up to 5 stocks at a time');
      return;
    }

    if (comparedStocks.find(s => s.symbol === stock.symbol)) {
      toast.error('Stock already added to comparison');
      return;
    }

    try {
      setLoading(true);
      // Get full stock profile
      const profileResponse = await marketService.getStockProfile(stock.symbol);
      
      if (profileResponse) {
        const apiResponse = profileResponse as any;
        const fullStock: ComparisonStock = {
          symbol: apiResponse.symbol || stock.symbol,
          name: apiResponse.name || stock.name,
          price: apiResponse.price || stock.price,
          change: apiResponse.change || stock.change,
          changePercent: apiResponse.changePercent || stock.changePercent,
          volume: apiResponse.volume,
          marketCap: apiResponse.marketCap,
          peRatio: apiResponse.peRatio,
          eps: apiResponse.eps,
          dividendYield: apiResponse.dividendYield,
          week52High: apiResponse.high52w,
          week52Low: apiResponse.low52w,
          beta: apiResponse.beta,
          sector: apiResponse.sector,
          industry: apiResponse.industry,
          description: apiResponse.description,
          open: apiResponse.open,
          high: apiResponse.dayHigh,
          low: apiResponse.dayLow,
          previousClose: apiResponse.previousClose,
          avgVolume: apiResponse.avgVolume,
          forwardPe: apiResponse.forwardPe,
          exchange: apiResponse.exchange,
          currency: apiResponse.currency,
          color: STOCK_COLORS[comparedStocks.length],
          lastUpdated: apiResponse.lastUpdated,
        };

        const newStocks = [...comparedStocks, fullStock];
        setComparedStocks(newStocks);
        
        // Load historical data for all stocks
        await loadHistoricalData(newStocks, chartPeriod);
        
        setSearchTerm('');
        setSearchResults([]);
        toast.success(`${stock.symbol} added to comparison`);
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Failed to add stock to comparison');
    } finally {
      setLoading(false);
    }
  };

  const removeFromComparison = (symbol: string) => {
    const newStocks = comparedStocks.filter(s => s.symbol !== symbol);
    // Reassign colors
    const updatedStocks = newStocks.map((stock, index) => ({
      ...stock,
      color: STOCK_COLORS[index]
    }));
    setComparedStocks(updatedStocks);
    toast.success(`${symbol} removed from comparison`);
  };

  const handlePeriodChange = (period: string) => {
    setChartPeriod(period);
    setChartLoading(true);
    loadHistoricalData(comparedStocks, period);
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('desc');
    }
  };

  const exportToCSV = () => {
    if (comparedStocks.length === 0) return;
    
    const headers = ['Metric', ...comparedStocks.map(s => s.symbol)];
    const metrics = getMetricsForExport();
    
    const csvContent = [
      headers.join(','),
      ...metrics.map(metric => [
        metric.label,
        ...comparedStocks.map(stock => {
          const value = stock[metric.key as keyof ComparisonStock];
          return formatValueForExport(value, metric.format);
        })
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Comparison data exported to CSV');
  };

  const getMetricsForExport = () => {
    return [
      { key: 'symbol', label: 'Symbol', format: 'text' },
      { key: 'name', label: 'Company Name', format: 'text' },
      { key: 'price', label: 'Stock Price', format: 'currency' },
      { key: 'change', label: 'Change ($)', format: 'currency' },
      { key: 'changePercent', label: 'Change (%)', format: 'percentage' },
      { key: 'marketCap', label: 'Market Cap', format: 'number' },
      { key: 'peRatio', label: 'P/E Ratio', format: 'number' },
      { key: 'eps', label: 'EPS', format: 'currency' },
      { key: 'dividendYield', label: 'Dividend Yield', format: 'percentage' },
      { key: 'volume', label: 'Volume', format: 'number' },
      { key: 'beta', label: 'Beta', format: 'number' },
      { key: 'sector', label: 'Sector', format: 'text' },
      { key: 'industry', label: 'Industry', format: 'text' }
    ];
  };

  const formatValueForExport = (value: any, format: string) => {
    if (value == null || value === undefined) return '';
    
    switch (format) {
      case 'currency':
        return Number(value).toFixed(2);
      case 'percentage':
        return Number(value).toFixed(2);
      case 'number':
        return Number(value).toString();
      case 'text':
      default:
        return String(value).replace(/,/g, ';'); // Replace commas to avoid CSV issues
    }
  };

  const renderComparisonTable = () => {
    if (comparedStocks.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No stocks to compare</h3>
          <p className="text-sm text-gray-600">Search and add stocks to start comparing</p>
        </div>
      );
    }

    const getMetrics = () => {
      switch (activeCategory) {
        case 'overview':
          return [
            { key: 'price', label: 'Stock Price', format: 'currency' },
            { key: 'change', label: 'Change ($)', format: 'currency' },
            { key: 'changePercent', label: 'Change (%)', format: 'percentage' },
            { key: 'marketCap', label: 'Market Cap', format: 'marketCap' },
            { key: 'sector', label: 'Sector', format: 'text' },
            { key: 'industry', label: 'Industry', format: 'text' }
          ];
        case 'valuation':
          return [
            { key: 'peRatio', label: 'P/E Ratio', format: 'number' },
            { key: 'forwardPe', label: 'Forward P/E', format: 'number' },
            { key: 'eps', label: 'EPS', format: 'currency' },
            { key: 'dividendYield', label: 'Div Yield (%)', format: 'percentage' },
            { key: 'week52High', label: '52W High', format: 'currency' },
            { key: 'week52Low', label: '52W Low', format: 'currency' }
          ];
        case 'profitability':
          return [
            { key: 'marketCap', label: 'Market Cap', format: 'marketCap' },
            { key: 'peRatio', label: 'P/E Ratio', format: 'number' },
            { key: 'eps', label: 'EPS', format: 'currency' },
            { key: 'beta', label: 'Beta', format: 'number' },
            { key: 'dividendYield', label: 'Dividend Yield', format: 'percentage' }
          ];
        case 'financial':
          return [
            { key: 'marketCap', label: 'Market Cap', format: 'marketCap' },
            { key: 'volume', label: 'Volume', format: 'volume' },
            { key: 'avgVolume', label: 'Avg Volume', format: 'volume' },
            { key: 'beta', label: 'Beta', format: 'number' },
            { key: 'exchange', label: 'Exchange', format: 'text' }
          ];
        case 'trading':
          return [
            { key: 'volume', label: 'Volume', format: 'volume' },
            { key: 'avgVolume', label: 'Avg Volume', format: 'volume' },
            { key: 'week52High', label: '52W High', format: 'currency' },
            { key: 'week52Low', label: '52W Low', format: 'currency' },
            { key: 'beta', label: 'Beta', format: 'number' }
          ];
        default:
          return [];
      }
    };

    const formatValue = (value: any, format: string) => {
      if (value == null || value === undefined) return '-';
      
      switch (format) {
        case 'currency':
          return formatPrice(Number(value));
        case 'percentage':
          return `${Number(value).toFixed(2)}%`;
        case 'number':
          return Number(value).toFixed(2);
        case 'marketCap':
          return formatLargeNumber(Number(value));
        case 'volume':
          return formatLargeNumber(Number(value));
        case 'text':
        default:
          return String(value);
      }
    };

    const metrics = getMetrics();

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 font-medium text-gray-700">
                <button
                  onClick={() => handleSort('metric')}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  Metric
                  {sortBy === 'metric' && (
                    <ArrowUpDown className={`h-3 w-3 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
              </th>
              {comparedStocks.map((stock) => (
                <th key={stock.symbol} className="text-center py-2 px-3">
                  <div className="flex flex-col items-center space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full shadow-md border-2 border-white" 
                        style={{ backgroundColor: stock.color }}
                      />
                      <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {stock.symbol}
                      </Link>
                    </div>
                    <span className="text-xs text-gray-500 text-center truncate max-w-20">{stock.name}</span>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                      stock.changePercent >= 0 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, index) => {
              const shouldHighlight = metric.format === 'currency' || metric.format === 'marketCap' || metric.format === 'percentage';
              const values = comparedStocks.map(stock => stock[metric.key as keyof ComparisonStock]);
              const numValues = values.filter(v => v != null && v !== undefined && !isNaN(Number(v))).map(Number);
              const maxValue = numValues.length > 0 ? Math.max(...numValues) : 0;
              const minValue = numValues.length > 0 ? Math.min(...numValues) : 0;
              
              return (
                <tr key={metric.key} className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}>
                  <td className="py-2 px-3 font-medium text-gray-700">
                    <button
                      onClick={() => handleSort(metric.key)}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      {metric.label}
                      {sortBy === metric.key && (
                        <ArrowUpDown className={`h-3 w-3 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  </td>
                  {comparedStocks.map((stock) => {
                    const value = stock[metric.key as keyof ComparisonStock];
                    const numValue = Number(value);
                    const isNegative = metric.format === 'percentage' && numValue < 0;
                    const isBest = shouldHighlight && numValue === maxValue && numValue > 0;
                    const isWorst = shouldHighlight && numValue === minValue && numValue > 0;
                    
                    let cellClass = 'font-medium text-sm py-1 px-3 text-center ';
                    if (metric.key === 'change' || metric.key === 'changePercent') {
                      cellClass += isNegative ? 'text-red-600' : 'text-green-600';
                    } else if (isBest && (metric.key === 'price' || metric.key === 'marketCap' || metric.key === 'eps')) {
                      cellClass += 'text-green-700 font-semibold';
                    } else if (isWorst && (metric.key === 'price' || metric.key === 'marketCap' || metric.key === 'eps')) {
                      cellClass += 'text-red-600';
                    } else {
                      cellClass += 'text-gray-700';
                    }
                    
                    return (
                      <td key={`${stock.symbol}-${metric.key}`} className={cellClass}>
                        <div className="flex items-center justify-center">
                          <span className="px-2 py-0.5 rounded-md bg-white border border-gray-100">
                            {formatValue(value, metric.format)}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderComparisonChart = () => {
    if (comparedStocks.length === 0) return null;

    const stocksWithData = comparedStocks.filter(stock => stock.historicalData && stock.historicalData.length > 0);
    
    if (stocksWithData.length === 0) {
      return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-center py-8">
            <LineChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Chart Data Available</h3>
            <p className="text-sm text-gray-600">Historical data is loading or unavailable for the selected period.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Price Comparison</h3>
          <div className="flex flex-wrap items-center gap-3">
            {/* Chart Type Selector */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {[{ key: 'line', label: 'Line' }, { key: 'area', label: 'Area' }, { key: 'candle', label: 'Candle' }].map((type) => (
                <button
                  key={type.key}
                  onClick={() => {
                    setChartType(type.key as 'line' | 'area' | 'candle');
                    setChartLoading(true);
                    // Clear loading after a short delay since chart type change doesn't require data fetching
                    setTimeout(() => setChartLoading(false), 500);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    chartType === type.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            
            {/* Period Selector */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    chartPeriod === period ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* AI Analysis Button */}
            <button
              onClick={() => setIsAIPanelOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-1 shadow-md"
            >
              <Brain className="h-3 w-3" />
              AI Analysis
            </button>
          </div>
        </div>

        {/* Selected Stocks Display with Fullscreen */}
        <div className="flex justify-between items-start mb-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 flex-1">
            {stocksWithData.map((stock, index) => {
              const isPositive = stock.change >= 0;
              const color = index === 0 ? '#16a34a' : stock.color;
              return (
                <div key={stock.symbol} className={`bg-white rounded-lg p-3 border-2 shadow-sm transition-all hover:shadow-md ${
                  isPositive ? 'border-green-200 bg-gradient-to-br from-green-50 to-white' : 'border-red-200 bg-gradient-to-br from-red-50 to-white'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full shadow-md border-2 border-white" 
                        style={{ backgroundColor: color }}
                      />
                      <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 hover:underline">
                        {stock.symbol}
                      </Link>
                    </div>
                    <button
                      onClick={() => removeFromComparison(stock.symbol)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Price</span>
                      <span className="text-sm font-semibold">{formatPrice(stock.price)}</span>
                    </div>
                    <div className={`flex justify-between items-center p-1 rounded ${
                      isPositive ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span className="text-xs text-gray-700">Change</span>
                      <span className={`text-sm font-bold ${
                        isPositive ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Fullscreen Button */}
          <button
            onClick={enterFullscreen}
            className="ml-4 p-3 bg-white rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
            title="Fullscreen Chart"
          >
            <Maximize2 className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>

        {/* Chart Container */}
        <div 
          id="chart-container" 
          className={`relative bg-gray-50 ${
            isFullscreen 
              ? 'fixed inset-0 w-screen h-screen z-[9999] overflow-hidden' 
              : 'h-[32rem] rounded-lg p-3'
          }`}
        >
          {chartLoading && (
            <div className={`absolute inset-0 flex items-center justify-center bg-white/50 z-10 ${
              isFullscreen ? '' : 'rounded-lg'
            }`}>
              <Activity className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
          )}
          
          {/* Fullscreen Close Button - Only visible in fullscreen */}
          {isFullscreen && (
            <button
              onClick={exitFullscreen}
              className="fixed top-4 right-4 z-[10000] p-3 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all"
              title="Exit Fullscreen"
            >
              <Minimize2 className="h-6 w-6 text-gray-700" />
            </button>
          )}
          
          {/* Fullscreen Controls - Only visible in fullscreen */}
          {isFullscreen && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full shadow-xl px-6 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Period:</span>
                <select
                  value={chartPeriod}
                  onChange={(e) => {
                    const newPeriod = e.target.value;
                    setChartPeriod(newPeriod);
                    setChartLoading(true);
                    loadHistoricalData(comparedStocks, newPeriod);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  {periods.map(period => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <select
                  value={chartType}
                  onChange={(e) => {
                    setChartType(e.target.value as 'line' | 'area' | 'candle');
                    setChartLoading(true);
                    // Clear loading after a short delay since chart type change doesn't require data fetching
                    setTimeout(() => setChartLoading(false), 500);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <option value="line">Line</option>
                  <option value="area">Area</option>
                  <option value="candle">Candle</option>
                </select>
              </div>
            </div>
          )}
          
          <div className={`w-full h-full ${isFullscreen ? 'absolute inset-0' : ''}`}>
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
              height={isFullscreen ? window.innerHeight : 480}
              period={chartPeriod}
              chartType={chartType}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 lg:p-6">
        <div className="max-w-[1600px] mx-auto">
          {/* Compact Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Stock Comparison</h1>
            <p className="text-sm text-gray-600">Compare up to 5 stocks side by side with real-time data and charts</p>
          </motion.div>

          {/* Compact Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Add Stocks</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{comparedStocks.length}/5</span>
                {comparedStocks.length > 0 && (
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </button>
                )}
              </div>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {loading && (
                <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
                  <Activity className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 truncate">{stock.symbol}</h4>
                      <p className="text-xs text-gray-600 truncate">{stock.name}</p>
                      <p className="text-xs text-gray-500">{stock.sector}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-900">{formatPrice(stock.price)}</p>
                        <p className={`text-xs font-medium ${
                          stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      <button
                        onClick={() => addToComparison(stock)}
                        disabled={loading}
                        className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Add Popular Stocks */}
            {searchTerm === '' && comparedStocks.length < 5 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">Popular Stocks</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'].map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setSearchTerm(symbol)}
                      disabled={comparedStocks.some(s => s.symbol === symbol)}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-md transition-colors"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Main Content with Right Sidebar */}
          {comparedStocks.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Main Content Area */}
              <div className="xl:col-span-8">
                {/* Chart Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-6"
                >
                  {renderComparisonChart()}
                </motion.div>

                {/* Performance Summary */}
                {comparedStocks.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 mb-4"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Performance Summary</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Best Performer */}
                      {(() => {
                        const bestPerformer = comparedStocks.reduce((best, current) => 
                          current.changePercent > best.changePercent ? current : best
                        );
                        return (
                          <div className="text-center p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 shadow-sm">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Best</span>
                            </div>
                            <div className="text-sm font-bold text-green-900 mb-1">{bestPerformer.symbol}</div>
                            <div className="text-xs font-semibold text-green-700">+{bestPerformer.changePercent.toFixed(2)}%</div>
                          </div>
                        );
                      })()}
                      
                      {/* Worst Performer */}
                      {(() => {
                        const worstPerformer = comparedStocks.reduce((worst, current) => 
                          current.changePercent < worst.changePercent ? current : worst
                        );
                        return (
                          <div className="text-center p-2 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 shadow-sm">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <TrendingDown className="h-3 w-3 text-red-600" />
                              <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Worst</span>
                            </div>
                            <div className="text-sm font-bold text-red-900 mb-1">{worstPerformer.symbol}</div>
                            <div className="text-xs font-semibold text-red-700">{worstPerformer.changePercent.toFixed(2)}%</div>
                          </div>
                        );
                      })()}
                      
                      {/* Highest Volume */}
                      {(() => {
                        const highestVolume = comparedStocks.reduce((highest, current) => 
                          (current.volume || 0) > (highest.volume || 0) ? current : highest
                        );
                        return (
                          <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Activity className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Volume</span>
                            </div>
                            <div className="text-sm font-bold text-blue-900 mb-1">{highestVolume.symbol}</div>
                            <div className="text-xs font-semibold text-blue-700">{formatLargeNumber(highestVolume.volume)}</div>
                          </div>
                        );
                      })()}
                      
                      {/* Largest Market Cap */}
                      {(() => {
                        const largestCap = comparedStocks.reduce((largest, current) => 
                          (current.marketCap || 0) > (largest.marketCap || 0) ? current : largest
                        );
                        return (
                          <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 shadow-sm">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <DollarSign className="h-3 w-3 text-purple-600" />
                              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Cap</span>
                            </div>
                            <div className="text-sm font-bold text-purple-900 mb-1">{largestCap.symbol}</div>
                            <div className="text-xs font-semibold text-purple-700">{formatLargeNumber(largestCap.marketCap)}</div>
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Sidebar - Analysis Categories & Comparison */}
              <div className="xl:col-span-4 space-y-4">
                {/* Analysis Categories with Hover Scrolling */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 sticky top-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Analysis</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Hover to scroll</span>
                    </div>
                  </div>
                  
                  <div 
                    className="overflow-x-auto scrollbar-hide"
                    onMouseEnter={(e) => {
                      const element = e.currentTarget;
                      element.scrollLeft = element.scrollWidth / 2 - element.clientWidth / 2;
                    }}
                  >
                    <div className="flex gap-2 pb-2">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        const isActive = activeCategory === category.key;
                        return (
                          <button
                            key={category.key}
                            onClick={() => setActiveCategory(category.key)}
                            className={`flex items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0 min-w-fit ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm scale-105'
                                : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 border border-gray-200'
                            }`}
                          >
                            <Icon className={`h-3 w-3 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                            <span className="whitespace-nowrap">{category.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Detailed Comparison Table */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                >
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Comparison</h3>
                    <div className="overflow-x-auto">
                      {renderComparisonTable()}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sliding AI Panel */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isAIPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* AI Panel Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
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
              pageType="comparison"
              pageData={{
                stockCount: comparedStocks.length,
                stocks: comparedStocks.map(s => ({
                  symbol: s.symbol,
                  name: s.name,
                  price: s.price,
                  change: s.changePercent,
                  pe: s.peRatio,
                  sector: s.sector,
                  marketCap: s.marketCap
                })),
                activeCategory,
                period: chartPeriod,
                chartType
              }}
              autoAnalyze={comparedStocks.length >= 2}
              quickPrompts={[
                'Compare performance',
                'Best value pick',
                'Risk analysis',
                'Sector insights'
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
    </div>
  );
}