'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Star,
  Activity,
  BarChart3,
  X,
  Brain,
  GitCompare,
  Maximize2
} from 'lucide-react';
import toast from 'react-hot-toast';
import cryptoService from '@/app/utils/cryptoService';
import AIAnalysisPanel from '@/app/components/ai/AIAnalysisPanel';
import StockChart from '@/app/components/StockChart';
import { HistoricalData as StockHistoricalData } from '@/app/types';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from '@/app/utils/portfolioWatchlistAPI';
import { useAuth } from '@/app/context/AuthContext';

// Import crypto tab components
import {
  CryptoTabs,
  OverviewTab,
  StatisticsTab,
  ChartTab,
  HistoryTab,
  ProfileTab,
  CryptoNewsTab,
  type TabId
} from '@/app/components/crypto';

type ChartType = 'area' | 'candlestick' | 'line' | 'mountain';

interface CryptoDetails {
  id: number;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume: number;
  change: number;
  changePercent: number;
  dayHigh?: number;
  dayLow?: number;
  high52w?: number;
  low52w?: number;
  avgVolume?: number;
  open?: number;
  previousClose?: number;
  lastUpdated: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  currency: string;
  assetType: string;
  countryCode: string;
  isFeatured: boolean;
  isListed: boolean;
  circulatingSupply?: number;
  maxSupply?: number;
}

interface HistoricalData {
  time: string;
  price: number;
  volume: number;
  marketCap: number;
}

