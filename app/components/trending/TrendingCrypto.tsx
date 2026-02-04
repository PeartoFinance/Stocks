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
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const [cryptos, setCryptos] = useState<TrendingCrypto[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<TrendingCrypto[]>([]);
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
      case 'loser': return 'bg-red-100 text-red-700';
      case 'volume': return 'bg-blue-100 text-blue-700';
      case 'breakout': return 'bg-purple-100 text-purple-700';
      case 'momentum': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${className}`}>
        <main className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Activity className="h-12 w-12 text-orange-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Loading Trending Cryptocurrencies</h2>
              <p className="text-gray-600">Please wait while we fetch the latest crypto trending data...</p>
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
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
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
              <p className="text-sm text-gray-600">
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
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  <span className="text-xs text-gray-500">Most Mentioned</span>
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">
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

              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-xs text-gray-500">Top Gainer</span>
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {filteredCryptos.length > 0 ? 
                    filteredCryptos.filter(c => c.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent)[0]?.symbol || 'N/A' : 
                    'No gainers'}
                </p>
                <p className="text-xs text-green-600 font-medium">
                  {filteredCryptos.length > 0 ? 
                    `+${Math.max(...filteredCryptos.filter(c => c.changePercent > 0).map(c => c.changePercent)).toFixed(2)}%` : 
                    '+0.00%'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="text-xs text-gray-500">Highest Volume</span>
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">
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

              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-gray-500">Breakout Score</span>
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">
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

              {/* Category Distribution */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Category Distribution</h3>
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
                          ? 'bg-orange-600 text-white'
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
                    className="flex-1 sm:flex-none px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
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
                      placeholder="Search cryptocurrencies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Table Header */}
              <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-0.5 sm:gap-4 text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  <div className="col-span-3 sm:col-span-3">Crypto</div>
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
                {filteredCryptos.map((crypto, index) => {
                  const TrendIcon = getTrendIcon(crypto.trendType);
                  return (
                    <motion.div
                      key={crypto.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="px-2 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="grid grid-cols-12 gap-0.5 sm:gap-4 items-center">
                        {/* Crypto Info */}
                        <div className="col-span-3 flex items-center space-x-1 sm:space-x-2 min-w-0">
                          <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-orange-500 to-pink-500 rounded flex items-center justify-center flex-shrink-0">
                            <TrendIcon className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link 
                              href={`/crypto/${crypto.symbol.toLowerCase()}`}
                              className="text-[10px] sm:text-xs font-bold text-gray-900 hover:text-orange-600 transition-colors block truncate"
                            >
                              {crypto.symbol}
                            </Link>
                            <p className="text-[9px] sm:text-xs text-gray-600 truncate hidden sm:block">{crypto.name}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-2 text-center">
                          <p className="text-[10px] sm:text-sm font-bold text-gray-900 truncate">{formatPrice(crypto.price)}</p>
                        </div>

                        {/* Change */}
                        <div className="col-span-2 text-center">
                          <p className={`font-semibold text-[9px] sm:text-xs ${crypto.change >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                            {crypto.change >= 0 ? '+' : ''}{formatPrice(crypto.change)}
                          </p>
                          <p className={`text-[9px] sm:text-xs ${crypto.changePercent >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                            {crypto.changePercent >= 0 ? '+' : ''}{formatPercentage(crypto.changePercent)}
                          </p>
                        </div>

                        {/* Volume */}
                        <div className="col-span-2 text-center">
                          <p className="text-[9px] sm:text-xs font-medium text-gray-900 truncate">{formatNumber(crypto.volume)}</p>
                        </div>

                        {/* Market Cap */}
                        <div className="col-span-1 text-center">
                          <p className="text-[9px] sm:text-xs font-medium text-gray-900 truncate">{formatNumber(crypto.marketCap)}</p>
                        </div>

                        {/* Trend Score */}
                        <div className="col-span-1 text-center">
                          <p className="text-[9px] sm:text-xs font-medium text-gray-900 truncate">{crypto.trendScore.toFixed(3)}/100</p>
                        </div>

                        {/* Social */}
                        <div className="col-span-1 text-center">
                          <p className="text-[9px] sm:text-xs font-medium text-gray-900 truncate">{formatNumber(crypto.socialMentions)}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {filteredCryptos.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-gray-900 mb-2">No trending cryptocurrencies found</h3>
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
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-orange-600" />
                <h3 className="text-sm font-semibold text-gray-900">AI Crypto Analysis</h3>
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
              autoAnalyze={!loading && filteredCryptos.length > 0}
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsAIPanelOpen(false)}
        />
      )}
    </div>
  );
}
