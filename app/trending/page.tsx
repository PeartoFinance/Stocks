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
  ExternalLink,
  Brain,
  X
} from 'lucide-react';
import { formatPrice, formatNumber } from '@/lib/utils';
import { marketService } from '../utils/marketService';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AIAnalysisPanel from '../components/ai/AIAnalysisPanel';

import { Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

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
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

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

  // Chart data preparation functions
  const getTrendTypeDistribution = () => {
    const distribution = filteredStocks.reduce((acc, stock) => {
      acc[stock.trendType] = (acc[stock.trendType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(distribution).map(key => {
        const type = key as TrendingStock['trendType'];
        const filterType = filterTypes.find(f => f.key === type);
        return filterType?.label || key;
      }),
      datasets: [{
        data: Object.values(distribution),
        backgroundColor: [
          '#3b82f6', // Blue - gainers
          '#ef4444', // Red - losers  
          '#10b981', // Green - volume
          '#f59e0b', // Amber - breakouts
          '#8b5cf6'  // Violet - momentum
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  };

  const getSectorDistribution = () => {
    const sectorData = filteredStocks.reduce((acc, stock) => {
      acc[stock.sector] = (acc[stock.sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sectors = Object.keys(sectorData).slice(0, 8); // Top 8 sectors
    const others = Object.keys(sectorData).slice(8).reduce((sum, sector) => sum + sectorData[sector], 0);

    const labels = sectors.length > 0 ? [...sectors, others > 0 ? 'Others' : ''] : ['No Data'];
    const data = sectors.length > 0 ? [...sectors.map(s => sectorData[s]), others > 0 ? others : 0] : [1];

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
          '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
          '#6b7280'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  };

  const getPerformanceDistribution = () => {
    const performers = {
      positive: filteredStocks.filter(s => s.changePercent > 0).length,
      negative: filteredStocks.filter(s => s.changePercent < 0).length,
      neutral: filteredStocks.filter(s => s.changePercent === 0).length
    };

    return {
      labels: ['Positive', 'Negative', 'Neutral'],
      datasets: [{
        data: [performers.positive, performers.negative, performers.neutral],
        backgroundColor: ['#10b981', '#ef4444', '#6b7280'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  };

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
      <main className="p-3 lg:p-6">
        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 lg:mb-8 mt-4 lg:mt-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Trending Stocks
                </h1>
                <button
                  onClick={() => setIsAIPanelOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Brain className="h-4 w-4" />
                  AI Analysis
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Discover the most talked about and actively traded stocks
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4"
            >
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  <span className="text-xs text-gray-500">Most Mentioned</span>
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {filteredStocks.length > 0 ? filteredStocks.reduce((max, stock) => 
                    stock.socialMentions > (max?.socialMentions || 0) ? stock : max, filteredStocks[0])?.symbol || 'N/A' : 'N/A'}
                </p>
                <p className="text-xs text-green-600 font-medium">
                  {filteredStocks.length > 0 ? 
                    `${filteredStocks.reduce((max, stock) => 
                      stock.socialMentions > (max?.socialMentions || 0) ? stock : max, filteredStocks[0])?.socialMentions || 0} mentions` : 
                    'No data'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-xs text-gray-500">Top Gainer</span>
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {filteredStocks.length > 0 ? 
                    filteredStocks.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent)[0]?.symbol || 'N/A' : 
                    'No gainers'}
                </p>
                <p className="text-xs text-green-600 font-medium">
                  {filteredStocks.length > 0 ? 
                    `+${Math.max(...filteredStocks.filter(s => s.changePercent > 0).map(s => s.changePercent)).toFixed(2)}%` : 
                    '+0.00%'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="text-xs text-gray-500">Highest Volume</span>
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {filteredStocks.length > 0 ? 
                    filteredStocks.sort((a, b) => b.volume - a.volume)[0]?.symbol || 'N/A' : 
                    'No data'}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  {filteredStocks.length > 0 ? 
                    formatNumber(Math.max(...filteredStocks.map(s => s.volume))) : 
                    '0'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-gray-500">Breakout Score</span>
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {filteredStocks.length > 0 ? 
                    filteredStocks.sort((a, b) => b.trendScore - a.trendScore)[0]?.symbol || 'N/A' : 
                    'No data'}
                </p>
                <p className="text-xs text-purple-600 font-medium">
                  {filteredStocks.length > 0 ? 
                    Math.max(...filteredStocks.map(s => s.trendScore)).toFixed(0) : 
                    '0'}
                </p>
              </div>
            </motion.div>

            {/* Charts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4"
            >
              {/* Trend Type Distribution */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Trend Distribution</h3>
                <div className="h-56">
                  <Pie
                    data={getTrendTypeDistribution()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 15,
                            font: {
                              size: 12,
                              weight: 500
                            },
                            color: '#374151'
                          }
                        },
                        tooltip: {
                          bodyFont: {
                            size: 13,
                            weight: 500
                          },
                          titleFont: {
                            size: 14,
                            weight: 600
                          },
                          padding: 12,
                          cornerRadius: 8
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Sector Distribution */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Sector Distribution</h3>
                <div className="h-56">
                  <Doughnut
                    data={getSectorDistribution()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 12,
                            font: {
                              size: 12,
                              weight: 500
                            },
                            color: '#374151'
                          }
                        },
                        tooltip: {
                          bodyFont: {
                            size: 13,
                            weight: 500
                          },
                          titleFont: {
                            size: 14,
                            weight: 600
                          },
                          padding: 12,
                          cornerRadius: 8
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Performance Distribution */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Performance Overview</h3>
                <div className="h-56">
                  <Pie
                    data={getPerformanceDistribution()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 15,
                            font: {
                              size: 12,
                              weight: 500
                            },
                            color: '#374151'
                          }
                        },
                        tooltip: {
                          bodyFont: {
                            size: 13,
                            weight: 500
                          },
                          titleFont: {
                            size: 14,
                            weight: 600
                          },
                          padding: 12,
                          cornerRadius: 8
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 mb-4"
            >
              <div className="flex flex-col gap-3">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {filterTypes.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFilter === filter.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        <Icon className="h-3 w-3" />
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

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="trendScore">Trend Score</option>
                    <option value="changePercent">Change %</option>
                    <option value="volume">Volume</option>
                    <option value="marketCap">Market Cap</option>
                  </select>

                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search stocks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stock Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Table Header */}
              <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-0.5 sm:gap-4 text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  <div className="col-span-3 sm:col-span-3">Stock</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Change</div>
                  <div className="col-span-2 text-center">Volume</div>
                  <div className="col-span-1 text-center">Mkt Cap</div>
                  <div className="col-span-1 text-center">Score</div>
                  <div className="col-span-1 text-center">Social</div>
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-100">
                {filteredStocks.map((stock, index) => {
                  const TrendIcon = getTrendIcon(stock.trendType);
                  return (
                    <motion.div
                      key={stock.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="px-2 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="grid grid-cols-12 gap-0.5 sm:gap-4 items-center">
                        {/* Stock Info */}
                        <div className="col-span-3 flex items-center space-x-1 sm:space-x-2 min-w-0">
                          <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center flex-shrink-0">
                            <TrendIcon className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link 
                              href={`/stock/${stock.symbol.toLowerCase()}`}
                              className="text-[10px] sm:text-xs font-bold text-gray-900 hover:text-blue-600 transition-colors block truncate"
                            >
                              {stock.symbol}
                            </Link>
                            <p className="text-[9px] sm:text-xs text-gray-600 truncate hidden sm:block">{stock.name}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-2 text-center">
                          <p className="text-[10px] sm:text-sm font-bold text-gray-900 truncate">{formatPrice(stock.price)}</p>
                        </div>

                        {/* Change */}
                        <div className="col-span-2 text-center">
                          <p className={`font-semibold text-[9px] sm:text-xs ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                            {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)}
                          </p>
                          <p className={`text-[9px] sm:text-xs ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                            {stock.changePercent >= 0 ? '+' : ''}{formatPercentage(stock.changePercent)}
                          </p>
                        </div>

                        {/* Volume */}
                        <div className="col-span-2 text-center">
                          <p className="text-[9px] sm:text-xs font-medium text-gray-900 truncate">{formatNumber(stock.volume)}</p>
                        </div>

                        {/* Market Cap */}
                        <div className="col-span-1 text-center">
                          <p className="text-[9px] sm:text-xs font-medium text-gray-900 truncate">{formatNumber(stock.marketCap)}</p>
                        </div>

                        {/* Trend Score */}
                        <div className="col-span-1 text-center">
                          <p className="text-[9px] sm:text-xs font-medium text-gray-900 truncate">{stock.trendScore.toFixed(3)}/100</p>
                        </div>

                        {/* Social */}
                        <div className="col-span-1 text-center">
                          <p className="text-[9px] sm:text-xs font-medium text-gray-900 truncate">{formatNumber(stock.socialMentions)}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {filteredStocks.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-gray-900 mb-2">No trending stocks found</h3>
                <p className="text-xs text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
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
                <h3 className="text-sm font-semibold text-gray-900">AI Trend Analysis</h3>
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