'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import cryptoService from '@/app/utils/cryptoService';
import AIAnalysisPanel from '@/app/components/ai/AIAnalysisPanel';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Globe,
  BarChart3,
  Star,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  changePercent24h: number;
  rank: number;
  circulatingSupply?: number;
  maxSupply?: number;
  lastUpdated: string;
}

interface GlobalMetrics {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  activeCryptos: number;
  marketCapChange24h: number;
}

export default function CryptoPage() {
  const router = useRouter();
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'gainers' | 'losers'>('all');
  const [sortBy, setSortBy] = useState<'market_cap' | 'price' | 'change' | 'volume'>('market_cap');
  const [refreshing, setRefreshing] = useState(false);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      let data;
      
      if (selectedTab === 'gainers') {
        data = await cryptoService.getTopGainers(50) as CryptoData[];
      } else if (selectedTab === 'losers') {
        data = await cryptoService.getTopLosers(50) as CryptoData[];
      } else {
        data = await cryptoService.getMarkets({ limit: 100, sort: sortBy }) as CryptoData[];
      }
      
      setCryptoData(data);
      
      // Fetch global metrics
      const metrics = await cryptoService.getGlobalMetrics() as GlobalMetrics;
      setGlobalMetrics(metrics);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
  }, [selectedTab, sortBy]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCryptoData();
  };

  const filteredCrypto = cryptoData.filter(crypto =>
    crypto?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto?.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number | undefined | null) => {
    if (!price || isNaN(price)) return '$0.00';
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
    }
  };

  const formatMarketCap = (marketCap: number | undefined | null) => {
    if (!marketCap || isNaN(marketCap)) return '$0';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatVolume = (volume: number | undefined | null) => {
    if (!volume || isNaN(volume)) return '$0';
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${volume.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal mb-2">Cryptocurrency Markets</h1>
              <p className="text-emerald-100 text-sm sm:text-base">Real-time crypto prices, market cap, and trading data</p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors w-full sm:w-auto justify-center"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Refresh Data</span>
            </button>
          </div>

          {/* Global Metrics */}
          {globalMetrics && (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-white/90">Total Market Cap</span>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-normal text-white mb-1">{formatMarketCap(globalMetrics.totalMarketCap || 0)}</div>
                <div className={`text-xs sm:text-sm font-medium flex items-center gap-1 ${(globalMetrics.marketCapChange24h || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {(globalMetrics.marketCapChange24h || 0) >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  {(globalMetrics.marketCapChange24h || 0) >= 0 ? '+' : ''}{(globalMetrics.marketCapChange24h || 0).toFixed(2)}%
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-white/90">Trading Volume (24h)</span>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-normal text-white">{formatVolume(globalMetrics.totalVolume24h || 0)}</div>
                <div className="text-xs sm:text-sm text-white/70 mt-1">Last 24 hours</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-white/90">Bitcoin Dominance</span>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-normal text-white">{(globalMetrics.btcDominance || 0).toFixed(1)}%</div>
                <div className="text-xs sm:text-sm text-white/70 mt-1">Market share</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-white/90">Active Cryptocurrencies</span>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-normal text-white">{filteredCrypto.length.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-white/70 mt-1">Total tracked</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-3 sm:p-4 md:p-6 mb-6">
              <div className="flex flex-col gap-4 mb-4">
                {/* Search Bar */}
                <div className="w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search cryptocurrencies..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
                    />
                  </div>
                </div>
                
                {/* Sort and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-gray-900 text-sm w-full sm:w-auto"
                  >
                    <option value="market_cap">Market Cap</option>
                    <option value="price">Price</option>
                    <option value="change">Change (24h)</option>
                  </select>
                  
                  <button
                    onClick={handleRefresh}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors w-full sm:w-auto"
                    disabled={refreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTab('all')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    selectedTab === 'all'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedTab('gainers')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    selectedTab === 'gainers'
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/25 scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  🚀 Gainers
                </button>
                <button
                  onClick={() => setSelectedTab('losers')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    selectedTab === 'losers'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/25 scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  📉 Losers
                </button>
              </div>
            </div>

            {/* Crypto Table Container */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
              {loading ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-emerald-600 mx-auto mb-4 sm:mb-6"></div>
                  <p className="text-gray-600 text-base sm:text-lg font-medium">Loading cryptocurrency data...</p>
                  <p className="text-gray-500 text-sm mt-2">Fetching latest market prices</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="lg:hidden">
                    <div className="divide-y divide-gray-100">
                      {filteredCrypto.map((crypto, index) => (
                        <div 
                          key={crypto.id || crypto.symbol || index} 
                          className="p-4 hover:bg-emerald-50/50 transition-colors duration-200 cursor-pointer"
                          onClick={() => router.push(`/crypto/${crypto.symbol}`)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-xs font-bold text-white">{(crypto.symbol || '??').substring(0, 2).toUpperCase()}</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{crypto.name || 'Unknown'}</div>
                                <div className="text-xs text-gray-500">{crypto.symbol || 'UNKNOWN'}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{formatPrice(crypto.price)}</div>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${(crypto.changePercent24h || 0) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {(crypto.changePercent24h || 0) >= 0 ? (
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                )}
                                {Math.abs(crypto.changePercent24h || 0).toFixed(2)}%
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Rank #{crypto.rank || index + 1}</span>
                            <span>{formatMarketCap(crypto.marketCap)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">#</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cryptocurrency</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">24h Change</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Market Cap</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredCrypto.map((crypto, index) => (
                            <tr 
                              key={crypto.id || crypto.symbol || index} 
                              className="hover:bg-emerald-50/50 transition-colors duration-200 cursor-pointer"
                              onClick={() => router.push(`/crypto/${crypto.symbol}`)}
                            >
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                                {crypto.rank || index + 1}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm">
                                    <span className="text-xs font-bold text-white">{(crypto.symbol || '??').substring(0, 2).toUpperCase()}</span>
                                  </div>
                                  <div className="ml-2 sm:ml-4">
                                    <div className="text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none hover:text-emerald-600 transition-colors">{crypto.name || 'Unknown'}</div>
                                    <div className="text-xs sm:text-sm text-gray-500 hover:text-emerald-600 transition-colors">{crypto.symbol || 'UNKNOWN'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                                <div className="text-sm font-medium text-gray-900">{formatPrice(crypto.price)}</div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                                <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${(crypto.changePercent24h || 0) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {(crypto.changePercent24h || 0) >= 0 ? (
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                  ) : (
                                    <ArrowDownRight className="h-3 w-3 mr-1" />
                                  )}
                                  {Math.abs(crypto.changePercent24h || 0).toFixed(2)}%
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                                <div className="text-sm font-medium text-gray-900">{formatMarketCap(crypto.marketCap)}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {filteredCrypto.length === 0 && !loading && (
                    <div className="p-8 sm:p-12 text-center">
                      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No cryptocurrencies found</h3>
                      <p className="text-gray-500 text-sm sm:text-base">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* AI Analysis Panel */}
          <div className="w-full xl:w-96">
            <AIAnalysisPanel
              title="Crypto Market Analysis"
              pageType="crypto-market"
              pageData={{
                cryptoCount: filteredCrypto.length,
                selectedTab,
                sortBy,
                globalMetrics,
                topCryptos: filteredCrypto.slice(0, 10),
                marketStatus: selectedTab === 'gainers' ? 'Bullish' : selectedTab === 'losers' ? 'Bearish' : 'Neutral',
                totalMarketCap: globalMetrics?.totalMarketCap,
                totalVolume: globalMetrics?.totalVolume24h,
                btcDominance: globalMetrics?.btcDominance
              }}
              autoAnalyze={true}
              compact={false}
              quickPrompts={[
                "What are the key trends?",
                "Best investment opportunities?",
                "Risk analysis",
                "Market sentiment"
              ]}
              className="sticky top-24"
              maxHeight="600px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}