export default function CryptoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;
  const { user } = useAuth();

  const [crypto, setCrypto] = useState<CryptoDetails | null>(null);
  const [historicalData, setHistoricalData] = useState<StockHistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isFavorited, setIsFavorited] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('1M');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [chartLoading, setChartLoading] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  useEffect(() => {
    const fetchCryptoDetails = async () => {
      if (!symbol) return;

      try {
        setLoading(true);
        
        // Fetch crypto details
        const cryptoData = await cryptoService.getCoinDetails(symbol) as CryptoDetails;
        if (cryptoData && cryptoData.symbol) {
          setCrypto(cryptoData);
        } else {
          toast.error('Cryptocurrency not found');
          router.push('/crypto');
          return;
        }

        // Fetch historical data from API
        try {
          const historicalResponse = await cryptoService.getHistory(symbol, '1mo', '1d');
          console.log('Historical data response:', historicalResponse);
          
          if (historicalResponse && historicalResponse.data && historicalResponse.data.length > 0) {
            // API returns data in correct OHLC format, use it directly
            setHistoricalData(historicalResponse.data);
          } else {
            console.warn('No historical data available');
            setHistoricalData([]);
          }
        } catch (historyError) {
          console.error('Failed to fetch historical data:', historyError);
          toast.error('Failed to load historical data');
          setHistoricalData([]);
        }

      } catch (error) {
        console.error('[CryptoDetail] Error:', error);
        toast.error('Failed to load cryptocurrency details');
        router.push('/crypto');
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoDetails();
  }, [symbol, router]);

  // Check watchlist status when user changes
  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (user && symbol) {
        try {
          const watchlist = await getWatchlist();
          const decodedSymbol = decodeURIComponent(symbol);
          setIsFavorited(watchlist.some((item) => item.symbol.toUpperCase() === decodedSymbol.toUpperCase()));
        } catch (error) {
          console.error('Failed to check watchlist status:', error);
        }
      } else {
        setIsFavorited(false);
      }
    };
    checkWatchlistStatus();
  }, [user, symbol]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const cryptoData = await cryptoService.getCoinDetails(symbol) as CryptoDetails;
      if (cryptoData && cryptoData.symbol) {
        setCrypto(cryptoData);
        
        // Also refresh historical data
        try {
          const historicalResponse = await cryptoService.getHistory(symbol, '1mo', '1d');
          console.log('Refresh historical data response:', historicalResponse);
          
          if (historicalResponse && historicalResponse.data && historicalResponse.data.length > 0) {
            // API returns data in correct OHLC format, use it directly
            setHistoricalData(historicalResponse.data);
          } else {
            setHistoricalData([]);
          }
        } catch (historyError) {
          console.error('Failed to refresh historical data:', historyError);
          toast.error('Failed to refresh historical data');
          setHistoricalData([]);
        }
      }
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handlePeriodChange = async (period: string) => {
    setChartPeriod(period);
    setChartLoading(true);
    try {
      // Map period to API parameters
      const periodMap: { [key: string]: { period: string; interval: string } } = {
        '1D': { period: '1d', interval: '1h' },
        '1W': { period: '1wk', interval: '1d' },
        '1M': { period: '1mo', interval: '1d' },
        '3M': { period: '3mo', interval: '1d' },
        '1Y': { period: '1y', interval: '1wk' },
        '5Y': { period: '5y', interval: '1mo' }
      };
      
      const config = periodMap[period] || periodMap['1M'];
      const historicalResponse = await cryptoService.getHistory(symbol, config.period, config.interval);
      console.log(`Period change to ${period}:`, historicalResponse);
      
      if (historicalResponse && historicalResponse.data && historicalResponse.data.length > 0) {
        // API returns data in correct OHLC format, use it directly
        setHistoricalData(historicalResponse.data);
      } else {
        console.warn(`No historical data available for period ${period}`);
        setHistoricalData([]);
      }
    } catch (error) {
      console.error('Failed to fetch historical data for period:', error);
      toast.error('Failed to load chart data');
      setHistoricalData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const formatPrice = (price: number | undefined | null) => {
    if (!price || isNaN(price)) return '$0.00';
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
    }
  };

  const formatNumber = (num: number | undefined | null, decimals = 2): string => {
    if (num == null) return '-';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatChange = (change: number, percent: number) =>
    `${change >= 0 ? "+" : ""}${change.toFixed(2)} (${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%)`;

  const toggleWatchlist = async () => {
    if (!crypto) return;
    
    if (!user) {
      toast.error("Sign in to add to watchlist");
      return;
    }

    try {
      if (isFavorited) {
        await removeFromWatchlist(crypto.symbol);
        setIsFavorited(false);
        toast.success("Removed from watchlist");
      } else {
        await addToWatchlist(crypto.symbol);
        setIsFavorited(true);
        toast.success("Added to watchlist");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update watchlist");
    }
  };

  // Render tab content
  const renderTabContent = () => {
    if (!crypto) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            crypto={crypto}
            historicalData={historicalData}
            chartPeriod={chartPeriod}
            chartType={chartType}
            onPeriodChange={handlePeriodChange}
            onChartTypeChange={setChartType}
            chartLoading={chartLoading}
          />
        );

      case 'statistics':
        return <StatisticsTab crypto={crypto} />;

      case 'chart':
        return (
          <ChartTab
            crypto={crypto}
            historicalData={historicalData}
            chartPeriod={chartPeriod}
            chartType={chartType}
            onPeriodChange={handlePeriodChange}
            onChartTypeChange={setChartType}
            chartLoading={chartLoading}
          />
        );

      case 'history':
        return (
          <HistoryTab
            crypto={crypto}
            historicalData={historicalData.map(item => ({
              time: item.date,
              price: item.close,
              volume: item.volume,
              marketCap: crypto.marketCap
            }))}
          />
        );

      case 'profile':
        return <ProfileTab crypto={crypto} />;

      case 'news':
        return <CryptoNewsTab symbol={crypto.symbol} slug={crypto.symbol} />;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 lg:p-8 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Activity className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading cryptocurrency data...</p>
        </div>
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="min-h-screen p-4 lg:p-8 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">Cryptocurrency Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-4">The symbol "{symbol}" could not be found.</p>
          <button
            onClick={() => router.push('/crypto')}
            className="text-emerald-600 hover:text-emerald-500"
          >
            ← Back to Cryptocurrencies
          </button>
        </div>
      </div>
    );
  }

  const isPositive = crypto.change >= 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Header - Sticky */}
      <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => router.push('/crypto')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleWatchlist}
                className={`p-2 rounded-lg transition ${
                  isFavorited 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Star className="h-5 w-5" fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => router.push(`/crypto/comparison?crypto=${crypto.symbol}`)}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg"
              >
                <GitCompare className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push(`/cryptochart/${crypto.symbol}/detailedpage`)}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowAIPanel(true)}
                className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
              >
                <Brain className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {crypto.name} ({crypto.symbol})
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {crypto.assetType} · Real-Time Price · {crypto.currency}
            </p>
            
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatPrice(crypto.price)}
              </span>
              <div className={`flex items-center gap-1 text-base font-semibold ${
                isPositive ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                <span>
                  {isPositive ? '+' : ''}{formatNumber(crypto.change)} ({isPositive ? '+' : ''}{formatNumber(crypto.changePercent)}%)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Last updated: Just now
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block p-4 lg:p-6 space-y-5 w-full">
        {/* Back Button */}
        <button
          onClick={() => router.push('/crypto')}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Cryptocurrencies</span>
        </button>

        {/* Company Header */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Left: Company Info */}
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                {crypto.name} ({crypto.symbol})
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {crypto.assetType} · Real-Time Price · {crypto.currency}
              </p>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formatPrice(crypto.price)}
                </span>
                <div className={`flex items-center gap-1 text-base font-semibold ${
                  isPositive ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  <span>
                    {isPositive ? '+' : ''}{formatNumber(crypto.change)} ({isPositive ? '+' : ''}{formatNumber(crypto.changePercent)}%)
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Last updated: Just now
              </p>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={toggleWatchlist}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                  isFavorited 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Star size={16} fill={isFavorited ? 'currentColor' : 'none'} />
                Watchlist
              </button>
              <button 
                onClick={() => router.push(`/crypto/comparison?crypto=${crypto.symbol}`)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition text-sm font-medium"
              >
                <GitCompare size={16} />
                Compare
              </button>
              <button 
                onClick={() => router.push(`/cryptochart/${crypto.symbol}/detailedpage`)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition text-sm font-medium"
              >
                <Maximize2 size={16} />
                Detailed Chart
              </button>
              <button 
                onClick={() => setShowAIPanel(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition text-sm font-medium"
              >
                <Brain size={16} />
                AI Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <CryptoTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden px-4 py-4 space-y-4">
        {/* Mobile Tab Navigation */}
        <CryptoTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Mobile AI Panel Modal */}
      <AnimatePresence>
        {showAIPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-end"
            onClick={() => setShowAIPanel(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 rounded-t-2xl w-full max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                <h3 className="font-medium text-lg text-slate-900 dark:text-white">AI Analysis</h3>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"
                >
                  <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 64px)' }}>
                <AIAnalysisPanel
                  title=""
                  pageType="crypto-detail"
                  pageData={{
                    symbol: crypto.symbol,
                    name: crypto.name,
                    price: crypto.price,
                    change: crypto.changePercent,
                    volume: crypto.volume,
                    marketCap: crypto.marketCap,
                    assetType: crypto.assetType,
                    high: crypto.dayHigh,
                    low: crypto.dayLow,
                    isFeatured: crypto.isFeatured
                  } as any}
                  quickPrompts={[
                    `Is ${crypto.symbol} a good investment?`,
                    'Technical analysis',
                    'Price prediction'
                  ]}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop AI Panel - Sliding from Right */}
      <AnimatePresence>
        {showAIPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden lg:block fixed inset-0 bg-black bg-opacity-50 z-[9998]"
              onClick={() => setShowAIPanel(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="hidden lg:block fixed top-0 right-0 h-full w-96 bg-white dark:bg-slate-900 shadow-2xl z-[9999]"
            >
              <div className="h-full flex flex-col">
                {/* AI Panel Header */}
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">AI Crypto Analysis</h3>
                    </div>
                    <button
                      onClick={() => setShowAIPanel(false)}
                      className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* AI Panel Content */}
                <div className="flex-1 overflow-y-auto">
                  <AIAnalysisPanel
                    title=""
                    pageType="crypto-detail"
                    pageData={{
                      symbol: crypto.symbol,
                      name: crypto.name,
                      price: crypto.price,
                      change: crypto.changePercent,
                      volume: crypto.volume,
                      marketCap: crypto.marketCap,
                      assetType: crypto.assetType,
                      high: crypto.dayHigh,
                      low: crypto.dayLow,
                      isFeatured: crypto.isFeatured
                    } as any}
                    quickPrompts={[
                      `Is ${crypto.symbol} a good investment?`,
                      'Technical analysis',
                      'Price prediction',
                      'Risk assessment',
                      'Market sentiment'
                    ]}
                    compact={false}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

