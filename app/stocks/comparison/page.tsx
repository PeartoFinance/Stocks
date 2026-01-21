'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search, Plus, X, TrendingUp, TrendingDown, BarChart3,
  DollarSign, Users, Activity, Zap, Star, ArrowUpDown, LineChart
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
  const [chartPeriod, setChartPeriod] = useState('1M');
  const [showChart, setShowChart] = useState(true);
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
  const loadHistoricalData = async (stocks: ComparisonStock[], period: string) => {
    if (stocks.length === 0) return;
    
    try {
      setChartLoading(true);
      const periodMap: Record<string, string> = {
        '1D': '1d', '5D': '5d', '1M': '1mo', '3M': '3mo', '6M': '6mo', '1Y': '1y'
      };
      const mappedPeriod = periodMap[period] || '1mo';

      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const historyResponse = await marketService.getStockHistory(stock.symbol, mappedPeriod);
            if ((historyResponse as any)?.data) {
              const transformedData: HistoricalData[] = (historyResponse as any).data.map((item: any) => ({
                date: item.date,
                open: item.open || item.close,
                high: item.high || item.close,
                low: item.low || item.close,
                close: item.close,
                volume: item.volume || 0,
              }));
              return { ...stock, historicalData: transformedData };
            }
            return stock;
          } catch (error) {
            console.error(`Error loading data for ${stock.symbol}:`, error);
            return stock;
          }
        })
      );

      setComparedStocks(updatedStocks);
    } catch (error) {
      console.error('Error loading historical data:', error);
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
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No stocks to compare</h3>
          <p className="text-gray-600">Search and add stocks to start comparing</p>
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
              <th className="text-left py-4 px-6 font-medium text-gray-900">
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
                <th key={stock.symbol} className="text-center py-4 px-6">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: stock.color }}
                      />
                      <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="text-lg font-bold text-gray-900 hover:text-blue-600 hover:underline">
                        {stock.symbol}
                      </Link>
                    </div>
                    <span className="text-sm text-gray-600 text-center">{stock.name}</span>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      stock.changePercent >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                    <button
                      onClick={() => removeFromComparison(stock.symbol)}
                      className="mt-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <X className="h-4 w-4" />
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
                  <td className="py-3 px-6 font-medium text-gray-900">
                    <button
                      onClick={() => handleSort(metric.key)}
                      className="flex items-center gap-1 hover:text-blue-600"
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
                    
                    let cellClass = 'font-medium ';
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
                      <td key={`${stock.symbol}-${metric.key}`} className="py-3 px-6 text-center">
                        <span className={cellClass + ' px-2 py-1 rounded'}>
                          {formatValue(value, metric.format)}
                          {isBest && shouldHighlight && (
                            <Star className="inline h-3 w-3 ml-1 text-yellow-500" />
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
    if (comparedStocks.length === 0 || !showChart) return null;

    const stocksWithData = comparedStocks.filter(stock => stock.historicalData && stock.historicalData.length > 0);
    
    if (stocksWithData.length === 0) {
      return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-10">
          <div className="text-center py-12">
            <LineChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Chart Data Available</h3>
            <p className="text-gray-600">Historical data is loading or unavailable for the selected period.</p>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-10"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <h3 className="text-2xl font-semibold text-gray-900">Price Comparison Chart</h3>
          <div className="flex flex-wrap items-center gap-4">
            {/* Period Selector */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    chartPeriod === period ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            
            {/* Toggle Chart */}
            <button
              onClick={() => setShowChart(!showChart)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <LineChart className="h-4 w-4" />
              Hide Chart
            </button>
          </div>
        </div>

        {/* Stock Legend with Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {stocksWithData.map((stock) => {
            const isPositive = stock.change >= 0;
            return (
              <div key={stock.symbol} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: stock.color }}
                  />
                  <span className="text-lg font-semibold text-gray-900">{stock.symbol}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="text-lg font-semibold">{formatPrice(stock.price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Change</span>
                    <span className={`text-lg font-semibold ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Volume</span>
                    <span className="text-sm font-medium">{formatLargeNumber(stock.volume)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Market Cap</span>
                    <span className="text-sm font-medium">{formatLargeNumber(stock.marketCap)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart Container */}
        <div className="h-96 relative bg-gray-50 rounded-xl p-4">
          {chartLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-xl">
              <Activity className="h-8 w-8 text-blue-600 animate-spin" />
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
            height={360}
            period={chartPeriod}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Stock Comparison</h1>
            <p className="text-lg text-gray-600">Compare up to 5 stocks side by side with real-time data and charts</p>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Add Stocks to Compare</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{comparedStocks.length}/5 stocks selected</span>
                {comparedStocks.length > 0 && (
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    Export CSV
                  </button>
                )}
              </div>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by symbol or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {loading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Activity className="h-5 w-5 text-blue-600 animate-spin" />
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-xl max-h-80 overflow-y-auto mb-6">
                {searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{stock.symbol}</h4>
                      <p className="text-gray-600 mb-1">{stock.name}</p>
                      <p className="text-sm text-gray-500">{stock.sector} • {stock.exchange}</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">{formatPrice(stock.price)}</p>
                        <p className={`text-sm font-medium ${
                          stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      <button
                        onClick={() => addToComparison(stock)}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
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
                <h4 className="text-lg font-medium text-gray-700 mb-4">Popular Stocks</h4>
                <div className="flex flex-wrap gap-3">
                  {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'].map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setSearchTerm(symbol)}
                      disabled={comparedStocks.some(s => s.symbol === symbol)}
                      className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Comparison Chart */}
          {renderComparisonChart()}

          {/* Performance Summary */}
          {comparedStocks.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-10"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Performance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Best Performer */}
                {(() => {
                  const bestPerformer = comparedStocks.reduce((best, current) => 
                    current.changePercent > best.changePercent ? current : best
                  );
                  return (
                    <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">Best Performer</span>
                      </div>
                      <div className="text-xl font-bold text-green-900 mb-1">{bestPerformer.symbol}</div>
                      <div className="text-lg font-semibold text-green-700">+{bestPerformer.changePercent.toFixed(2)}%</div>
                    </div>
                  );
                })()}
                
                {/* Worst Performer */}
                {(() => {
                  const worstPerformer = comparedStocks.reduce((worst, current) => 
                    current.changePercent < worst.changePercent ? current : worst
                  );
                  return (
                    <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-semibold text-red-700 uppercase tracking-wide">Worst Performer</span>
                      </div>
                      <div className="text-xl font-bold text-red-900 mb-1">{worstPerformer.symbol}</div>
                      <div className="text-lg font-semibold text-red-700">{worstPerformer.changePercent.toFixed(2)}%</div>
                    </div>
                  );
                })()}
                
                {/* Highest Volume */}
                {(() => {
                  const highestVolume = comparedStocks.reduce((highest, current) => 
                    (current.volume || 0) > (highest.volume || 0) ? current : highest
                  );
                  return (
                    <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Highest Volume</span>
                      </div>
                      <div className="text-xl font-bold text-blue-900 mb-1">{highestVolume.symbol}</div>
                      <div className="text-lg font-semibold text-blue-700">{formatLargeNumber(highestVolume.volume)}</div>
                    </div>
                  );
                })()}
                
                {/* Largest Market Cap */}
                {(() => {
                  const largestCap = comparedStocks.reduce((largest, current) => 
                    (current.marketCap || 0) > (largest.marketCap || 0) ? current : largest
                  );
                  return (
                    <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Largest Cap</span>
                      </div>
                      <div className="text-xl font-bold text-purple-900 mb-1">{largestCap.symbol}</div>
                      <div className="text-lg font-semibold text-purple-700">{formatLargeNumber(largestCap.marketCap)}</div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {/* Category Tabs */}
          {comparedStocks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-10"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Analysis Categories</h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.key}
                      onClick={() => setActiveCategory(category.key)}
                      className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeCategory === category.key
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Detailed Comparison</h3>
              {renderComparisonTable()}
            </div>
          </motion.div>

          {/* AI Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10"
          >
            <AIAnalysisPanel
              title="Comparison Insights"
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
                period: chartPeriod
              }}
              autoAnalyze={comparedStocks.length >= 2}
              quickPrompts={[
                'Compare performance',
                'Best value pick',
                'Risk comparison',
                'Sector analysis'
              ]}
              maxHeight="600px"
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}