'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search, Plus, X, TrendingUp, TrendingDown, BarChart3,
  DollarSign, Users, Activity, Zap, Star, ArrowUpDown, LineChart, Download
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
  '#2563eb', // Blue
  '#dc2626', // Red  
  '#16a34a', // Green
  '#ca8a04', // Yellow
  '#9333ea'  // Purple
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
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                <button
                  onClick={() => handleSort('metric')}
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  Metric
                  {sortBy === 'metric' && (
                    <ArrowUpDown className={`h-3 w-3 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
              </th>
              {comparedStocks.map((stock) => (
                <th key={stock.symbol} className="text-center py-3 px-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: stock.color }}
                      />
                      <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 hover:underline">
                        {stock.symbol}
                      </Link>
                    </div>
                    <span className="text-xs text-gray-600 text-center truncate max-w-20">{stock.name}</span>
                    <div className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                      stock.changePercent >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                    <button
                      onClick={() => removeFromComparison(stock.symbol)}
                      className="mt-1 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {metrics.map((metric) => {
              // Sort stocks by the current metric if sorting is active
              let sortedStocks = [...comparedStocks];
              if (sortBy === metric.key) {
                sortedStocks.sort((a, b) => {
                  const aVal = Number(a[metric.key as keyof ComparisonStock]) || 0;
                  const bVal = Number(b[metric.key as keyof ComparisonStock]) || 0;
                  return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                });
              }
              
              // Find best and worst values for highlighting
              const values = comparedStocks.map(s => Number(s[metric.key as keyof ComparisonStock]) || 0);
              const maxValue = Math.max(...values);
              const minValue = Math.min(...values);
              const shouldHighlight = values.some(v => v !== 0) && maxValue !== minValue;
              
              return (
                <tr key={metric.key} className="hover:bg-gray-50">
                  <td className="py-2 px-4 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort(metric.key)}
                      className="flex items-center gap-1 hover:text-blue-600 text-sm"
                    >
                      {metric.label}
                      {sortBy === metric.key && (
                        <ArrowUpDown className={`h-3 w-3 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  </td>
                  {comparedStocks.map((stock) => {
                    const value = stock[metric.key as keyof ComparisonStock];
                    const numValue = Number(value) || 0;
                    const isNegative = typeof value === 'number' && value < 0;
                    const isBest = shouldHighlight && numValue === maxValue && numValue > 0;
                    const isWorst = shouldHighlight && numValue === minValue && numValue > 0;
                    
                    let cellClass = 'font-medium text-sm ';
                    if (metric.key === 'change' || metric.key === 'changePercent') {
                      cellClass += isNegative ? 'text-red-600' : 'text-green-600';
                    } else if (isBest && (metric.key === 'price' || metric.key === 'marketCap' || metric.key === 'eps')) {
                      cellClass += 'text-green-700 bg-green-50';
                    } else if (isWorst && (metric.key === 'peRatio' || metric.key === 'beta')) {
                      cellClass += 'text-red-700 bg-red-50';
                    } else {
                      cellClass += 'text-gray-900';
                    }
                    
                    return (
                      <td key={`${stock.symbol}-${metric.key}`} className="py-2 px-4 text-center">
                        <span className={cellClass + ' px-2 py-1 rounded'}>
                          {formatValue(value, metric.format)}
                          {isBest && shouldHighlight && (
                            <Star className="inline h-2.5 w-2.5 ml-1 text-yellow-500" />
                          )}
                        </span>
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
                  onClick={() => setChartType(type.key as 'line' | 'area' | 'candle')}
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
          </div>
        </div>

        {/* Compact Stock Legend */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
          {stocksWithData.map((stock, index) => {
            const isPositive = stock.change >= 0;
            const color = index === 0 ? '#16a34a' : stock.color;
            return (
              <div key={stock.symbol} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-semibold text-gray-900">{stock.symbol}</span>
                  <button
                    onClick={() => removeFromComparison(stock.symbol)}
                    className="ml-auto text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Price</span>
                    <span className="text-sm font-semibold">{formatPrice(stock.price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Change</span>
                    <span className={`text-sm font-semibold ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart Container */}
        <div className="h-80 relative bg-gray-50 rounded-lg p-3">
          {chartLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
          ) : null}
          
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
            height={300}
            period={chartPeriod}
            chartType={chartType}
          />
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
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Stock Comparison</h1>
            <p className="text-sm text-gray-600">Compare up to 5 stocks side by side with real-time data and charts</p>
          </motion.div>

          {/* Compact Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add Stocks</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{comparedStocks.length}/5</span>
                {comparedStocks.length > 0 && (
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </button>
                )}
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Activity className="h-4 w-4 text-blue-600 animate-spin" />
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto mb-4">
                {searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{stock.symbol}</h4>
                      <p className="text-xs text-gray-600 truncate">{stock.name}</p>
                      <p className="text-xs text-gray-500">{stock.sector}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatPrice(stock.price)}</p>
                        <p className={`text-xs font-medium ${
                          stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      <button
                        onClick={() => addToComparison(stock)}
                        disabled={loading}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
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
                <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Stocks</h4>
                <div className="flex flex-wrap gap-2">
                  {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'].map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setSearchTerm(symbol)}
                      disabled={comparedStocks.some(s => s.symbol === symbol)}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-md transition-colors"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Chart and AI Analysis Side by Side */}
          {comparedStocks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
            >
              {/* Chart Section - Takes 2/3 of the width */}
              <div className="lg:col-span-2">
                {renderComparisonChart()}
              </div>
              
              {/* AI Analysis - Takes 1/3 of the width */}
              <div className="lg:col-span-1">
                <AIAnalysisPanel
                  title="AI Insights"
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
                  maxHeight="500px"
                  compact={true}
                />
              </div>
            </motion.div>
          )}

          {/* Performance Summary - More Compact */}
          {comparedStocks.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Best Performer */}
                {(() => {
                  const bestPerformer = comparedStocks.reduce((best, current) => 
                    current.changePercent > best.changePercent ? current : best
                  );
                  return (
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Best</span>
                      </div>
                      <div className="text-lg font-bold text-green-900 mb-1">{bestPerformer.symbol}</div>
                      <div className="text-sm font-semibold text-green-700">+{bestPerformer.changePercent.toFixed(2)}%</div>
                    </div>
                  );
                })()}
                
                {/* Worst Performer */}
                {(() => {
                  const worstPerformer = comparedStocks.reduce((worst, current) => 
                    current.changePercent < worst.changePercent ? current : worst
                  );
                  return (
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Worst</span>
                      </div>
                      <div className="text-lg font-bold text-red-900 mb-1">{worstPerformer.symbol}</div>
                      <div className="text-sm font-semibold text-red-700">{worstPerformer.changePercent.toFixed(2)}%</div>
                    </div>
                  );
                })()}
                
                {/* Highest Volume */}
                {(() => {
                  const highestVolume = comparedStocks.reduce((highest, current) => 
                    (current.volume || 0) > (highest.volume || 0) ? current : highest
                  );
                  return (
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Volume</span>
                      </div>
                      <div className="text-lg font-bold text-blue-900 mb-1">{highestVolume.symbol}</div>
                      <div className="text-sm font-semibold text-blue-700">{formatLargeNumber(highestVolume.volume)}</div>
                    </div>
                  );
                })()}
                
                {/* Largest Market Cap */}
                {(() => {
                  const largestCap = comparedStocks.reduce((largest, current) => 
                    (current.marketCap || 0) > (largest.marketCap || 0) ? current : largest
                  );
                  return (
                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Cap</span>
                      </div>
                      <div className="text-lg font-bold text-purple-900 mb-1">{largestCap.symbol}</div>
                      <div className="text-sm font-semibold text-purple-700">{formatLargeNumber(largestCap.marketCap)}</div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {/* Category Tabs - More Compact */}
          {comparedStocks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.key}
                      onClick={() => setActiveCategory(category.key)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeCategory === category.key
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Comparison Table - More Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Comparison</h3>
              {renderComparisonTable()}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}