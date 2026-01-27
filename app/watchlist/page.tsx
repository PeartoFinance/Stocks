'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Plus,
  Edit3,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  Eye,
  Filter,
  MoreVertical
} from 'lucide-react';
import { formatPrice, formatNumber, formatPercent, formatVolume } from '@/lib/utils';
import { stockAPI } from '../utils/api';
import { watchlistAPI } from '../utils/watchlistAPI';
import { Stock } from '../types';
import toast from 'react-hot-toast';
import AIAnalysisPanel from '../components/ai/AIAnalysisPanel';

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  chartPath: string;
}

interface WatchlistStock extends Stock {
  premktPrice?: number;
  premktChg?: number;
  earningsDate?: string;
  week52Low?: number;
  dividendYield?: number;
  annualDividend?: number;
  dividendGrowth?: number;
  exDivDate?: string;
  paymentDate?: string;
  payoutRatio?: number;
  buybackYield?: number;
}

export default function WatchlistPage() {
  const [stocks, setStocks] = useState<WatchlistStock[]>([]);
  const [activeTab, setActiveTab] = useState('General');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [showWatchlistMenu, setShowWatchlistMenu] = useState(false);
  const [watchlists, setWatchlists] = useState(['My Watchlist', 'Tech Stocks', 'Blue Chips']);
  const [activeWatchlist, setActiveWatchlist] = useState('My Watchlist');
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedStock, setSelectedStock] = useState<WatchlistStock | null>(null);

  // Mock market indices data
  const marketIndices: MarketIndex[] = [
    {
      symbol: 'SPX',
      name: 'S&P500',
      price: 4567.89,
      change: -15.97,
      changePercent: -0.35,
      chartPath: 'M0,20 C10,15 20,25 30,18 C40,12 50,22 60,16 C70,10 80,15 90,8 L95,12'
    },
    {
      symbol: 'NDX',
      name: 'Nasdaq 100',
      price: 15432.10,
      change: -66.43,
      changePercent: -0.43,
      chartPath: 'M0,18 C10,12 20,20 30,15 C40,8 50,18 60,12 C70,6 80,10 90,5 L95,8'
    },
    {
      symbol: 'DJI',
      name: 'Dow Jones',
      price: 34567.12,
      change: -55.32,
      changePercent: -0.16,
      chartPath: 'M0,22 C10,18 20,28 30,22 C40,16 50,26 60,20 C70,14 80,18 90,12 L95,15'
    },
    {
      symbol: 'RUT',
      name: 'Russell 2000',
      price: 1876.54,
      change: -7.51,
      changePercent: -0.40,
      chartPath: 'M0,25 C10,20 20,30 30,24 C40,18 50,28 60,22 C70,16 80,20 90,14 L95,17'
    }
  ];

  const tabs = [
    'General', 'Holdings', 'Dividends', 'Performance',
    'Forecasts', 'Earnings', 'Fundamentals'
  ];

  useEffect(() => {
    loadWatchlist();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showWatchlistMenu) {
        setShowWatchlistMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWatchlistMenu]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      
      try {
        const response = await watchlistAPI.getWatchlistWithPrices();
        if (response.success && response.data.length > 0) {
          const watchlistStocks = response.data.map(item => ({
            symbol: item.symbol,
            name: item.symbol,
            price: item.currentPrice || 0,
            change: item.change || 0,
            changePercent: item.changePercent || 0,
            volume: 0,
            premktPrice: item.currentPrice ? item.currentPrice + (Math.random() - 0.5) * 2 : 0,
            premktChg: (Math.random() - 0.5) * 0.5,
            earningsDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            week52Low: item.currentPrice ? item.currentPrice * (0.7 + Math.random() * 0.2) : 0,
            dividendYield: Math.random() * 5 + 1,
            annualDividend: item.currentPrice ? item.currentPrice * (Math.random() * 0.05 + 0.01) : 0,
            dividendGrowth: (Math.random() - 0.3) * 20,
            exDivDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            paymentDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            payoutRatio: Math.random() * 80 + 20,
            buybackYield: Math.random() * 3 + 0.5
          } as WatchlistStock));
          
          setStocks(watchlistStocks);
          return;
        }
      } catch (apiError) {
        console.log('Watchlist API not available, loading default stocks');
      }
      
      const defaultSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];
      const stockPromises = defaultSymbols.map(symbol => 
        stockAPI.getStockQuote(symbol).catch(() => null)
      );
      
      const results = await Promise.all(stockPromises);
      const validStocks = results
        .filter(result => result !== null)
        .map(result => {
          const stock = result!.data;
          return {
            ...stock,
            premktPrice: stock.price + (Math.random() - 0.5) * 2,
            premktChg: (Math.random() - 0.5) * 0.5,
            earningsDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            week52Low: stock.price * (0.7 + Math.random() * 0.2),
            dividendYield: Math.random() * 5 + 1,
            annualDividend: stock.price * (Math.random() * 0.05 + 0.01),
            dividendGrowth: (Math.random() - 0.3) * 20,
            exDivDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            paymentDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            payoutRatio: Math.random() * 80 + 20,
            buybackYield: Math.random() * 3 + 0.5
          } as WatchlistStock;
        });
      
      setStocks(validStocks);
    } catch (error) {
      console.error('Error loading watchlist:', error);
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const addStock = async () => {
    if (!newSymbol.trim()) return;

    try {
      const response = await stockAPI.getStockQuote(newSymbol.toUpperCase());
      const stockExists = stocks.some((stock: WatchlistStock) => stock.symbol === response.data.symbol);

      if (stockExists) {
        toast.error('Stock already in watchlist');
        return;
      }

      const newStock: WatchlistStock = {
        ...response.data,
        premktPrice: response.data.price + (Math.random() - 0.5) * 2,
        premktChg: (Math.random() - 0.5) * 0.5,
        earningsDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        week52Low: response.data.price * (0.7 + Math.random() * 0.2),
        dividendYield: Math.random() * 5 + 1,
        annualDividend: response.data.price * (Math.random() * 0.05 + 0.01),
        dividendGrowth: (Math.random() - 0.3) * 20,
        exDivDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payoutRatio: Math.random() * 80 + 20,
        buybackYield: Math.random() * 3 + 0.5
      };

      setStocks([...stocks, newStock]);
      setNewSymbol('');
      setShowAddModal(false);
      toast.success(`Added ${response.data.symbol} to watchlist`);
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Failed to add stock. Please check the symbol.');
    }
  };

  const getTableColumns = () => {
    switch (activeTab) {
      case 'Dividends':
        return [
          { key: 'symbol', label: 'Symbol', width: 'w-24' },
          { key: 'price', label: 'Price', width: 'w-24' },
          { key: 'chg', label: 'Chg %', width: 'w-24' },
          { key: 'annualDiv', label: 'Annual Div', width: 'w-28' },
          { key: 'divYield', label: 'Yield', width: 'w-24' },
          { key: 'divGrowth', label: 'Growth', width: 'w-24' }
        ];
      case 'Forecasts':
        return [
          { key: 'symbol', label: 'Symbol', width: 'w-24' },
          { key: 'price', label: 'Price', width: 'w-24' },
          { key: 'chg', label: 'Chg %', width: 'w-24' },
          { key: 'priceTarget', label: 'Target', width: 'w-24' },
          { key: 'priceTargetUpside', label: 'Upside', width: 'w-24' },
          { key: 'analystRating', label: 'Rating', width: 'w-28' }
        ];
      default:
        return [
          { key: 'symbol', label: 'Symbol', width: 'w-24' },
          { key: 'price', label: 'Price', width: 'w-24' },
          { key: 'chg', label: 'Chg %', width: 'w-24' },
          { key: 'volume', label: 'Volume', width: 'w-28' },
          { key: 'marketCap', label: 'Mkt Cap', width: 'w-28' }
        ];
    }
  };

  const getCellValue = (stock: WatchlistStock, columnKey: string) => {
    switch (columnKey) {
      case 'symbol':
        return <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="font-semibold text-blue-600 hover:text-emerald-600">{stock.symbol}</Link>;
      case 'price':
        return <span className="font-medium">{formatPrice(stock.price)}</span>;
      case 'chg':
        return (
          <span className={`font-medium ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </span>
        );
      case 'volume':
        return <span className="text-gray-600">{formatVolume(stock.volume)}</span>;
      case 'marketCap':
        return <span className="text-gray-600">{formatNumber(stock.marketCap)}</span>;
      case 'annualDiv':
        return <span className="text-gray-600">{formatPrice(stock.annualDividend || 0)}</span>;
      case 'divYield':
        return <span className="text-gray-900 font-medium">{(stock.dividendYield || 0).toFixed(2)}%</span>;
      case 'divGrowth':
        return (
          <span className={`font-medium ${(stock.dividendGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(stock.dividendGrowth || 0) >= 0 ? '+' : ''}{(stock.dividendGrowth || 0).toFixed(1)}%
          </span>
        );
      case 'priceTarget':
        const target = stock.price * (0.9 + Math.random() * 0.4);
        return <span className="font-medium">{formatPrice(target)}</span>;
      case 'priceTargetUpside':
        const upside = (Math.random() - 0.3) * 40;
        return (
          <span className={`font-medium ${upside >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
          </span>
        );
      case 'analystRating':
        const ratings = ['Strong Buy', 'Buy', 'Hold'];
        const colors = ['text-green-700', 'text-green-600', 'text-yellow-600'];
        const ratingIndex = Math.floor(Math.random() * ratings.length);
        return (
          <span className={`${colors[ratingIndex]} font-medium text-xs`}>
            {ratings[ratingIndex]}
          </span>
        );
      default:
        return 'N/A';
    }
  };

  const columns = getTableColumns();

  // Mobile Stock Card Component
  const MobileStockCard = ({ stock }: { stock: WatchlistStock }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
      onClick={() => setSelectedStock(stock)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link 
            href={`/stock/${stock.symbol.toLowerCase()}`}
            className="text-lg font-bold text-blue-600 hover:text-emerald-600"
            onClick={(e) => e.stopPropagation()}
          >
            {stock.symbol}
          </Link>
          <p className="text-sm text-gray-500 mt-0.5">{stock.name}</p>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-full">
          <MoreVertical className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(stock.price)}
          </div>
          <div className={`flex items-center space-x-1 text-sm font-medium ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
            <span className="text-gray-400">({stock.changePercent >= 0 ? '+' : ''}{formatPrice(stock.change)})</span>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="w-24 h-12">
          <svg width="96" height="48" viewBox="0 0 96 48" className="w-full h-full">
            <path
              d={`M0,${24 + Math.random() * 8} ${Array.from({ length: 12 }, (_, i) => 
                `L${i * 8},${24 + (Math.random() - 0.5) * 20}`
              ).join(' ')}`}
              stroke={stock.changePercent >= 0 ? '#22c55e' : '#ef4444'}
              strokeWidth="2"
              fill="none"
              className="opacity-60"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
        <div>
          <div className="text-xs text-gray-500">Volume</div>
          <div className="text-sm font-medium text-gray-900">{formatVolume(stock.volume)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Mkt Cap</div>
          <div className="text-sm font-medium text-gray-900">{formatNumber(stock.marketCap)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">P/E</div>
          <div className="text-sm font-medium text-gray-900">{stock.peRatio?.toFixed(2) || 'N/A'}</div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Watchlist</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAIPanel(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <BarChart3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Add stock symbol..."
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && addStock()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-3 space-y-2">
                <button
                  onClick={() => {
                    setShowWatchlistMenu(!showWatchlistMenu);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium"
                >
                  <span>{activeWatchlist}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="text-xs text-gray-500 px-3">
                  {stocks.length} stocks • Updated 2 min ago
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200 mb-4">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Company or stock symbol..."
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <div className="flex items-center space-x-6">
              <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">Log Out</button>
              <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">My Account</button>
            </div>
          </div>
        </div>
      </div>

      <main className="px-4 py-4 lg:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Market Indices - Hidden on mobile, scrollable on tablet */}
            <div className="hidden md:block mb-4 lg:mb-6">
              <h2 className="text-sm lg:text-base font-medium text-gray-700 mb-3">Stock Indexes - Premarket</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {marketIndices.map((index) => (
                  <div key={index.symbol} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">{index.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-red-600 text-sm">↓</span>
                          <span className="text-red-600 text-sm font-medium">{index.changePercent.toFixed(2)}%</span>
                        </div>
                      </div>
                      <div className="w-16 h-8 lg:w-20 lg:h-10">
                        <svg width="100%" height="100%" viewBox="0 0 80 40" preserveAspectRatio="none">
                          <path
                            d="M0,20 C12,16 20,12 28,15 C36,18 44,13 52,20 C60,28 68,32 80,36"
                            stroke="#ef4444"
                            strokeWidth="1.5"
                            fill="none"
                            className="opacity-80"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-xl font-semibold text-gray-900">Watchlist</h1>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </div>
                  <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">Watchlist Tutorial</span>
                </div>
              </div>

              {/* Watchlist Management */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <button
                      onClick={() => setShowWatchlistMenu(!showWatchlistMenu)}
                      className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                    >
                      <span className="font-medium text-gray-700">{activeWatchlist}</span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </button>

                    {showWatchlistMenu && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="p-2">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1 mb-1">My Watchlists</div>
                          {watchlists.map((list) => (
                            <button
                              key={list}
                              onClick={() => {
                                setActiveWatchlist(list);
                                setShowWatchlistMenu(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 flex items-center justify-between ${
                                activeWatchlist === list ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                              }`}
                            >
                              <span>{list}</span>
                              {activeWatchlist === list && <span className="text-blue-600">✓</span>}
                            </button>
                          ))}

                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <div className="flex items-center space-x-2 px-2">
                              <Plus className="h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Add new watchlist"
                                value={newWatchlistName}
                                onChange={(e) => setNewWatchlistName(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && newWatchlistName.trim()) {
                                    setWatchlists([...watchlists, newWatchlistName.trim()]);
                                    setActiveWatchlist(newWatchlistName.trim());
                                    setNewWatchlistName('');
                                    setShowWatchlistMenu(false);
                                  }
                                }}
                                className="flex-1 text-xs border-0 outline-none bg-transparent placeholder-gray-400"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    {stocks.length} stocks • Last updated 2 min ago
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="px-6 py-3 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Add new stock"
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && addStock()}
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
                      />
                    </div>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-700 text-sm border border-blue-200 rounded-md hover:bg-blue-50"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex space-x-6 px-6 min-w-max">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {stocks.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <BarChart3 className="h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-gray-500 text-base font-medium mb-1">No stocks in watchlist</p>
                            <p className="text-gray-400 text-sm">Add stocks to start tracking</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      stocks.map((stock) => (
                        <tr key={stock.symbol} className="hover:bg-gray-50 transition-colors">
                          {columns.map((col) => (
                            <td key={col.key} className="px-4 py-3 whitespace-nowrap text-sm">
                              {getCellValue(stock, col.key)}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {/* Tab Selector for Mobile */}
              <div className="mb-4 overflow-x-auto">
                <div className="flex space-x-2 pb-2">
                  {tabs.slice(0, 4).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Cards */}
              <div className="space-y-3">
                {stocks.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium mb-1">No stocks yet</p>
                    <p className="text-gray-400 text-sm">Search and add stocks above</p>
                  </div>
                ) : (
                  stocks.map((stock) => (
                    <MobileStockCard key={stock.symbol} stock={stock} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Desktop AI Sidebar */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-4">
              <AIAnalysisPanel
                title="Watchlist Insights"
                pageType="watchlist"
                pageData={{
                  stockCount: stocks.length,
                  activeWatchlist,
                  stocks: stocks.slice(0, 5).map(s => ({
                    symbol: s.symbol,
                    price: s.price,
                    change: s.changePercent,
                    sector: s.sector
                  })),
                  indices: marketIndices.map(idx => ({
                    name: idx.name,
                    change: idx.changePercent
                  }))
                }}
                autoAnalyze={stocks.length > 0}
                quickPrompts={[
                  'Portfolio performance',
                  'Diversification check',
                  'Risk analysis'
                ]}
                maxHeight="500px"
              />
            </div>
          </div>
        </div>

        {/* Mobile AI Panel Modal */}
        <AnimatePresence>
          {showAIPanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
              onClick={() => setShowAIPanel(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-lg">AI Insights</h3>
                  <button
                    onClick={() => setShowAIPanel(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 64px)' }}>
                  <AIAnalysisPanel
                    title=""
                    pageType="watchlist"
                    pageData={{
                      stockCount: stocks.length,
                      activeWatchlist,
                      stocks: stocks.slice(0, 5).map(s => ({
                        symbol: s.symbol,
                        price: s.price,
                        change: s.changePercent,
                        sector: s.sector
                      })),
                      indices: marketIndices.map(idx => ({
                        name: idx.name,
                        change: idx.changePercent
                      }))
                    }}
                    autoAnalyze={stocks.length > 0}
                    quickPrompts={[
                      'Portfolio performance',
                      'Diversification',
                      'Risk analysis'
                    ]}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stock Detail Modal (Mobile) */}
        <AnimatePresence>
          {selectedStock && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
              onClick={() => setSelectedStock(null)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="bg-white rounded-t-2xl w-full max-h-[70vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-xl">{selectedStock.symbol}</h3>
                    <button
                      onClick={() => setSelectedStock(null)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold">{formatPrice(selectedStock.price)}</span>
                    <span className={`text-lg font-medium ${selectedStock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 120px)' }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500 mb-1">Volume</div>
                      <div className="text-lg font-semibold">{formatVolume(selectedStock.volume)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500 mb-1">Market Cap</div>
                      <div className="text-lg font-semibold">{formatNumber(selectedStock.marketCap)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500 mb-1">P/E Ratio</div>
                      <div className="text-lg font-semibold">{selectedStock.peRatio?.toFixed(2) || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500 mb-1">Div Yield</div>
                      <div className="text-lg font-semibold">{(selectedStock.dividendYield || 0).toFixed(2)}%</div>
                    </div>
                  </div>
                  <Link
                    href={`/stock/${selectedStock.symbol.toLowerCase()}`}
                    className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    <span>View Full Details</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Stock Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add Stock to Watchlist</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Symbol
                  </label>
                  <input
                    type="text"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                    placeholder="e.g., AAPL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addStock()}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addStock}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Stock
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}