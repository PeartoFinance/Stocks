'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search, Plus, X, TrendingUp, TrendingDown, BarChart3,
  DollarSign, Users, Activity, Zap, Star, ArrowUpDown
} from 'lucide-react';
import { formatPrice, formatNumber } from '@/lib/utils';
import toast from 'react-hot-toast';
import AIAnalysisPanel from '../../components/ai/AIAnalysisPanel';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  pe: number;
  eps: number;
  dividend: number;
  dividendYield: number;
  volume: number;
  avgVolume: number;
  high52w: number;
  low52w: number;
  beta: number;
  sector: string;
  industry: string;
  employees: number;
  revenue: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roe: number;
  roa: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
}

export default function StockComparison() {
  const [comparedStocks, setComparedStocks] = useState<StockData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('overview');

  const mockStockData: Record<string, StockData> = {
    'AAPL': {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 182.52,
      change: 2.34,
      changePercent: 1.3,
      marketCap: 2800000000000,
      pe: 28.5,
      eps: 6.40,
      dividend: 0.96,
      dividendYield: 0.53,
      volume: 45230000,
      avgVolume: 52150000,
      high52w: 199.62,
      low52w: 164.08,
      beta: 1.21,
      sector: 'Technology',
      industry: 'Consumer Electronics',
      employees: 164000,
      revenue: 394328000000,
      grossMargin: 43.3,
      operatingMargin: 27.5,
      netMargin: 24.3,
      roe: 175.0,
      roa: 22.4,
      debtToEquity: 1.95,
      currentRatio: 1.0,
      quickRatio: 0.81
    },
    'MSFT': {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 378.85,
      change: 4.12,
      changePercent: 1.1,
      marketCap: 2810000000000,
      pe: 32.1,
      eps: 11.80,
      dividend: 3.00,
      dividendYield: 0.79,
      volume: 22140000,
      avgVolume: 28450000,
      high52w: 384.30,
      low52w: 309.45,
      beta: 0.89,
      sector: 'Technology',
      industry: 'Software',
      employees: 221000,
      revenue: 211915000000,
      grossMargin: 69.4,
      operatingMargin: 42.0,
      netMargin: 34.1,
      roe: 40.8,
      roa: 16.5,
      debtToEquity: 0.35,
      currentRatio: 1.77,
      quickRatio: 1.76
    },
    'GOOGL': {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 141.80,
      change: -1.25,
      changePercent: -0.87,
      marketCap: 1750000000000,
      pe: 25.8,
      eps: 5.49,
      dividend: 0,
      dividendYield: 0,
      volume: 28340000,
      avgVolume: 31220000,
      high52w: 153.78,
      low52w: 121.46,
      beta: 1.05,
      sector: 'Technology',
      industry: 'Internet Services',
      employees: 182000,
      revenue: 307394000000,
      grossMargin: 57.0,
      operatingMargin: 25.3,
      netMargin: 21.3,
      roe: 22.8,
      roa: 16.1,
      debtToEquity: 0.11,
      currentRatio: 2.93,
      quickRatio: 2.93
    },
    'TSLA': {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      price: 218.75,
      change: -8.20,
      changePercent: -3.61,
      marketCap: 685000000000,
      pe: 65.2,
      eps: 3.35,
      dividend: 0,
      dividendYield: 0,
      volume: 62150000,
      avgVolume: 68450000,
      high52w: 299.29,
      low52w: 152.37,
      beta: 2.31,
      sector: 'Consumer Discretionary',
      industry: 'Electric Vehicles',
      employees: 140000,
      revenue: 96773000000,
      grossMargin: 19.1,
      operatingMargin: 8.2,
      netMargin: 12.1,
      roe: 28.1,
      roa: 8.4,
      debtToEquity: 0.17,
      currentRatio: 1.73,
      quickRatio: 1.28
    },
    'NVDA': {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 487.50,
      change: 23.45,
      changePercent: 5.06,
      marketCap: 1200000000000,
      pe: 71.3,
      eps: 6.84,
      dividend: 0.16,
      dividendYield: 0.03,
      volume: 45230000,
      avgVolume: 49850000,
      high52w: 502.66,
      low52w: 200.26,
      beta: 1.68,
      sector: 'Technology',
      industry: 'Semiconductors',
      employees: 29600,
      revenue: 60922000000,
      grossMargin: 73.2,
      operatingMargin: 32.5,
      netMargin: 28.1,
      roe: 123.0,
      roa: 35.6,
      debtToEquity: 0.24,
      currentRatio: 3.92,
      quickRatio: 3.54
    }
  };

  const categories = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'valuation', label: 'Valuation', icon: DollarSign },
    { key: 'profitability', label: 'Profitability', icon: TrendingUp },
    { key: 'financial', label: 'Financial Health', icon: BarChart3 },
    { key: 'trading', label: 'Trading Data', icon: Zap }
  ];

  useEffect(() => {
    if (searchTerm.length >= 1) {
      const results = Object.values(mockStockData).filter(stock =>
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const addToComparison = (stock: StockData) => {
    if (comparedStocks.length >= 4) {
      toast.error('You can compare up to 4 stocks at a time');
      return;
    }

    if (comparedStocks.find(s => s.symbol === stock.symbol)) {
      toast.error('Stock already added to comparison');
      return;
    }

    setComparedStocks([...comparedStocks, stock]);
    setSearchTerm('');
    setSearchResults([]);
    toast.success(`${stock.symbol} added to comparison`);
  };

  const removeFromComparison = (symbol: string) => {
    setComparedStocks(comparedStocks.filter(s => s.symbol !== symbol));
    toast.success(`${symbol} removed from comparison`);
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
            { key: 'pe', label: 'P/E Ratio', format: 'number' },
            { key: 'eps', label: 'EPS', format: 'currency' },
            { key: 'dividend', label: 'Dividend', format: 'currency' },
            { key: 'dividendYield', label: 'Div Yield (%)', format: 'percentage' },
            { key: 'high52w', label: '52W High', format: 'currency' },
            { key: 'low52w', label: '52W Low', format: 'currency' }
          ];
        case 'profitability':
          return [
            { key: 'revenue', label: 'Revenue', format: 'revenue' },
            { key: 'grossMargin', label: 'Gross Margin (%)', format: 'percentage' },
            { key: 'operatingMargin', label: 'Operating Margin (%)', format: 'percentage' },
            { key: 'netMargin', label: 'Net Margin (%)', format: 'percentage' },
            { key: 'roe', label: 'ROE (%)', format: 'percentage' },
            { key: 'roa', label: 'ROA (%)', format: 'percentage' }
          ];
        case 'financial':
          return [
            { key: 'debtToEquity', label: 'Debt/Equity', format: 'number' },
            { key: 'currentRatio', label: 'Current Ratio', format: 'number' },
            { key: 'quickRatio', label: 'Quick Ratio', format: 'number' },
            { key: 'employees', label: 'Employees', format: 'number' },
            { key: 'beta', label: 'Beta', format: 'number' }
          ];
        case 'trading':
          return [
            { key: 'volume', label: 'Volume', format: 'volume' },
            { key: 'avgVolume', label: 'Avg Volume', format: 'volume' },
            { key: 'high52w', label: '52W High', format: 'currency' },
            { key: 'low52w', label: '52W Low', format: 'currency' },
            { key: 'beta', label: 'Beta', format: 'number' }
          ];
        default:
          return [];
      }
    };

    const formatValue = (value: any, format: string) => {
      switch (format) {
        case 'currency':
          return formatPrice(value);
        case 'percentage':
          return `${value.toFixed(2)}%`;
        case 'number':
          return value.toFixed(2);
        case 'marketCap':
          return `${formatPrice(value / 1e9)}B`;
        case 'revenue':
          return `${formatPrice(value / 1e9)}B`;
        case 'volume':
          return formatNumber(value);
        case 'text':
        default:
          return value;
      }
    };

    const metrics = getMetrics();

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-6 font-medium text-gray-900">Metric</th>
              {comparedStocks.map((stock) => (
                <th key={stock.symbol} className="text-center py-4 px-6">
                  <div className="flex flex-col items-center">
                    <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="text-lg font-bold text-gray-900 hover:text-emerald-600 hover:underline">
                      {stock.symbol}
                    </Link>
                    <span className="text-sm text-gray-600">{stock.name}</span>
                    <button
                      onClick={() => removeFromComparison(stock.symbol)}
                      className="mt-1 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {metrics.map((metric) => (
              <tr key={metric.key} className="hover:bg-gray-50">
                <td className="py-3 px-6 font-medium text-gray-900">{metric.label}</td>
                {comparedStocks.map((stock) => {
                  const value = stock[metric.key as keyof StockData];
                  const isNegative = typeof value === 'number' && value < 0;
                  return (
                    <td key={`${stock.symbol}-${metric.key}`} className="py-3 px-6 text-center">
                      <span className={`font-medium ${metric.key === 'change' || metric.key === 'changePercent'
                        ? isNegative ? 'text-red-600' : 'text-green-600'
                        : 'text-gray-900'
                        }`}>
                        {formatValue(value, metric.format)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen">

      <main className="p-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Add Stocks to Compare</h2>
                <span className="text-sm text-gray-500">{comparedStocks.length}/4 stocks selected</span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by symbol or company name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                  {searchResults.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{stock.symbol}</h4>
                        <p className="text-sm text-gray-600">{stock.name}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatPrice(stock.price)}</p>
                          <p className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </p>
                        </div>
                        <button
                          onClick={() => addToComparison(stock)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Category Tabs */}
            {comparedStocks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
              >
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.key}
                        onClick={() => setActiveCategory(category.key)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === category.key
                          ? 'bg-blue-600 text-white'
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

            {/* Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100"
            >
              {renderComparisonTable()}
            </motion.div>
          </div>

          {/* AI Analysis Sidebar */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="xl:sticky xl:top-4">
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
                    pe: s.pe,
                    sector: s.sector
                  })),
                  activeCategory
                }}
                autoAnalyze={comparedStocks.length >= 2}
                quickPrompts={[
                  'Compare performance',
                  'Best value pick',
                  'Risk comparison'
                ]}
                maxHeight="600px"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}