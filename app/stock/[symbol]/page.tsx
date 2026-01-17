'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Plus,
  BarChart3
} from 'lucide-react';
import { stockAPI } from '../../utils/api';
import { Stock, HistoricalData } from '../../types';
import toast from 'react-hot-toast';
import StockChart from '../../components/StockChart';

interface PageProps {
  params: { symbol: string };
}

export default function StockDetailPage({ params }: PageProps) {
  const { symbol } = params;
  const [stock, setStock] = useState<Stock | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [chartPeriod, setChartPeriod] = useState('1 Day');
  const [chartType, setChartType] = useState<'area' | 'candlestick' | 'line' | 'mountain'>('area');
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);

  const loadChartData = async (period: string) => {
    try {
      setChartLoading(true);
      const periodMap: Record<string, string> = {
        '1 Day': '1d', '5 Days': '5d', '1 Month': '1mo', 
        'YTD': '1y', '1 Year': '1y', '5 Years': '5y', 'Max': '5y'
      };
      const mappedPeriod = periodMap[period] || '1d';
      const historyResponse = await stockAPI.getHistoricalData(symbol, mappedPeriod);
      if (historyResponse.data) {
        setHistoricalData(historyResponse.data);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setChartLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    setChartPeriod(period);
    loadChartData(period);
  };

  useEffect(() => {
    const fetchStockData = async () => {
      if (!symbol) return;

      try {
        setLoading(true);
        const [stockResponse, historyResponse] = await Promise.all([
          stockAPI.getStockQuote(symbol),
          stockAPI.getHistoricalData(symbol, '1d')
        ]);

        if (stockResponse.data) {
          setStock(stockResponse.data);
        }
        if (historyResponse.data) {
          setHistoricalData(historyResponse.data);
        }

        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        setIsWatchlisted(watchlist.some((item: Stock) => item.symbol === symbol));
      } catch (error) {
        console.error('Error fetching stock data:', error);
        toast.error('Failed to load stock information');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  const toggleWatchlist = () => {
    if (!stock) return;
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    if (isWatchlisted) {
      const newWatchlist = watchlist.filter((item: Stock) => item.symbol !== stock.symbol);
      localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
      setIsWatchlisted(false);
      toast.success('Removed from watchlist');
    } else {
      watchlist.push(stock);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      setIsWatchlisted(true);
      toast.success('Added to watchlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="flex items-center justify-center h-96">
          <Activity className="h-12 w-12 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Stock Not Found</h2>
          <p className="text-gray-600">Symbol: {symbol}</p>
        </div>
      </div>
    );
  }

  const isPositive = stock.change >= 0;
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number, percent: number) => 
    `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%)`;

  const tabs = ['Overview', 'Financials', 'Forecast', 'Statistics', 'Metrics', 'Dividends', 'History', 'Profile', 'Chart'];
  const periods = ['1 Day', '5 Days', '1 Month', 'YTD', '1 Year', '5 Years', 'Max'];
  const chartTypes = [
    { key: 'area', label: 'Area', icon: '📈' },
    { key: 'candlestick', label: 'Candle', icon: '🕯️' },
    { key: 'line', label: 'Line', icon: '📊' },
    { key: 'mountain', label: 'Mountain', icon: '⛰️' }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{stock.name} ({stock.symbol})</h1>
            <p className="text-gray-600">NASDAQ: {stock.symbol} · Real-Time Price · USD</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleWatchlist}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isWatchlisted ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
            >
              <Plus className="h-4 w-4" />
              {isWatchlisted ? 'Watchlist' : 'Watchlist'}
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Compare
            </button>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-gray-900">{formatPrice(stock.price)}</span>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
              {isPositive ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
              <span className="font-medium">{formatChange(stock.change, stock.changePercent)}</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <div>At close: Jan 16, 2026, 4:00 PM EST</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={isPositive ? 'text-red-600' : 'text-green-600'}>
                {formatPrice(stock.price + 0.28)} {formatChange(0.28, 0.11)}
              </span>
              <span>After-hours: Jan 16, 2026, 7:59 PM EST</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Key Metrics */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Market Cap</span>
                <span className="font-medium">{stock.marketCap ? `$${(stock.marketCap / 1e12).toFixed(2)}T` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volume</span>
                <span className="font-medium">{stock.volume ? stock.volume.toLocaleString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue (ttm)</span>
                <span className="font-medium">416.16B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Open</span>
                <span className="font-medium">{formatPrice(stock.price * 1.01)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Net Income (ttm)</span>
                <span className="font-medium">112.01B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Previous Close</span>
                <span className="font-medium">{formatPrice(stock.price + stock.change)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shares Out</span>
                <span className="font-medium">14.70B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Day's Range</span>
                <span className="font-medium">{formatPrice(stock.price * 0.99)} - {formatPrice(stock.price * 1.01)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">EPS (ttm)</span>
                <span className="font-medium">{stock.eps ? stock.eps.toFixed(2) : '7.46'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">52-Week Range</span>
                <span className="font-medium">{stock.low52Week ? formatPrice(stock.low52Week) : '169.21'} - {stock.high52Week ? formatPrice(stock.high52Week) : '288.62'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PE Ratio</span>
                <span className="font-medium">{stock.peRatio ? stock.peRatio.toFixed(2) : '34.25'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Beta</span>
                <span className="font-medium">{stock.beta ? stock.beta.toFixed(2) : '1.09'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Forward PE</span>
                <span className="font-medium">30.97</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Analysts</span>
                <span className="font-medium text-green-600">Buy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dividend</span>
                <span className="font-medium">{stock.dividendYield ? `$${(stock.dividendYield * stock.price / 100).toFixed(2)} (${stock.dividendYield.toFixed(2)}%)` : '$1.04 (0.41%)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price Target</span>
                <span className="font-medium text-green-600">292.22 (+14.36%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ex-Dividend Date</span>
                <span className="font-medium">Nov 10, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Earnings Date</span>
                <span className="font-medium">Jan 29, 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            {/* Chart Period and Type Buttons */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Period Buttons */}
                <div className="flex space-x-2">
                  {periods.map((period) => (
                    <button
                      key={period}
                      onClick={() => handlePeriodChange(period)}
                      disabled={chartLoading}
                      className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        chartPeriod === period
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {chartLoading && chartPeriod === period ? (
                        <Activity className="h-4 w-4 animate-spin" />
                      ) : (
                        period
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Chart Type Buttons */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  {chartTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setChartType(type.key)}
                      className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                        chartType === type.key
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title={type.label}
                    >
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={`text-lg font-bold ${
                isPositive ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatChange(stock.change, stock.changePercent)} (1D)
              </div>
            </div>

            {/* Chart */}
            <div className="h-96 bg-white rounded-lg border border-gray-200 relative">
              {historicalData.length > 0 ? (
                <StockChart 
                  data={historicalData} 
                  isPositive={!isPositive} 
                  height={384}
                  chartType={chartType}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    {chartLoading ? (
                      <>
                        <Activity className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-spin" />
                        <p className="text-lg font-medium">Loading chart data...</p>
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No chart data available</p>
                        <p className="text-sm">Try selecting a different time period</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Chart Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Today's High</p>
                <p className="text-lg font-bold text-gray-900">{formatPrice(stock.price * 1.02)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Today's Low</p>
                <p className="text-lg font-bold text-gray-900">{formatPrice(stock.price * 0.98)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Volume</p>
                <p className="text-lg font-bold text-gray-900">{stock.volume ? (stock.volume / 1000000).toFixed(1) + 'M' : 'N/A'}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Avg Volume</p>
                <p className="text-lg font-bold text-gray-900">{stock.volume ? ((stock.volume * 0.8) / 1000000).toFixed(1) + 'M' : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}