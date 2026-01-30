'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  Zap,
  Eye,
  Star,
  Filter,
  Search,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { formatPrice, formatNumber } from '@/lib/utils';
import { marketService } from '../utils/marketService';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AIAnalysisPanel from '../components/ai/AIAnalysisPanel';

interface TrendingStock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  trendType: 'gainer' | 'loser' | 'volume' | 'breakout' | 'momentum';
  trendScore: number;
  socialMentions: number;
  newsCount: number;
  analyst_rating: 'Buy' | 'Hold' | 'Sell';
}

export default function TrendingPage() {
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const [stocks, setStocks] = useState<TrendingStock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<TrendingStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'trendScore' | 'changePercent' | 'volume' | 'marketCap'>('trendScore');

  const filterTypes = [
    { key: 'all', label: 'All Trending', icon: Activity },
    { key: 'gainer', label: 'Top Gainers', icon: TrendingUp },
    { key: 'loser', label: 'Top Losers', icon: TrendingDown },
    { key: 'volume', label: 'High Volume', icon: Eye },
    { key: 'breakout', label: 'Breakouts', icon: Zap },
    { key: 'momentum', label: 'Momentum', icon: Flame }
  ];

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);

        // Fetch gainers, losers, and most active from real API
        const [gainersRes, losersRes, mostActiveRes] = await Promise.all([
          marketService.getMovers('gainers', 15),
          marketService.getMovers('losers', 15),
          marketService.getMostActive(10)
        ]);

        const trendingStocks: TrendingStock[] = [];

        // Process gainers
        if (gainersRes && Array.isArray((gainersRes as any).gainers)) {
          (gainersRes as any).gainers.forEach((stock: any, i: number) => {
            const trendType = stock.changePercent > 5 ? 'breakout' : stock.changePercent > 2 ? 'momentum' : 'gainer';
            trendingStocks.push({
              id: `g-${i}`,
              symbol: stock.symbol || '',
              name: stock.name || '',
              price: stock.price || 0,
              change: stock.change || 0,
              changePercent: stock.changePercent || 0,
              volume: stock.volume || 0,
              marketCap: stock.marketCap || 0,
              sector: stock.sector || 'Technology',
              trendType,
              trendScore: Math.min(100, 50 + (stock.changePercent || 0) * 5),
              socialMentions: Math.floor((stock.volume || 0) / 100000), // More realistic calculation
              newsCount: 0, // Will be fetched separately if needed
              analyst_rating: stock.changePercent > 3 ? 'Buy' : 'Hold'
            });
          });
        }

        // Process losers
        if (losersRes && Array.isArray((losersRes as any).losers)) {
          (losersRes as any).losers.forEach((stock: any, i: number) => {
            trendingStocks.push({
              id: `l-${i}`,
              symbol: stock.symbol || '',
              name: stock.name || '',
              price: stock.price || 0,
              change: stock.change || 0,
              changePercent: stock.changePercent || 0,
              volume: stock.volume || 0,
              marketCap: stock.marketCap || 0,
              sector: stock.sector || 'Technology',
              trendType: 'loser',
              trendScore: Math.max(0, 50 + (stock.changePercent || 0) * 5),
              socialMentions: Math.floor((stock.volume || 0) / 100000),
              newsCount: 0,
              analyst_rating: stock.changePercent < -3 ? 'Sell' : 'Hold'
            });
          });
        }

        // Process most active stocks and mark some as volume leaders
        if (mostActiveRes && Array.isArray(mostActiveRes)) {
          mostActiveRes.forEach((stock: any) => {
            const existingStock = trendingStocks.find(s => s.symbol === stock.symbol);
            if (existingStock && existingStock.trendType === 'gainer') {
              existingStock.trendType = 'volume';
              existingStock.trendScore = Math.min(100, existingStock.trendScore + 20);
            }
          });
        }

        setStocks(trendingStocks);
        setFilteredStocks(trendingStocks);
      } catch (error) {
        console.error('Error fetching trending stocks:', error);
        toast.error('Failed to load trending stocks data');
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  useEffect(() => {
    let filtered = stocks.filter(stock => {
      const matchesSearch = stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = activeFilter === 'all' || stock.trendType === activeFilter;

      return matchesSearch && matchesFilter;
    });

    // Sort stocks
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      return typeof aValue === 'number' && typeof bValue === 'number' ? bValue - aValue : 0;
    });

    setFilteredStocks(filtered);
  }, [stocks, searchTerm, activeFilter, sortBy]);

  const getTrendIcon = (trendType: TrendingStock['trendType']) => {
    switch (trendType) {
      case 'gainer': return TrendingUp;
      case 'loser': return TrendingDown;
      case 'volume': return Eye;
      case 'breakout': return Zap;
      case 'momentum': return Flame;
      default: return Activity;
    }
  };

  const getTrendColor = (trendType: TrendingStock['trendType']) => {
    switch (trendType) {
      case 'gainer': return 'bg-green-100 text-green-700';
      case 'loser': return 'bg-red-100 text-red-700';
      case 'volume': return 'bg-blue-100 text-blue-700';
      case 'breakout': return 'bg-purple-100 text-purple-700';
      case 'momentum': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRatingColor = (rating: TrendingStock['analyst_rating']) => {
    switch (rating) {
      case 'Buy': return 'bg-green-100 text-green-700';
      case 'Hold': return 'bg-yellow-100 text-yellow-700';
      case 'Sell': return 'bg-red-100 text-red-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Activity className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Loading Trending Stocks</h2>
              <p className="text-gray-600">Please wait while we fetch the latest trending data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="p-4 lg:p-8">
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 lg:mb-8"
            >
              <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 lg:mb-4">
                Trending Stocks
              </h1>
              <p className="text-base lg:text-xl text-gray-600">
                Discover the most talked about and actively traded stocks
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8"
            >
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Flame className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" />
                  <span className="text-xs lg:text-sm text-gray-500">Most Mentioned</span>
                </div>
                <p className="text-xl lg:text-3xl font-bold text-gray-900">
                  {filteredStocks.length > 0 ? filteredStocks.reduce((max, stock) => 
                    stock.socialMentions > (max?.socialMentions || 0) ? stock : max, filteredStocks[0])?.symbol || 'N/A' : 'N/A'}
                </p>
                <p className="text-xs lg:text-sm text-green-600 font-medium">
                  {filteredStocks.length > 0 ? 
                    `${filteredStocks.reduce((max, stock) => 
                      stock.socialMentions > (max?.socialMentions || 0) ? stock : max, filteredStocks[0])?.socialMentions || 0} mentions` : 
                    'No data'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
                  <span className="text-xs lg:text-sm text-gray-500">Top Gainer</span>
                </div>
                <p className="text-xl lg:text-3xl font-bold text-gray-900">
                  {filteredStocks.length > 0 ? 
                    `+${Math.max(...filteredStocks.filter(s => s.changePercent > 0).map(s => s.changePercent)).toFixed(2)}%` : 
                    '+0.00%'}
                </p>
                <p className="text-xs lg:text-sm text-gray-600">
                  {filteredStocks.length > 0 ? 
                    filteredStocks.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent)[0]?.symbol || 'N/A' : 
                    'No gainers'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Eye className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                  <span className="text-xs lg:text-sm text-gray-500">Highest Volume</span>
                </div>
                <p className="text-xl lg:text-3xl font-bold text-gray-900">
                  {filteredStocks.length > 0 ? 
                    formatNumber(Math.max(...filteredStocks.map(s => s.volume))) : 
                    '0'}
                </p>
                <p className="text-xs lg:text-sm text-gray-600">
                  {filteredStocks.length > 0 ? 
                    filteredStocks.sort((a, b) => b.volume - a.volume)[0]?.symbol || 'N/A' : 
                    'No data'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
                  <span className="text-xs lg:text-sm text-gray-500">Breakout Score</span>
                </div>
                <p className="text-xl lg:text-3xl font-bold text-gray-900">
                  {filteredStocks.length > 0 ? 
                    Math.max(...filteredStocks.map(s => s.trendScore)).toFixed(0) : 
                    '0'}
                </p>
                <p className="text-xs lg:text-sm text-gray-600">
                  {filteredStocks.length > 0 ? 
                    filteredStocks.sort((a, b) => b.trendScore - a.trendScore)[0]?.symbol || 'N/A' : 
                    'No data'}
                </p>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl p-4 lg:p-6 shadow-lg border border-gray-100 mb-6 lg:mb-8"
            >
              <div className="flex flex-col gap-4">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {filterTypes.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${activeFilter === filter.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        <Icon className="h-3 w-3 lg:h-4 lg:w-4" />
                        <span className="hidden sm:inline">{filter.label}</span>
                        <span className="sm:hidden">{filter.key === 'all' ? 'All' : 
                          filter.key === 'gainer' ? 'Gainers' :
                          filter.key === 'loser' ? 'Losers' :
                          filter.key === 'volume' ? 'Volume' :
                          filter.key === 'breakout' ? 'Breakout' : 'Momentum'}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="trendScore">Trend Score</option>
                    <option value="changePercent">Price Change</option>
                    <option value="volume">Volume</option>
                    <option value="marketCap">Market Cap</option>
                  </select>

                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search stocks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stock Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
            >
              {filteredStocks.map((stock, index) => {
                const TrendIcon = getTrendIcon(stock.trendType);
                return (
                  <motion.div
                    key={stock.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-4 lg:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <TrendIcon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base lg:text-lg font-bold text-gray-900">{stock.symbol}</h3>
                          <p className="text-xs lg:text-sm text-gray-600 truncate max-w-[120px] lg:max-w-none">{stock.name}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTrendColor(stock.trendType)}`}>
                          {stock.trendType}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRatingColor(stock.analyst_rating)}`}>
                          {stock.analyst_rating}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-lg lg:text-2xl font-bold text-gray-900">{formatPrice(stock.price)}</p>
                        <div className="text-right">
                          <p className={`font-semibold text-sm lg:text-base ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)}
                          </p>
                          <p className={`text-xs lg:text-sm ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.changePercent >= 0 ? '+' : ''}{formatPercentage(stock.changePercent)}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {stock.sector}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 lg:gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Volume</p>
                        <p className="font-semibold text-sm lg:text-base text-gray-900">{formatNumber(stock.volume)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Market Cap</p>
                        <p className="font-semibold text-sm lg:text-base text-gray-900">{formatNumber(stock.marketCap)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Trend Score</p>
                        <p className="font-semibold text-sm lg:text-base text-gray-900">{stock.trendScore}/100</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Social</p>
                        <p className="font-semibold text-sm lg:text-base text-gray-900">{formatNumber(stock.socialMentions)}</p>
                      </div>
                    </div>

                    <div className="mb-4 p-2 lg:p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-xs lg:text-sm text-gray-600">News: {stock.newsCount}</span>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 lg:h-4 lg:w-4 ${i < Math.floor(stock.trendScore / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-4 border-t border-gray-100 gap-2">
                      <button className="flex items-center justify-center sm:justify-start space-x-1 text-blue-600 hover:text-blue-700 transition-colors text-sm">
                        <Star className="h-4 w-4" />
                        <span className="font-medium">Watchlist</span>
                      </button>
                      <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="flex items-center justify-center sm:justify-end space-x-1 text-gray-600 hover:text-emerald-600 transition-colors text-sm">
                        <ExternalLink className="h-4 w-4" />
                        <span className="font-medium">Details</span>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {filteredStocks.length === 0 && (
              <div className="text-center py-16">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No trending stocks found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>

          {/* AI Analysis Sidebar */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="xl:sticky xl:top-4">
              <AIAnalysisPanel
                title="Trend Analysis"
                pageType="trending"
                pageData={{
                  count: filteredStocks.length,
                  activeFilter,
                  trending: filteredStocks.slice(0, 5).map(s => ({
                    symbol: s.symbol,
                    name: s.name,
                    changePercent: s.changePercent,
                    trendType: s.trendType,
                    trendScore: s.trendScore
                  })),
                  topGainer: filteredStocks.filter(s => s.changePercent > 0)[0]?.symbol,
                  topLoser: filteredStocks.filter(s => s.changePercent < 0)[0]?.symbol
                }}
                autoAnalyze={!loading && filteredStocks.length > 0}
                quickPrompts={[
                  'Why are these stocks trending?',
                  'Trading signals',
                  'Market momentum analysis'
                ]}
                maxHeight="500px"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}