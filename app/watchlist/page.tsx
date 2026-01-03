'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Plus,
  Edit3,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { formatPrice, formatNumber, formatPercent, formatVolume } from '@/lib/utils';
import { stockAPI } from '../utils/api';
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

  // Mock market indices data matching the image
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

  // Close watchlist dropdown when clicking outside
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
      // Quick load without delay
      setStocks([]);
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

  // Get table columns based on active tab
  const getTableColumns = () => {
    switch (activeTab) {
      case 'Dividends':
        return [
          { key: 'symbol', label: 'Symbol', width: 'w-24' },
          { key: 'price', label: 'Price', width: 'w-24' },
          { key: 'chg', label: 'Chg %', width: 'w-24' },
          { key: 'annualDiv', label: 'Annual Div ($)', width: 'w-32' },
          { key: 'divYield', label: 'Dividend Yield', width: 'w-32' },
          { key: 'divGrowth', label: 'Dividend Growth', width: 'w-32' },
          { key: 'exDiv', label: 'Ex-Div Date', width: 'w-28' },
          { key: 'payment', label: 'Payment Date', width: 'w-28' },
          { key: 'payout', label: 'Payout Ratio', width: 'w-28' },
          { key: 'buyback', label: 'Buyback Yield', width: 'w-28' }
        ];
      case 'Forecasts':
        return [
          { key: 'symbol', label: 'Symbol', width: 'w-24' },
          { key: 'price', label: 'Price', width: 'w-24' },
          { key: 'chg', label: 'Chg %', width: 'w-24' },
          { key: 'priceTarget', label: 'Price Target', width: 'w-28' },
          { key: 'priceTargetUpside', label: 'Price Target\nUpside (%)', width: 'w-32' },
          { key: 'analystRating', label: 'Analyst\nRating', width: 'w-28' },
          { key: 'revGrowth', label: 'Rev Growth\nNext Year', width: 'w-32' },
          { key: 'epsGrowth', label: 'EPS Growth\nNext Year', width: 'w-32' }
        ];
        return [
          { key: 'symbol', label: 'Symbol', width: 'w-24' },
          { key: 'price', label: 'Price', width: 'w-24' },
          { key: 'chg', label: 'Chg %', width: 'w-24' },
          { key: 'marketCap', label: 'Market Cap', width: 'w-28' },
          { key: 'pe', label: 'P/E Ratio', width: 'w-24' },
          { key: 'pb', label: 'P/B Ratio', width: 'w-24' },
          { key: 'ps', label: 'P/S Ratio', width: 'w-24' },
          { key: 'roe', label: 'ROE %', width: 'w-24' },
          { key: 'debt', label: 'Debt/Equity', width: 'w-28' },
          { key: 'revenue', label: 'Revenue', width: 'w-28' }
        ];
      default: // General
        return [
          { key: 'symbol', label: 'Symbol', width: 'w-24' },
          { key: 'price', label: 'Price', width: 'w-24' },
          { key: 'chg', label: 'Chg %', width: 'w-24' },
          { key: 'volume', label: 'Volume', width: 'w-28' },
          { key: 'premktPrice', label: 'Premarket\nPrice', width: 'w-28' },
          { key: 'premktChg', label: 'Premkt. Chg%', width: 'w-28' },
          { key: 'marketCap', label: 'Market Cap', width: 'w-28' },
          { key: 'pe', label: 'PE Ratio', width: 'w-24' },
          { key: 'earnings', label: 'Earnings Date', width: 'w-28' },
          { key: '52wLow', label: '% Chg 52w\nLow', width: 'w-28' }
        ];
    }
  };

  // Get cell value based on column and stock data
  const getCellValue = (stock: WatchlistStock, columnKey: string) => {
    switch (columnKey) {
      case 'symbol':
        return <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="font-medium text-blue-600 hover:text-emerald-600 hover:underline">{stock.symbol}</Link>;
      case 'price':
        return formatPrice(stock.price);
      case 'chg':
        return (
          <span className={stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </span>
        );
      case 'volume':
        return formatVolume(stock.volume);
      case 'premktPrice':
        return formatPrice(stock.premktPrice || stock.price);
      case 'premktChg':
        return (
          <span className={(stock.premktChg || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
            {(stock.premktChg || 0) >= 0 ? '+' : ''}{((stock.premktChg || 0) * 100).toFixed(2)}%
          </span>
        );
      case 'marketCap':
        return formatNumber(stock.marketCap);
      case 'pe':
        return stock.peRatio?.toFixed(2) || 'N/A';
      case 'earnings':
        return stock.earningsDate ? new Date(stock.earningsDate).toLocaleDateString() : 'N/A';
      case '52wLow':
        return (
          <span className="text-green-600">
            +{(((stock.price - (stock.week52Low || stock.price * 0.8)) / (stock.week52Low || stock.price * 0.8)) * 100).toFixed(1)}%
          </span>
        );
      // Dividend specific columns
      case 'annualDiv':
        return formatPrice(stock.annualDividend || 0);
      case 'divYield':
        return `${(stock.dividendYield || 0).toFixed(2)}%`;
      case 'divGrowth':
        return (
          <span className={(stock.dividendGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
            {(stock.dividendGrowth || 0) >= 0 ? '+' : ''}{(stock.dividendGrowth || 0).toFixed(1)}%
          </span>
        );
      case 'exDiv':
        return stock.exDivDate ? new Date(stock.exDivDate).toLocaleDateString() : 'N/A';
      case 'payment':
        return stock.paymentDate ? new Date(stock.paymentDate).toLocaleDateString() : 'N/A';
      case 'payout':
        return `${(stock.payoutRatio || 0).toFixed(1)}%`;
      case 'buyback':
        return `${(stock.buybackYield || 0).toFixed(2)}%`;
      // Performance columns (mock data)
      case '1d':
        return (
          <span className={stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </span>
        );
      case '5d':
        const fiveDay = (Math.random() - 0.5) * 8;
        return (
          <span className={fiveDay >= 0 ? 'text-green-600' : 'text-red-600'}>
            {fiveDay >= 0 ? '+' : ''}{fiveDay.toFixed(2)}%
          </span>
        );
      case '1m':
        const oneMonth = (Math.random() - 0.4) * 15;
        return (
          <span className={oneMonth >= 0 ? 'text-green-600' : 'text-red-600'}>
            {oneMonth >= 0 ? '+' : ''}{oneMonth.toFixed(2)}%
          </span>
        );
      case '3m':
        const threeMonth = (Math.random() - 0.3) * 20;
        return (
          <span className={threeMonth >= 0 ? 'text-green-600' : 'text-red-600'}>
            {threeMonth >= 0 ? '+' : ''}{threeMonth.toFixed(2)}%
          </span>
        );
      case '6m':
        const sixMonth = (Math.random() - 0.2) * 25;
        return (
          <span className={sixMonth >= 0 ? 'text-green-600' : 'text-red-600'}>
            {sixMonth >= 0 ? '+' : ''}{sixMonth.toFixed(2)}%
          </span>
        );
      case '1y':
        const oneYear = (Math.random() - 0.1) * 30;
        return (
          <span className={oneYear >= 0 ? 'text-green-600' : 'text-red-600'}>
            {oneYear >= 0 ? '+' : ''}{oneYear.toFixed(2)}%
          </span>
        );
      case 'ytd':
        const ytd = (Math.random() - 0.1) * 25;
        return (
          <span className={ytd >= 0 ? 'text-green-600' : 'text-red-600'}>
            {ytd >= 0 ? '+' : ''}{ytd.toFixed(2)}%
          </span>
        );
      // Fundamentals columns (mock data)
      case 'pb':
        const pb = Math.random() * 5 + 0.5;
        return pb.toFixed(2);
      case 'ps':
        const ps = Math.random() * 8 + 0.3;
        return ps.toFixed(2);
      case 'roe':
        const roe = Math.random() * 25 + 5;
        return `${roe.toFixed(1)}%`;
      case 'debt':
        const debt = Math.random() * 2 + 0.1;
        return debt.toFixed(2);
      case 'revenue':
        const revenue = Math.random() * 100000000000 + 1000000000;
        return formatNumber(revenue);
      // Forecasts columns
      case 'priceTarget':
        const target = stock.price * (0.9 + Math.random() * 0.4); // ±20% of current price
        return formatPrice(target);
      case 'priceTargetUpside':
        const upside = (Math.random() - 0.3) * 40; // -12% to +28%
        return (
          <span className={upside >= 0 ? 'text-green-600' : 'text-red-600'}>
            {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
          </span>
        );
      case 'analystRating':
        const ratings = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'];
        const colors = ['text-green-700', 'text-green-600', 'text-yellow-600', 'text-red-600', 'text-red-700'];
        const ratingIndex = Math.floor(Math.random() * ratings.length);
        return (
          <span className={colors[ratingIndex] + ' font-medium'}>
            {ratings[ratingIndex]}
          </span>
        );
      case 'revGrowth':
        const revGrowth = Math.random() * 30 - 5; // -5% to +25%
        return (
          <span className={revGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
            {revGrowth >= 0 ? '+' : ''}{revGrowth.toFixed(1)}%
          </span>
        );
      case 'epsGrowth':
        const epsGrowthVal = Math.random() * 40 - 10; // -10% to +30%
        return (
          <span className={epsGrowthVal >= 0 ? 'text-green-600' : 'text-red-600'}>
            {epsGrowthVal >= 0 ? '+' : ''}{epsGrowthVal.toFixed(1)}%
          </span>
        );
      default:
        return 'N/A';
    }
  };

  const columns = getTableColumns();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-4 py-4 max-w-none">
        {/* Top Search Bar */}
        <div className="bg-white border-b border-gray-200 mb-4 -mx-4 px-6 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Company or stock symbol..."
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs font-mono">/</span>
            </div>
            <div className="flex items-center space-x-6">
              <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">Log Out</button>
              <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">My Account</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1">
              <div className="max-w-none">
                {/* Stock Indices - Premarket */}
                <div className="mb-4">
                  <h2 className="text-base font-medium text-gray-700 mb-3">Stock Indexes - Premarket</h2>
                  <div className="grid grid-cols-4 gap-3">
                    {marketIndices.map((index) => (
                      <div key={index.symbol} className="bg-white rounded-md p-3 border border-gray-200 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm mb-1">{index.name}</h3>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-red-600 text-sm">↓</span>
                              <span className="text-red-600 text-sm font-medium">{index.changePercent.toFixed(2)}%</span>
                            </div>
                          </div>
                          <div className="w-20 h-10">
                            <svg width="80" height="40" viewBox="0 0 80 40" className="w-full h-full">
                              <defs>
                                <pattern id={`grid-${index.symbol}`} width="12" height="6" patternUnits="userSpaceOnUse">
                                  <path d="M 12 0 L 0 0 0 6" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3" />
                                </pattern>
                              </defs>
                              <rect width="80" height="40" fill={`url(#grid-${index.symbol})`} />
                              <line x1="0" y1="28" x2="80" y2="28" stroke="#9ca3af" strokeWidth="1" strokeDasharray="1,2" opacity="0.5" />
                              <path
                                d="M0,20 C12,16 20,12 28,15 C36,18 44,13 52,20 C60,28 68,32 80,36"
                                stroke="#22c55e"
                                strokeWidth="1.5"
                                fill="none"
                                className="opacity-80"
                              />
                              <path
                                d="M36,18 C44,13 52,20 60,28 C68,32 80,36 80,36"
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

                {/* Watchlist Section */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
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
                                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 flex items-center justify-between ${activeWatchlist === list ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
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
                      <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 text-sm">
                          <span>Chart View →</span>
                        </button>
                        <div className="relative">
                          <button className="flex items-center space-x-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 text-sm">
                            <span>Options</span>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-6 px-6">
                      {tabs.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-800'
                            }`}
                        >
                          {tab}
                        </button>
                      ))}
                      <div className="flex-1"></div>
                      <button className="py-3 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                        <Plus className="h-4 w-4" />
                        <span>Add View</span>
                      </button>
                      <button className="py-3 text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center space-x-1">
                        <Edit3 className="h-4 w-4" />
                        <span>Edit View</span>
                      </button>
                    </nav>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {columns.map((col) => (
                            <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {col.label.split('\n').map((line, i) => (
                                <div key={i}>{line}</div>
                              ))}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {stocks.length === 0 ? (
                          <tr>
                            <td colSpan={columns.length} className="px-6 py-24 text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
                                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                </div>
                                <p className="text-gray-500 text-base font-medium mb-1">No stocks in watchlist</p>
                                <p className="text-gray-400 text-sm">Click "Add new stock" above to add your first stock.</p>
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

              </div>
            </div>

            {/* AI Analysis Sidebar */}
            <div className="w-full xl:w-80 flex-shrink-0">
              <div className="xl:sticky xl:top-4">
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

          {/* Add Stock Modal */}
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
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
        </div>
      </main>
    </div>
  );
}