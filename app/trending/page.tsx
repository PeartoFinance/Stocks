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
import { stockAPI } from '../utils/api';
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

        // Fetch gainers and losers from real API
        const [gainersRes, losersRes] = await Promise.all([
          stockAPI.getMarketMovers('gainers'),
          stockAPI.getMarketMovers('losers')
        ]);

        const trendingStocks: TrendingStock[] = [];

        if (gainersRes.success && gainersRes.data) {
          gainersRes.data.forEach((stock: any, i: number) => {
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
              socialMentions: Math.floor((stock.volume || 0) / 1000),
              newsCount: Math.floor(Math.random() * 30 + 5),
              analyst_rating: stock.changePercent > 3 ? 'Buy' : 'Hold'
            });
          });
        }

        if (losersRes.success && losersRes.data) {
          losersRes.data.forEach((stock: any, i: number) => {
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
              socialMentions: Math.floor((stock.volume || 0) / 1000),
              newsCount: Math.floor(Math.random() * 20 + 3),
              analyst_rating: stock.changePercent < -3 ? 'Sell' : 'Hold'
            });
          });
        }

        // Sort by volume for "volume" type
        const sortedByVolume = [...trendingStocks].sort((a, b) => b.volume - a.volume);
        sortedByVolume.slice(0, 3).forEach(s => { if (s.trendType === 'gainer') s.trendType = 'volume'; });

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
      <main className="p-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Trending Stocks
              </h1>
              <p className="text-xl text-gray-600">
                Discover the most talked about and actively traded stocks
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Flame className="h-8 w-8 text-orange-600" />
                  <span className="text-sm text-gray-500">Most Mentioned</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">NVDA</p>
                <p className="text-sm text-green-600 font-medium">45K social mentions</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <span className="text-sm text-gray-500">Top Gainer</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">+13.95%</p>
                <p className="text-sm text-gray-600">PLTR today's gain</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Eye className="h-8 w-8 text-blue-600" />
                  <span className="text-sm text-gray-500">Highest Volume</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">85.4M</p>
                <p className="text-sm text-gray-600">PLTR volume today</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                  <span className="text-sm text-gray-500">Breakout Score</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">95</p>
                <p className="text-sm text-gray-600">NVDA trend score</p>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
            >
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {filterTypes.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{filter.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-4 items-center">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="trendScore">Trend Score</option>
                    <option value="changePercent">Price Change</option>
                    <option value="volume">Volume</option>
                    <option value="marketCap">Market Cap</option>
                  </select>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search stocks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {filteredStocks.map((stock, index) => {
                const TrendIcon = getTrendIcon(stock.trendType);
                return (
                  <motion.div
                    key={stock.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <TrendIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{stock.symbol}</h3>
                          <p className="text-sm text-gray-600">{stock.name}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
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
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(stock.price)}</p>
                        <div className="text-right">
                          <p className={`font-semibold ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)}
                          </p>
                          <p className={`text-sm ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.changePercent >= 0 ? '+' : ''}{formatPercentage(stock.changePercent)}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {stock.sector}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Volume</p>
                        <p className="font-semibold text-gray-900">{formatNumber(stock.volume)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Market Cap</p>
                        <p className="font-semibold text-gray-900">{formatNumber(stock.marketCap)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Trend Score</p>
                        <p className="font-semibold text-gray-900">{stock.trendScore}/100</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Social Mentions</p>
                        <p className="font-semibold text-gray-900">{formatNumber(stock.socialMentions)}</p>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">News Articles: {stock.newsCount}</span>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(stock.trendScore / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
                        <Star className="h-4 w-4" />
                        <span className="text-sm font-medium">Add to Watchlist</span>
                      </button>
                      <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="flex items-center space-x-1 text-gray-600 hover:text-emerald-600 transition-colors">
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-sm font-medium">View Details</span>
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