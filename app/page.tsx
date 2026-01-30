'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, BarChart, List, Activity, Tag, Globe, Users, Clock, DollarSign, Zap, ArrowRight, Star, Bell, Filter, RefreshCw, Eye, Calendar, PieChart, LineChart, Target, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { stockAPI } from './utils/api';
import { marketService, MarketOverviewResponse } from './utils/marketService';
import AIAnalysisPanel from './components/ai/AIAnalysisPanel';

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
  const [selectedTab, setSelectedTab] = useState<'gainers' | 'losers' | 'trending'>('gainers');
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
        {/* Hero Section with Advanced Search */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent mb-4 sm:mb-6 px-4">
            Professional Stock Analysis Platform
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto px-4">
            Real-time data on 100,000+ stocks, ETFs, and funds. Advanced analytics, AI-powered insights,
            and institutional-grade research tools for professional investors.
          </p>

          {/* Advanced Search Bar */}
          <div className="max-w-3xl mx-auto mb-6 sm:mb-8 px-3 sm:px-4">
            <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <Search className="absolute left-3 sm:left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stocks, ETFs, indexes..."
                className="w-full pl-10 sm:pl-16 pr-12 sm:pr-20 py-3 sm:py-5 text-sm sm:text-base lg:text-lg border-0 focus:ring-0 focus:outline-none"
              />
              <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <div className="hidden sm:block text-gray-400 text-sm px-2 py-1 bg-gray-100 rounded">
                  Enter
                </div>
              </div>
            </div>

            {/* Quick Search Suggestions */}
            <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-600 mr-1 sm:mr-2">Trending:</span>
              {['NVDA', 'AAPL', 'TSLA', 'META', 'GOOGL', 'MSFT'].map((symbol, i) => (
                <button key={i} className="px-2 sm:px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs sm:text-sm hover:bg-emerald-100 transition-colors">
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Market Overview Grid with AI Sidebar */}
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Main Data Content */}
          <div className="flex-1">
            {/* Advanced Market Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
              {/* Market Movers */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Market Movers</h2>
                      <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide">
                        <button
                          onClick={() => setSelectedTab('gainers')}
                          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedTab === 'gainers'
                            ? 'bg-green-100 text-green-700'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          Gainers
                        </button>
                        <button
                          onClick={() => setSelectedTab('losers')}
                          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedTab === 'losers'
                            ? 'bg-red-100 text-red-700'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          Losers
                        </button>
                        <button
                          onClick={() => setSelectedTab('trending')}
                          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedTab === 'trending'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          Trending
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {(selectedTab === 'gainers' ? topGainers :
                        selectedTab === 'losers' ? topLosers : trendingStocks)
                        .slice(0, 5).map((stock, i) => {
                          const changeData = formatChange(stock.change, stock.changePercent);
                          return (
                            <Link key={i} href={`/stock/${stock.symbol.toLowerCase()}`}>
                              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
                                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
                                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${changeData.isPositive ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                    <span className={`font-bold text-xs sm:text-sm ${changeData.isPositive ? 'text-green-700' : 'text-red-700'
                                      }`}>
                                      {stock.symbol.slice(0, 2)}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-sm sm:text-base text-gray-900">{stock.symbol}</div>
                                    <div className="text-xs sm:text-sm text-gray-600 truncate">{stock.name}</div>
                                    <div className="text-xs text-gray-500 hidden sm:block">{stock.sector}</div>
                                  </div>
                                </div>
                                <div className="text-right ml-2 flex-shrink-0">
                                  <div className="font-bold text-sm sm:text-base lg:text-lg text-gray-900">{formatPrice(stock.price)}</div>
                                  <div className={`text-xs sm:text-sm font-medium flex items-center justify-end ${changeData.isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {changeData.isPositive ? (
                                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    )}
                                    <span className="hidden sm:inline">{changeData.value}</span>
                                    <span className="sm:hidden">{stock.changePercent.toFixed(1)}%</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                                    Vol: {stock.volume ? formatVolume(stock.volume) : 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                    </div>
                    <Link href="/stocks" className="block mt-4 sm:mt-6 text-center py-3 bg-emerald-600 text-white rounded-lg sm:rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm sm:text-base">
                      View All Market Data →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Market News & Analysis */}
              <div>
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-yellow-500" />
                      Live Market News
                    </h2>
                  </div>
                  <div className="p-3 sm:p-4 lg:p-6 max-h-80 sm:max-h-96 overflow-y-auto">
                    <div className="space-y-3 sm:space-y-4">
                      {loading ? (
                        [1,2,3].map(i => (
                          <div key={i} className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 animate-pulse">
                            <div className="flex items-start justify-between mb-2">
                              <div className="h-4 w-16 bg-gray-200 rounded"></div>
                              <div className="h-3 w-12 bg-gray-200 rounded"></div>
                            </div>
                            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                          </div>
                        ))
                      ) : marketNews.length > 0 ? (
                        marketNews.map((news, i) => (
                          <div key={news.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
                            <div className="flex items-start justify-between mb-2 gap-2">
                              <div className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                                news.impact === 'high' ? 'bg-red-100 text-red-700' :
                                news.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {news.impact.toUpperCase()}
                              </div>
                              <span className="text-xs text-gray-500 flex-shrink-0">{news.time}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm leading-tight">{news.title}</h3>
                            <p className="text-xs text-gray-600 line-clamp-2">{news.summary}</p>
                            <div className="mt-2 text-xs text-gray-500 font-medium">{news.source}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500">
                          <Zap className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-xs sm:text-sm">No market news available</p>
                          <p className="text-xs mt-1">Import news from admin panel</p>
                        </div>
                      )}
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

            {/* Market Statistics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">24h</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  {marketStats.totalVolume > 0 ? formatVolume(marketStats.totalVolume) : '—'}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mb-2">Total Market Volume</div>
                <div className="text-xs sm:text-sm text-emerald-600 font-medium">
                  {marketStats.totalVolume > 0 ? 'Live data' : 'Loading...'}
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">Today</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  {marketStats.advancers.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mb-2">Advancing Stocks</div>
                <div className="text-xs sm:text-sm text-green-600 font-medium">
                  {marketStats.advancers + marketStats.decliners + marketStats.unchanged > 0 
                    ? `${Math.round((marketStats.advancers / (marketStats.advancers + marketStats.decliners + marketStats.unchanged)) * 100)}% of all stocks`
                    : 'Loading...'
                  }
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">Today</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  {marketStats.decliners.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mb-2">Declining Stocks</div>
                <div className="text-xs sm:text-sm text-red-600 font-medium">
                  {marketStats.advancers + marketStats.decliners + marketStats.unchanged > 0 
                    ? `${Math.round((marketStats.decliners / (marketStats.advancers + marketStats.decliners + marketStats.unchanged)) * 100)}% of all stocks`
                    : 'Loading...'
                  }
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">Today</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  {marketStats.unchanged.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mb-2">Unchanged Stocks</div>
                <div className="text-xs sm:text-sm text-purple-600 font-medium">
                  {marketStats.advancers + marketStats.decliners + marketStats.unchanged > 0 
                    ? `${Math.round((marketStats.unchanged / (marketStats.advancers + marketStats.decliners + marketStats.unchanged)) * 100)}% of all stocks`
                    : 'Loading...'
                  }
                </div>
              </div>
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

          {/* AI Analysis Sidebar - Now beside data tables only */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="xl:sticky xl:top-4">
              <AIAnalysisPanel
                title="Market Overview"
                pageType="market-dashboard"
                pageData={{
                  indices: marketData.slice(0, 4).map(m => ({
                    name: m.name,
                    value: m.value,
                    change: m.changePercent
                  })),
                  topGainers: topGainers.slice(0, 3).map(s => ({
                    symbol: s.symbol,
                    change: s.changePercent
                  })),
                  topLosers: topLosers.slice(0, 3).map(s => ({
                    symbol: s.symbol,
                    change: s.changePercent
                  })),
                  marketStatus
                }}
                autoAnalyze={!loading && (topGainers.length > 0 || marketData.length > 0)}
                quickPrompts={[
                  'Market sentiment today',
                  'Best opportunities',
                  'Risk assessment'
                ]}
                maxHeight="500px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}