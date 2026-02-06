'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, BarChart, List, Activity, Tag, Globe, Users, Clock, DollarSign, Zap, ArrowRight, Star, Bell, Filter, RefreshCw, Eye, Calendar, PieChart, LineChart, Target, Briefcase, Bitcoin, Building, Rocket, Coins, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { stockAPI } from './utils/api';
import { marketService, MarketOverviewResponse } from './utils/marketService';
import MarketMovers from './components/mainpage/MarketMovers';
import WorldIndices from './components/mainpage/WorldIndices';
import SectorsSection from './components/mainpage/SectorsSection';
import ETFsMutualFunds from './components/mainpage/ETFsMutualFunds';
import PrivateCompanies from './components/mainpage/PrivateCompanies';
import MarketSummary from './components/mainpage/MarketSummary';
import NewsCarousel from './components/mainpage/NewsCarousel';

interface MarketIndex {
  name: string;
  symbol: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  volume: string;
  high: string;
  low: string;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number | string;
  peRatio?: number;
  sector?: string;
  isGainer?: boolean;
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  time: string;
  source: string;
  impact: 'high' | 'medium' | 'low';
}


export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [marketData, setMarketData] = useState<MarketIndex[]>([]);
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [trendingStocks, setTrendingStocks] = useState<Stock[]>([]);
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
  const [marketStatus, setMarketStatus] = useState<string>('Open');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'gainers' | 'losers' | 'trending' | 'analysis'>('gainers');
  const [loading, setLoading] = useState(true);
  const [marketStats, setMarketStats] = useState<{
    totalVolume: number;
    advancers: number;
    decliners: number;
    unchanged: number;
  }>({
    totalVolume: 0,
    advancers: 0,
    decliners: 0,
    unchanged: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch market overview with real statistics
        try {
          const overviewData: MarketOverviewResponse = await marketService.getMarketOverview();
          
          // Set market statistics
          if (overviewData) {
            setMarketStats({
              totalVolume: overviewData.totalVolume || 0,
              advancers: overviewData.advancers || 0,
              decliners: overviewData.decliners || 0,
              unchanged: overviewData.unchanged || 0
            });
          }
        } catch (marketError) {
          console.error('Error fetching market overview:', marketError);
        }
        
        // Fetch market overview (indices)
        const overviewRes = await stockAPI.getMarketOverview();
        if (overviewRes.success && overviewRes.data && overviewRes.data.length > 0) {
          const indices: MarketIndex[] = overviewRes.data.map((item: any) => ({
            name: item.name || item.symbol || 'Unknown',
            symbol: item.symbol || '',
            value: item.price ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—',
            change: item.change ? item.change.toFixed(2) : '0.00',
            changePercent: `${item.changePercent ? item.changePercent.toFixed(2) : '0.00'}%`,
            isPositive: (item.change || 0) >= 0,
            volume: item.volume ? formatVolume(item.volume) : '—',
            high: item.dayHigh ? item.dayHigh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 
                  item.price ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—',
            low: item.dayLow ? item.dayLow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 
                 item.price ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—',
          }));
          setMarketData(indices);
        } else {
          setMarketData(getDefaultIndices());
        }

        // Fetch gainers
        const gainersRes = await stockAPI.getMarketMovers('gainers');
        if (gainersRes.success && gainersRes.data && gainersRes.data.length > 0) {
          setTopGainers(gainersRes.data.slice(0, 5).map(s => ({ ...s, isGainer: true })));
        }

        // Fetch losers
        const losersRes = await stockAPI.getMarketMovers('losers');
        if (losersRes.success && losersRes.data && losersRes.data.length > 0) {
          setTopLosers(losersRes.data.slice(0, 5).map(s => ({ ...s, isGainer: false })));
        }

        // Fetch trending
        const trendingRes = await stockAPI.getTrendingStocks();
        if (trendingRes.success && trendingRes.data && trendingRes.data.length > 0) {
          setTrendingStocks(trendingRes.data.slice(0, 5));
        }

        // Fetch market news from API
        const newsRes = await stockAPI.getPublishedNews('Market');
        if (newsRes && newsRes.items && newsRes.items.length > 0) {
          const news: NewsItem[] = newsRes.items.slice(0, 5).map((item: any, index: number) => ({
            id: item.id || index,
            title: item.title || 'Market Update',
            summary: item.summary || item.excerpt || 'Latest market developments and analysis.',
            time: item.published_at ? new Date(item.published_at).toLocaleString() : 
                  item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent',
            source: item.source || 'Pearto Finance',
            impact: item.category === 'Breaking' ? 'high' as const : 
                   item.category === 'Analysis' ? 'medium' as const : 'low' as const
          }));
          setMarketNews(news);
        } else {
          setMarketNews([
            { id: 1, title: 'Market Data Available', summary: 'Real-time market data from global exchanges. Check admin panel to import more news.', time: 'Just now', source: 'Pearto', impact: 'medium' },
          ]);
        }

        // Set market status based on current time
        const now = new Date();
        const hour = now.getHours();
        const isWeekend = now.getDay() === 0 || now.getDay() === 6;
        
        if (isWeekend) {
          setMarketStatus('Closed - Weekend');
        } else if (hour >= 9 && hour < 16) {
          setMarketStatus('Open');
        } else if (hour >= 4 && hour < 9) {
          setMarketStatus('Pre-Market');
        } else if (hour >= 16 && hour < 20) {
          setMarketStatus('After Hours');
        } else {
          setMarketStatus('Closed');
        }

        setLastUpdate(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('[HomePage] Error fetching data:', error);
        setMarketData(getDefaultIndices());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper to format volume with proper units
  function formatVolume(vol: number): string {
    if (!vol || vol === 0) return 'N/A';
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
    return vol.toLocaleString();
  }

  // Default indices fallback
  function getDefaultIndices(): MarketIndex[] {
    return [
      { name: 'S&P 500', symbol: 'SPX', value: '—', change: '0', changePercent: '0%', isPositive: true, volume: '—', high: '—', low: '—' },
      { name: 'Nasdaq 100', symbol: 'NDX', value: '—', change: '0', changePercent: '0%', isPositive: true, volume: '—', high: '—', low: '—' },
      { name: 'Dow Jones', symbol: 'DJI', value: '—', change: '0', changePercent: '0%', isPositive: true, volume: '—', high: '—', low: '—' },
      { name: 'Russell 2000', symbol: 'RUT', value: '—', change: '0', changePercent: '0%', isPositive: true, volume: '—', high: '—', low: '—' },
    ];
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number, percent: number) => ({
    value: `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%)`,
    isPositive: change >= 0
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Advanced Market Indices Dashboard - Full Width */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 border-b border-emerald-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 mt-8 sm:mt-10">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-emerald-100">
                Market Indices - {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  marketStatus.includes('Open') ? 'bg-green-500/20 text-green-200' :
                  marketStatus.includes('Pre-Market') || marketStatus.includes('After Hours') ? 'bg-yellow-500/20 text-yellow-200' :
                  'bg-red-500/20 text-red-200'
                }`}>
                  {marketStatus}
                </span>
                {lastUpdate && (
                  <span className="text-emerald-200 text-xs">
                    Last updated: {lastUpdate}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => window.location.reload()} 
                className="flex items-center gap-1 sm:gap-2 text-emerald-100 hover:text-white text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link href="/watchlist" className="flex items-center gap-1 sm:gap-2 text-emerald-100 hover:text-white text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Watch All</span>
              </Link>
            </div>
          </div>
          
          {loading && marketData.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 animate-pulse">
                  <div className="h-4 bg-white/20 rounded mb-2"></div>
                  <div className="h-6 bg-white/20 rounded mb-2"></div>
                  <div className="h-3 bg-white/20 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {marketData.map((index, i) => (
                <Link key={i} href={`/stock/${index.symbol.toLowerCase()}`} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 hover:bg-white/20 transition-all cursor-pointer border border-white/20 group">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-semibold text-sm sm:text-base lg:text-lg group-hover:text-emerald-100 transition-colors truncate">{index.name}</div>
                      <div className="text-emerald-200 text-xs sm:text-sm">{index.symbol}</div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-white font-bold text-base sm:text-lg lg:text-xl">{index.value}</div>
                      <div className={`text-xs sm:text-sm font-medium flex items-center justify-end ${
                        index.isPositive ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {index.isPositive ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        <span className="hidden sm:inline">{index.change} ({index.changePercent})</span>
                        <span className="sm:hidden">{index.changePercent}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-200 gap-1 flex-wrap">
                    <span className="truncate">Vol: {index.volume}</span>
                    <span>H: {index.high}</span>
                    <span>L: {index.low}</span>
                  </div>
                  <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        index.isPositive ? 'bg-green-400' : 'bg-red-400'
                      }`} 
                      style={{ width: `${Math.min(Math.abs(parseFloat(index.change)) * 10, 100)}%` }}
                    ></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Market Overview Grid with AI Sidebar */}
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Main Data Content */}
          <div className="flex-1">
            {/* Advanced Market Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
              {/* Market Movers */}
              <div className="lg:col-span-2">
                <MarketMovers
                  topGainers={topGainers}
                  topLosers={topLosers}
                  trendingStocks={trendingStocks}
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                  formatPrice={formatPrice}
                  formatChange={formatChange}
                  formatVolume={formatVolume}
                />
              </div>

              {/* Quick Markets */}
              <div>
                <WorldIndices />
              </div>
            </div>

            {/* Market Summary with Donut Chart */}
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <MarketSummary />
                <PrivateCompanies />
              </div>
            </div>

            {/* Sectors Section */}
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <SectorsSection />
            </div>

            {/* News Section */}
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <div className="text-center mb-6 sm:mb-8 px-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Market News & Analysis</h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">Latest financial news and market insights</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2">
                  <NewsCarousel />
                </div>
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Market Highlights</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Markets showing positive momentum</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Tech sector leading gains</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Energy prices volatile</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Tools & Features Grid */}
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <div className="text-center mb-6 sm:mb-8 px-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Professional Trading Tools</h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">Institutional-grade analysis tools for serious investors</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Link href="/stocks" className="group bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BarChart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Advanced Stock Screener</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">Filter 10,000+ stocks with 50+ criteria including technical indicators, fundamentals, and custom metrics.</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 font-medium">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Filter & Analyze</span>
                  </div>
                </Link>

                <Link href="/watchlist" className="group bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Smart Watchlists</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">Track unlimited stocks with real-time alerts, price targets, and automated portfolio rebalancing.</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 font-medium">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Track & Alert</span>
                  </div>
                </Link>

                <Link href="/movers" className="group bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Market Movers</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">Real-time tracking of biggest gainers, losers, and volume spikes across all major exchanges.</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-600 font-medium">
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Live Updates</span>
                  </div>
                </Link>

                <Link href="/chart" className="group bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <LineChart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Technical Analysis</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">Professional charting with 100+ indicators, pattern recognition, and AI-powered insights.</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-600 font-medium">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Chart & Analyze</span>
                  </div>
                </Link>

                <Link href="/stocks/exchanges" className="group bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PieChart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Sector Analysis</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">Deep dive into industry trends, sector rotation, and comparative performance analytics.</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 font-medium">
                    <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Compare Sectors</span>
                  </div>
                </Link>

                <Link href="/pro" className="group bg-gradient-to-r from-yellow-400 to-orange-500 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl border-2 border-yellow-400 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-white/80 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-white mb-2">Premium Features</h3>
                  <p className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">Unlock advanced analytics, real-time data feeds, and institutional research reports.</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-white font-medium">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Upgrade Now</span>
                  </div>
                </Link>
              </div>
            </div>

         

            {/* Mainpage Components Integration */}
            <div className="space-y-8">
              {/* Empty space for future components */}
            </div>

            {/* Call to Action */}
            <div className="text-center px-3 sm:px-4">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Ready to Start Trading?</h2>
                <p className="text-sm sm:text-base lg:text-xl text-emerald-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                  Join thousands of professional traders using our advanced analytics platform to make informed investment decisions.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <Link href="/stocks" className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-emerald-600 rounded-lg sm:rounded-xl hover:bg-emerald-50 transition-all font-semibold shadow-lg text-sm sm:text-base">
                    <BarChart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Start Analyzing
                    <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                  <Link href="/pro" className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-emerald-700 text-white rounded-lg sm:rounded-xl hover:bg-emerald-800 transition-all font-semibold border-2 border-emerald-500 text-sm sm:text-base">
                    <Star className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Get Premium Access
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}