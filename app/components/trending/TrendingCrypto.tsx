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
  X
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { useCurrency } from '../../context/CurrencyContext';
import { cryptoService } from '../../utils/cryptoService';
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

export interface TrendingCrypto {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string; // For crypto, this could be category like 'DeFi', 'Layer 1', etc.
  trendType: 'gainer' | 'loser' | 'volume' | 'breakout' | 'momentum';
  trendScore: number;
  socialMentions: number;
  newsCount: number;
  analyst_rating: 'Buy' | 'Hold' | 'Sell';
}

interface TrendingCryptoProps {
  className?: string;
}

export default function TrendingCrypto({ className = '' }: TrendingCryptoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { formatPrice } = useCurrency();
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const [cryptos, setCryptos] = useState<TrendingCrypto[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<TrendingCrypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'changePercent' | 'volume' | 'marketCap'>('changePercent');
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  const filterTypes = [
    { key: 'all', label: 'All Trending', icon: Activity },
    { key: 'gainer', label: 'Top Gainers', icon: TrendingUp },
    { key: 'loser', label: 'Top Losers', icon: TrendingDown },
    { key: 'volume', label: 'High Volume', icon: Eye },
    { key: 'breakout', label: 'Breakouts', icon: Zap },
    { key: 'momentum', label: 'Momentum', icon: Flame }
  ];

  const getCryptoCategory = (symbol: string, name: string): string => {
    const lowerName = name.toLowerCase();
    const lowerSymbol = symbol.toLowerCase();

    if (lowerSymbol.includes('btc') || lowerName.includes('bitcoin')) return 'Layer 1';
    if (lowerSymbol.includes('eth') || lowerName.includes('ethereum')) return 'Layer 1';
    if (lowerName.includes('defi') || lowerSymbol.includes('uni') || lowerSymbol.includes('aave')) return 'DeFi';
    if (lowerName.includes('meme') || lowerSymbol.includes('doge') || lowerSymbol.includes('shib')) return 'Meme';
    if (lowerName.includes('exchange') || lowerSymbol.includes('bnb') || lowerSymbol.includes('cro')) return 'Exchange';
    if (lowerName.includes('privacy') || lowerSymbol.includes('xmr') || lowerSymbol.includes('zec')) return 'Privacy';
    if (lowerName.includes('gaming') || lowerName.includes('game') || lowerSymbol.includes('axs')) return 'Gaming';
    if (lowerName.includes('stable') || lowerSymbol.includes('usd') || lowerSymbol.includes('usdt')) return 'Stablecoin';

    return 'Other';
  };

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setLoading(true);

        // Fetch gainers, losers, and general markets from crypto API
        const [gainersRes, losersRes, marketsRes] = await Promise.all([
          cryptoService.getTopGainers(15),
          cryptoService.getTopLosers(15),
          cryptoService.getMarkets({ limit: 20, sort: 'volume' })
        ]);

        const trendingCryptos: TrendingCrypto[] = [];

        // Process gainers
        if (gainersRes && Array.isArray(gainersRes)) {
          gainersRes.forEach((crypto: any, i: number) => {
            const trendType = crypto.changePercent > 10 ? 'breakout' : crypto.changePercent > 5 ? 'momentum' : 'gainer';
            trendingCryptos.push({
              id: `cg-${i}`,
              symbol: crypto.symbol || '',
              name: crypto.name || '',
              price: crypto.price || 0,
              change: crypto.change || 0,
              changePercent: crypto.changePercent || 0,
              volume: crypto.volume || 0,
              marketCap: crypto.marketCap || 0,
              sector: getCryptoCategory(crypto.symbol || '', crypto.name || ''),
              trendType,
              trendScore: Math.min(100, 50 + (crypto.changePercent || 0) * 3),
              socialMentions: Math.floor((crypto.volume || 0) / 50000), // Crypto has higher social engagement
              newsCount: 0,
              analyst_rating: crypto.changePercent > 8 ? 'Buy' : 'Hold'
            });
          });
        }

        // Process losers
        if (losersRes && Array.isArray(losersRes)) {
          losersRes.forEach((crypto: any, i: number) => {
            trendingCryptos.push({
              id: `cl-${i}`,
              symbol: crypto.symbol || '',
              name: crypto.name || '',
              price: crypto.price || 0,
              change: crypto.change || 0,
              changePercent: crypto.changePercent || 0,
              volume: crypto.volume || 0,
              marketCap: crypto.marketCap || 0,
              sector: getCryptoCategory(crypto.symbol || '', crypto.name || ''),
              trendType: 'loser',
              trendScore: Math.max(0, 50 + (crypto.changePercent || 0) * 3),
              socialMentions: Math.floor((crypto.volume || 0) / 50000),
              newsCount: 0,
              analyst_rating: crypto.changePercent < -8 ? 'Sell' : 'Hold'
            });
          });
        }

        // Process volume leaders from markets
        if (marketsRes && Array.isArray(marketsRes)) {
          marketsRes.slice(0, 10).forEach((crypto: any) => {
            const existingCrypto = trendingCryptos.find(c => c.symbol === crypto.symbol);
            if (existingCrypto && existingCrypto.trendType === 'gainer') {
              existingCrypto.trendType = 'volume';
              existingCrypto.trendScore = Math.min(100, existingCrypto.trendScore + 15);
            } else if (!existingCrypto) {
              const trendType = crypto.changePercent > 5 ? 'momentum' : 'volume';
              trendingCryptos.push({
                id: `m-${crypto.symbol}`,
                symbol: crypto.symbol || '',
                name: crypto.name || '',
                price: crypto.price || 0,
                change: crypto.change || 0,
                changePercent: crypto.changePercent || 0,
                volume: crypto.volume || 0,
                marketCap: crypto.marketCap || 0,
                sector: getCryptoCategory(crypto.symbol || '', crypto.name || ''),
                trendType,
                trendScore: Math.min(100, 40 + (crypto.changePercent || 0) * 2),
                socialMentions: Math.floor((crypto.volume || 0) / 50000),
                newsCount: 0,
                analyst_rating: 'Hold'
              });
            }
          });
        }

        setCryptos(trendingCryptos);
        setFilteredCryptos(trendingCryptos);
      } catch (error) {
        console.error('Error fetching trending cryptos:', error);
        toast.error('Failed to load trending crypto data');
      } finally {
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  useEffect(() => {
    let filtered = cryptos.filter(crypto => {
      const matchesSearch = crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.sector.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = activeFilter === 'all' || crypto.trendType === activeFilter;

      return matchesSearch && matchesFilter;
    });

    // Sort cryptos
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      return typeof aValue === 'number' && typeof bValue === 'number' ? bValue - aValue : 0;
    });

    setFilteredCryptos(filtered);
  }, [cryptos, searchTerm, activeFilter, sortBy]);

  // Chart data preparation functions
  const getTrendTypeDistribution = () => {
    const distribution = filteredCryptos.reduce((acc, crypto) => {
      acc[crypto.trendType] = (acc[crypto.trendType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(distribution).map(key => {
        const type = key as TrendingCrypto['trendType'];
        const filterType = filterTypes.find(f => f.key === type);
        return filterType?.label || key;
      }),
      datasets: [{
        data: Object.values(distribution),
        backgroundColor: [
          '#f59e0b', // Amber - gainers (crypto themed)
          '#ef4444', // Red - losers  
          '#3b82f6', // Blue - volume
          '#8b5cf6', // Purple - breakouts
          '#ec4899'  // Pink - momentum
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  };

  const getSectorDistribution = () => {
    const sectorData = filteredCryptos.reduce((acc, crypto) => {
      acc[crypto.sector] = (acc[crypto.sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sectors = Object.keys(sectorData).slice(0, 8);
    const others = Object.keys(sectorData).slice(8).reduce((sum, sector) => sum + sectorData[sector], 0);

    const labels = sectors.length > 0 ? [...sectors, others > 0 ? 'Others' : ''] : ['No Data'];
    const data = sectors.length > 0 ? [...sectors.map(s => sectorData[s]), others > 0 ? others : 0] : [1];

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899',
          '#10b981', '#ef4444', '#14b8a6', '#f97316',
          '#6b7280'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  };

  const getPerformanceDistribution = () => {
    const performers = {
      positive: filteredCryptos.filter(c => c.changePercent > 0).length,
      negative: filteredCryptos.filter(c => c.changePercent < 0).length,
      neutral: filteredCryptos.filter(c => c.changePercent === 0).length
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

  const getTrendIcon = (trendType: TrendingCrypto['trendType']) => {
    switch (trendType) {
      case 'gainer': return TrendingUp;
      case 'loser': return TrendingDown;
      case 'volume': return Eye;
      case 'breakout': return Zap;
      case 'momentum': return Flame;
      default: return Activity;
    }
  };

  const getTrendColor = (trendType: TrendingCrypto['trendType']) => {
    switch (trendType) {
      case 'gainer': return 'bg-orange-100 text-orange-700';
      case 'loser': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      case 'volume': return 'bg-blue-100 text-blue-700';
      case 'breakout': return 'bg-purple-100 text-purple-700';
      case 'momentum': return 'bg-pink-100 text-pink-700';
      default: return 'bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${className}`}>
        <main className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Activity className="h-12 w-12 text-orange-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900 dark:text-white transition-colors duration-300">Loading Trending Cryptocurrencies</h2>
              <p className="text-gray-600 dark:text-slate-400 transition-colors duration-300">Please wait while we fetch the latest crypto trending data...</p>
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
                <h1 className="text-xl lg:text-2xl font-medium bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Trending Cryptocurrencies
                </h1>
                <button
                  onClick={() => setIsAIPanelOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                >
                  <Brain className="h-4 w-4" />
                  AI Analysis
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 transition-colors duration-300">
                Discover the most talked about and actively traded cryptocurrencies
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
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
                  {filteredCryptos.length > 0 ? filteredCryptos.reduce((max, crypto) =>
                    crypto.socialMentions > (max?.socialMentions || 0) ? crypto : max, filteredCryptos[0])?.symbol || 'N/A' : 'N/A'}
                </p>
                <p className="text-xs text-orange-600 font-medium">
                  {filteredCryptos.length > 0 ?
                    `${filteredCryptos.reduce((max, crypto) =>
                      crypto.socialMentions > (max?.socialMentions || 0) ? crypto : max, filteredCryptos[0])?.socialMentions || 0} mentions` :
                    'No data'}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-pearto-border-subtle transition-colors duration-300">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-pearto-green transition-colors duration-300" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">Top Gainer</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate transition-colors duration-300">
                  {filteredCryptos.length > 0 ?
                    filteredCryptos.filter(c => c.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent)[0]?.symbol || 'N/A' :
                    'No gainers'}
                </p>
                <p className="text-xs text-green-600 dark:text-pearto-green font-medium transition-colors duration-300">
                  {filteredCryptos.length > 0 ?
                    `+${Math.max(...filteredCryptos.filter(c => c.changePercent > 0).map(c => c.changePercent)).toFixed(2)}%` :
                    '+0.00%'}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-pearto-border-subtle transition-colors duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">Highest Volume</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate transition-colors duration-300">
                  {filteredCryptos.length > 0 ?
                    filteredCryptos.sort((a, b) => b.volume - a.volume)[0]?.symbol || 'N/A' :
                    'No data'}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  {filteredCryptos.length > 0 ?
                    formatNumber(Math.max(...filteredCryptos.map(c => c.volume))) :
                    '0'}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-pearto-border-subtle transition-colors duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">Breakout Score</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate transition-colors duration-300">
                  {filteredCryptos.length > 0 ?
                    filteredCryptos.sort((a, b) => b.trendScore - a.trendScore)[0]?.symbol || 'N/A' :
                    'No data'}
                </p>
                <p className="text-xs text-purple-600 font-medium">
                  {filteredCryptos.length > 0 ?
                    Math.max(...filteredCryptos.map(c => c.trendScore)).toFixed(0) :
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
                            color: isDark ? '#d1d5db' : '#374151'
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

              {/* Category Distribution */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-pearto-border-subtle transition-colors duration-300">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3 transition-colors duration-300">Category Distribution</h3>
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
                            color: isDark ? '#d1d5db' : '#374151'
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
                            color: isDark ? '#d1d5db' : '#374151'
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
              className="bg-white dark:bg-slate-800 rounded-lg p-2 sm:p-4 shadow-sm border border-gray-100 dark:border-pearto-border-subtle mb-4 transition-colors duration-300"
            >
              {/* Mobile Layout */}
              <div className="flex flex-col gap-2 sm:hidden">
                <div className="flex flex-wrap gap-1">
                  {filterTypes.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${activeFilter === filter.key
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-gray-200'
                          }`}
                      >
                        <Icon className="h-3 w-3" />
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400 dark:text-pearto-gray" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-7 pr-2 py-1 text-[10px] border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 dark:focus:ring-pearto-pink bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-pearto-gray transition-colors duration-300"
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
                          ? 'bg-orange-600 text-white shadow-md'
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
                      placeholder="Search cryptocurrencies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-pearto-pink bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-pearto-gray transition-colors duration-300"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Crypto Table */}
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
                      <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Crypto</th>
                      <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                      <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Change</th>
                      <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Volume</th>
                      <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mkt Cap</th>
                      <th className="px-3 sm:px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900/95 divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredCryptos.map((crypto, index) => {
                      const TrendIcon = getTrendIcon(crypto.trendType);
                      return (
                        <tr
                          key={crypto.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group"
                        >
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-md ring-2 ring-white dark:ring-gray-700">
                                <TrendIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                              </div>
                              <div className="flex flex-col">
                                <Link
                                  href={`/crypto/${crypto.symbol.toLowerCase()}`}
                                  className="text-sm font-medium text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors truncate max-w-[100px] sm:max-w-[150px]"
                                >
                                  {crypto.symbol}
                                </Link>
                                <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[100px] sm:max-w-[150px]">{crypto.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{formatPrice(crypto.price)}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                            <div className="inline-flex flex-col items-end">
                              <span className={`text-sm font-medium ${crypto.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {crypto.change >= 0 ? '+' : ''}{formatPrice(Math.abs(crypto.change))}
                              </span>
                              <span className={`text-xs ${crypto.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {crypto.changePercent >= 0 ? '+' : ''}{formatPercentage(crypto.changePercent)}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{formatNumber(crypto.volume)}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{formatNumber(crypto.marketCap)}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
                            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20">
                              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">{crypto.trendScore.toFixed(0)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {filteredCryptos.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2 transition-colors duration-300">No trending cryptocurrencies found</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sliding AI Panel */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-[60] ${isAIPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="h-full flex flex-col">
          {/* AI Panel Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-orange-600" />
                <h3 className="text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">AI Crypto Analysis</h3>
              </div>
              <button
                onClick={() => setIsAIPanelOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-gray-200 rounded-lg transition-colors"
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
                count: filteredCryptos.length,
                activeFilter,
                trending: filteredCryptos.slice(0, 5).map(c => ({
                  symbol: c.symbol,
                  name: c.name,
                  changePercent: c.changePercent,
                  trendType: c.trendType,
                  trendScore: c.trendScore
                })),
                topGainer: filteredCryptos.filter(c => c.changePercent > 0)[0]?.symbol,
                topLoser: filteredCryptos.filter(c => c.changePercent < 0)[0]?.symbol
              }}
              quickPrompts={[
                'Why are these cryptos trending?',
                'Crypto trading signals',
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
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsAIPanelOpen(false)}
        />
      )}
    </div>
  );
}
