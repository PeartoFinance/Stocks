'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/context/ThemeContext';
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
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { useCurrency } from '../../context/CurrencyContext';
import { marketService } from '../../utils/marketService';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AIAnalysisPanel from '../ai/AIAnalysisPanel';

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

export interface TrendingStock {
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

interface TrendingStocksProps {
  className?: string;
}

export default function TrendingStocks({ className = '' }: TrendingStocksProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { formatPrice } = useCurrency();
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const [stocks, setStocks] = useState<TrendingStock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<TrendingStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'changePercent' | 'volume' | 'marketCap'>('changePercent');
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(true);

  const formatVolumeNumber = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `${formatPrice(marketCap / 1e12, 2, 2)}T`;
    if (marketCap >= 1e9) return `${formatPrice(marketCap / 1e9, 2, 2)}B`;
    if (marketCap >= 1e6) return `${formatPrice(marketCap / 1e6, 2, 2)}M`;
    return formatPrice(marketCap, 0, 0);
  };

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
            if (existingStock) {
              // Update existing stock to volume type
              existingStock.trendType = 'volume';
              existingStock.trendScore = Math.min(100, existingStock.trendScore + 20);
            } else {
              // Add new stock as volume type
              trendingStocks.push({
                id: `v-${stock.symbol}`,
                symbol: stock.symbol || '',
                name: stock.name || '',
                price: stock.price || 0,
                change: stock.change || 0,
                changePercent: stock.changePercent || 0,
                volume: stock.volume || 0,
                marketCap: stock.marketCap || 0,
                sector: stock.sector || 'Technology',
                trendType: 'volume',
                trendScore: Math.min(100, 60 + Math.abs(stock.changePercent || 0) * 2),
                socialMentions: Math.floor((stock.volume || 0) / 100000),
                newsCount: 0,
                analyst_rating: 'Hold'
              });
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

      let matchesFilter = false;
      if (activeFilter === 'all') {
        matchesFilter = true;
      } else if (activeFilter === 'gainer') {
        matchesFilter = stock.changePercent > 0;
      } else if (activeFilter === 'loser') {
        matchesFilter = stock.changePercent < 0;
      } else {
        matchesFilter = stock.trendType === activeFilter;
      }

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
      case 'gainer': return 'bg-green-100 dark:bg-pearto-green/10 text-green-700';
      case 'loser': return 'bg-red-100 dark:bg-pearto-pink/10 text-red-700';
      case 'volume': return 'bg-blue-100 text-blue-700';
      case 'breakout': return 'bg-purple-100 text-purple-700';
      case 'momentum': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400';
    }
  };

  const getRatingColor = (rating: TrendingStock['analyst_rating']) => {
    switch (rating) {
      case 'Buy': return 'bg-green-100 dark:bg-pearto-green/10 text-green-700';
      case 'Hold': return 'bg-yellow-100 text-yellow-700';
      case 'Sell': return 'bg-red-100 dark:bg-pearto-pink/10 text-red-700';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${className}`}>
        <main className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Activity className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-medium text-slate-900 dark:text-white transition-colors duration-300">Loading Trending Stocks</h2>
              <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Please wait while we fetch the latest trending data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${className}`}>
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
                <h1 className="text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  Trending Stocks
                </h1>
                <button
                  onClick={() => setIsAIPanelOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 dark:bg-pearto-blue text-white text-xs font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-pearto-blue-hover transition-colors shadow-sm"
                >
                  <Brain className="h-4 w-4" />
                  AI Analysis
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                Discover the most talked about and actively traded stocks
              </p>
            </motion.div>

            {/* Collapse Toggle */}
            <button
              onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
              className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all text-sm font-medium text-blue-700 dark:text-blue-400 shadow-sm"
            >
              {isDetailsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              {isDetailsCollapsed ? 'Show Stats & Charts' : 'Hide Stats & Charts'}
            </button>

            {/* Stats Cards */}
            {!isDetailsCollapsed && <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4"
            >
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-pearto-border-subtle transition-colors duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">Most Mentioned</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate transition-colors duration-300">
                  {filteredStocks.length > 0 ? filteredStocks.reduce((max, stock) =>
                    stock.socialMentions > (max?.socialMentions || 0) ? stock : max, filteredStocks[0])?.symbol || 'N/A' : 'N/A'}
                </p>
                <p className="text-xs text-green-600 dark:text-pearto-green font-medium transition-colors duration-300">
                  {filteredStocks.length > 0 ?
                    `${filteredStocks.reduce((max, stock) =>
                      stock.socialMentions > (max?.socialMentions || 0) ? stock : max, filteredStocks[0])?.socialMentions || 0} mentions` :
                    'No data'}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-pearto-border-subtle transition-colors duration-300">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-pearto-green transition-colors duration-300" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">Top Gainer</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate transition-colors duration-300">
                  {filteredStocks.length > 0 ?
                    filteredStocks.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent)[0]?.symbol || 'N/A' :
                    'No gainers'}
                </p>
                <p className="text-xs text-green-600 dark:text-pearto-green font-medium transition-colors duration-300">
                  {filteredStocks.length > 0 ?
                    `+${Math.max(...filteredStocks.filter(s => s.changePercent > 0).map(s => s.changePercent)).toFixed(2)}%` :
                    '+0.00%'}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-pearto-border-subtle transition-colors duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">Highest Volume</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate transition-colors duration-300">
                  {filteredStocks.length > 0 ?
                    filteredStocks.sort((a, b) => b.volume - a.volume)[0]?.symbol || 'N/A' :
                    'No data'}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  {filteredStocks.length > 0 ?
                    formatVolumeNumber(Math.max(...filteredStocks.map(s => s.volume))) :
                    '0'}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-pearto-border-subtle transition-colors duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">Breakout Score</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate transition-colors duration-300">
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
            </motion.div>}

            {/* Charts Section */}
            {!isDetailsCollapsed && <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4"
            >
              {/* Trend Type Distribution */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-pearto-border-subtle transition-colors duration-300">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3 transition-colors duration-300">Trend Distribution</h3>
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
                            color: isDark ? '#e2e8f0' : '#374151'
                          }
                        },
                        tooltip: {
                          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                          titleColor: isDark ? '#f1f5f9' : '#111827',
                          bodyColor: isDark ? '#cbd5e1' : '#4b5563',
                          borderColor: isDark ? '#334155' : '#e5e7eb',
                          borderWidth: 1,
                          padding: 12,
                          cornerRadius: 8,
                          bodyFont: {
                            size: 13,
                            weight: 500
                          },
                          titleFont: {
                            size: 14,
                            weight: 600
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Sector Distribution */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-pearto-border-subtle transition-colors duration-300">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3 transition-colors duration-300">Sector Distribution</h3>
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
                            color: isDark ? '#e2e8f0' : '#374151'
                          }
                        },
                        tooltip: {
                          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                          titleColor: isDark ? '#f1f5f9' : '#111827',
                          bodyColor: isDark ? '#cbd5e1' : '#4b5563',
                          borderColor: isDark ? '#334155' : '#e5e7eb',
                          borderWidth: 1,
                          padding: 12,
                          cornerRadius: 8,
                          bodyFont: {
                            size: 13,
                            weight: 500
                          },
                          titleFont: {
                            size: 14,
                            weight: 600
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Performance Distribution */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-pearto-border-subtle transition-colors duration-300">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3 transition-colors duration-300">Performance Overview</h3>
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
                            color: isDark ? '#e2e8f0' : '#374151'
                          }
                        },
                        tooltip: {
                          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                          titleColor: isDark ? '#f1f5f9' : '#111827',
                          bodyColor: isDark ? '#cbd5e1' : '#4b5563',
                          borderColor: isDark ? '#334155' : '#e5e7eb',
                          borderWidth: 1,
                          padding: 12,
                          cornerRadius: 8,
                          bodyFont: {
                            size: 13,
                            weight: 500
                          },
                          titleFont: {
                            size: 14,
                            weight: 600
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </motion.div>}

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-4 shadow-sm border border-gray-100 dark:border-pearto-border-subtle mb-4 transition-colors duration-300"
            >
              {/* Mobile Layout */}
              <div className="flex flex-col gap-2 sm:hidden">
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-2 min-w-max">
                    {filterTypes.map((filter) => {
                      return (
                        <button
                          key={filter.key}
                          onClick={() => setActiveFilter(filter.key)}
                          className={`flex items-center whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFilter === filter.key
                            ? 'bg-blue-600 dark:bg-pearto-blue text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                        >
                          <span>{filter.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400 dark:text-pearto-gray" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-7 pr-2 py-1 text-[10px] border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-pearto-green bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-pearto-gray transition-colors duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {filterTypes.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter.key
                          ? 'bg-blue-600 dark:bg-pearto-blue text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{filter.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-pearto-gray" />
                    <input
                      type="text"
                      placeholder="Search stocks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-pearto-green bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-pearto-gray transition-colors duration-300"
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
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300"
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                      <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                      <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Change</th>
                      <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Volume</th>
                      <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mkt Cap</th>
                      <th className="px-3 sm:px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900/95 divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredStocks.map((stock, index) => {
                      const TrendIcon = getTrendIcon(stock.trendType);
                      return (
                        <tr
                          key={stock.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group"
                        >
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-md ring-2 ring-white dark:ring-gray-700">
                                <TrendIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                              </div>
                              <div className="flex flex-col">
                                <Link
                                  href={`/stock/${stock.symbol.toLowerCase()}`}
                                  className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[100px] sm:max-w-[150px]"
                                >
                                  {stock.symbol}
                                </Link>
                                <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[100px] sm:max-w-[150px]">{stock.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{formatPrice(stock.price, 2, 2)}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                            <div className="inline-flex flex-col items-end">
                              <span className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {stock.change >= 0 ? '+' : ''}{formatPrice(Math.abs(stock.change), 2, 2)}
                              </span>
                              <span className={`text-xs ${stock.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {stock.changePercent >= 0 ? '+' : ''}{formatPercentage(stock.changePercent)}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{formatVolume(stock.volume)}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{formatMarketCap(stock.marketCap)}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
                            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{stock.trendScore.toFixed(0)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {filteredStocks.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2 transition-colors duration-300">No trending stocks found</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile AI Panel - Slide from bottom */}
      <div className="lg:hidden">
        {isAIPanelOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
            onClick={() => setIsAIPanelOpen(false)}
          />
        )}
        <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-in-out z-[9999] max-h-[85vh] ${
          isAIPanelOpen ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">AI Trend Analysis</h3>
                </div>
                <button
                  onClick={() => setIsAIPanelOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
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
      </div>

      {/* Desktop AI Panel - Slide from right */}
      <div className="hidden lg:block">
        {isAIPanelOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
            onClick={() => setIsAIPanelOpen(false)}
          />
        )}
        <div className={`fixed top-0 right-0 h-full w-96 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-[9999] ${
          isAIPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">AI Trend Analysis</h3>
                </div>
                <button
                  onClick={() => setIsAIPanelOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
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
      </div>
    </div>
  );
}
