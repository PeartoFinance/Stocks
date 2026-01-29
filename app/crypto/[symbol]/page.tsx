'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Globe,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  Star,
  Share2,
  RefreshCw,
  Clock,
  Volume2,
  Hash,
  Target,
  Zap,
  Shield,
  Eye,
  Heart,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import cryptoService from '@/app/utils/cryptoService';
import AIAnalysisPanel from '@/app/components/ai/AIAnalysisPanel';
import StockChart from '@/app/components/StockChart';
import { HistoricalData as StockHistoricalData } from '@/app/types';

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

  const [crypto, setCrypto] = useState<CryptoDetails | null>(null);
  const [historicalData, setHistoricalData] = useState<StockHistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'markets' | 'analytics'>('overview');
  const [isFavorited, setIsFavorited] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('1M');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [chartLoading, setChartLoading] = useState(false);

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
            console.log('Setting historical data:', historicalResponse.data);
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
            console.log('Setting refreshed historical data:', historicalResponse.data);
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
        console.log(`Setting historical data for ${period}:`, historicalResponse.data);
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

  const formatSupply = (supply: number | undefined | null) => {
    if (!supply || isNaN(supply)) return '0';
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`;
    if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K`;
    return supply.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600"></div>
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cryptocurrency Not Found</h2>
          <p className="text-gray-600 mb-4">The cryptocurrency you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/crypto')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Back to Crypto Markets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Crypto Logo and Basic Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {crypto.symbol.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {crypto.name}
                      </h1>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-lg font-medium text-gray-600 uppercase">
                          {crypto.symbol}
                        </span>
                        <span className="px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-800 rounded-full">
                          {crypto.assetType === 'crypto' ? 'Cryptocurrency' : 'Asset'}
                        </span>
                        {crypto.isFeatured && (
                          <span className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-800 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsFavorited(!isFavorited)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Share2 className="h-5 w-5 text-gray-400" />
                      </button>
                      <button
                        onClick={handleRefresh}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        disabled={refreshing}
                      >
                        <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''} text-gray-400`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price and Market Data */}
              <div className="flex flex-col sm:flex-row gap-4 lg:ml-auto">
                <div className="text-center sm:text-right">
                  <p className="text-sm text-gray-600 mb-1">Current Price</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatPrice(crypto.price)}</p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${(crypto.changePercent || 0) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {(crypto.changePercent || 0) >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(crypto.changePercent || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'markets', label: 'Markets', icon: Activity },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.charAt(0)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Mobile Key Stats */}
              <div className="lg:hidden mb-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Key Statistics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Market Cap', value: formatMarketCap(crypto.marketCap) },
                      { label: '24h Volume', value: formatVolume(crypto.volume) },
                      { label: 'Change %', value: `${(crypto.changePercent || 0).toFixed(2)}%` },
                      { label: 'Day High', value: crypto.dayHigh ? formatPrice(crypto.dayHigh) : '-' },
                      { label: 'Day Low', value: crypto.dayLow ? formatPrice(crypto.dayLow) : '-' },
                      { label: '52W High', value: crypto.high52w ? formatPrice(crypto.high52w) : '-' },
                      { label: '52W Low', value: crypto.low52w ? formatPrice(crypto.low52w) : '-' },
                      { label: 'Currency', value: crypto.currency },
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop Stats + Chart Grid */}
              <div className="hidden lg:grid lg:grid-cols-5 gap-4 mb-5">
                {/* Key Stats - Smaller */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Key Statistics
                  </h3>
                  <div className="space-y-1">
                    {[
                      { label: 'Market Cap', value: formatMarketCap(crypto.marketCap) },
                      { label: '24h Volume', value: formatVolume(crypto.volume) },
                      { label: 'Change %', value: `${(crypto.changePercent || 0).toFixed(2)}%` },
                      { label: 'Day High', value: crypto.dayHigh ? formatPrice(crypto.dayHigh) : '-' },
                      { label: 'Day Low', value: crypto.dayLow ? formatPrice(crypto.dayLow) : '-' },
                      { label: '52W High', value: crypto.high52w ? formatPrice(crypto.high52w) : '-' },
                      { label: '52W Low', value: crypto.low52w ? formatPrice(crypto.low52w) : '-' },
                      { label: 'Currency', value: crypto.currency },
                      { label: 'Country', value: crypto.countryCode },
                      { label: 'Asset Type', value: crypto.assetType },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                        <span className="text-xs font-medium text-slate-900 dark:text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart - Desktop (Wider) */}
                <div className="lg:col-span-3">
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                    {/* Chart Controls */}
                    <div className="mb-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-700">Duration</span>
                          <div className="flex bg-white rounded-lg p-1 border border-slate-200 overflow-x-auto">
                            {['1D', '1W', '1M', '3M', '1Y', '5Y'].map((p) => (
                              <button
                                key={p}
                                onClick={() => handlePeriodChange(p)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                  chartPeriod === p ? "bg-gray-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${
                          (crypto.changePercent || 0) >= 0 ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                        }`}>
                          {(crypto.changePercent || 0) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {(crypto.changePercent || 0) >= 0 ? '+' : ''}{(crypto.changePercent || 0).toFixed(2)}%
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">Type</span>
                        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                          {[
                            { key: 'area' as ChartType, label: 'Area', icon: Activity },
                            { key: 'line' as ChartType, label: 'Line', icon: BarChart3 },
                            { key: 'candlestick' as ChartType, label: 'Candle', icon: BarChart3 },
                          ].map((type) => (
                            <button
                              key={type.key}
                              onClick={() => setChartType(type.key)}
                              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                chartType === type.key ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              <type.icon className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="h-80 relative">
                      {chartLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                          <Activity className="h-8 w-8 text-blue-600 animate-spin" />
                        </div>
                      ) : null}
                      {historicalData.length > 0 && historicalData[0]?.date ? (
                        <StockChart data={historicalData} isPositive={(crypto.changePercent || 0) >= 0} height={320} chartType={chartType} />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg text-gray-400">
                          <div className="text-center">
                            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p>No historical data available</p>
                            <p className="text-sm mt-1">Try refreshing or selecting a different time period</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Analysis Panel Column */}
                <div className="lg:col-span-1">
                  <AIAnalysisPanel
                    title={`${crypto.name} Analysis`}
                    pageType="crypto-detail"
                    pageData={{
                      symbol: crypto.symbol,
                      name: crypto.name,
                      price: crypto.price,
                      marketCap: crypto.marketCap,
                      volume: crypto.volume,
                      changePercent: crypto.changePercent,
                      change: crypto.change,
                      currency: crypto.currency,
                      countryCode: crypto.countryCode,
                      assetType: crypto.assetType,
                      dayHigh: crypto.dayHigh,
                      dayLow: crypto.dayLow,
                      high52w: crypto.high52w,
                      low52w: crypto.low52w
                    }}
                    autoAnalyze={true}
                    compact={true}
                    quickPrompts={[
                      "Price prediction",
                      "Market sentiment",
                      "Risk analysis",
                      "Investment potential"
                    ]}
                    maxHeight="400px"
                  />
                </div>
              </div>

              {/* Mobile Chart */}
              <div className="lg:hidden mb-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  {/* Mobile Chart Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${
                      (crypto.changePercent || 0) >= 0 ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                    }`}>
                      {(crypto.changePercent || 0) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {(crypto.changePercent || 0) >= 0 ? '+' : ''}{(crypto.changePercent || 0).toFixed(2)}%
                    </div>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                      <BarChart3 className="h-5 w-5 text-slate-600" />
                    </button>
                  </div>

                  {/* Period Selector - Always Visible on Mobile */}
                  <div className="mb-3 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 pb-2">
                      {['1D', '1W', '1M', '3M', '1Y', '5Y'].map((p) => (
                        <button
                          key={p}
                          onClick={() => handlePeriodChange(p)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                            chartPeriod === p ? "bg-gray-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Chart Type Selector */}
                  <div className="mb-3">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {[
                        { key: 'area' as ChartType, label: 'Area', icon: Activity },
                        { key: 'line' as ChartType, label: 'Line', icon: BarChart3 },
                        { key: 'candlestick' as ChartType, label: 'Candle', icon: BarChart3 },
                      ].map((type) => (
                        <button
                          key={type.key}
                          onClick={() => setChartType(type.key)}
                          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                            chartType === type.key ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <type.icon className="h-3 w-3" />
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Chart */}
                  <div className="h-64 relative">
                    {chartLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                        <Activity className="h-6 w-6 text-blue-600 animate-spin" />
                      </div>
                    ) : null}
                    {historicalData.length > 0 && historicalData[0]?.date ? (
                      <StockChart data={historicalData} isPositive={(crypto.changePercent || 0) >= 0} height={256} chartType={chartType} />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg text-gray-400">
                        <div className="text-center">
                          <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm">No historical data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile AI Analysis */}
              <div className="lg:hidden mb-6">
                <AIAnalysisPanel
                  title={`${crypto.name} Analysis`}
                  pageType="crypto-detail"
                  pageData={{
                    symbol: crypto.symbol,
                    name: crypto.name,
                    price: crypto.price,
                    marketCap: crypto.marketCap,
                    volume: crypto.volume,
                    changePercent: crypto.changePercent,
                    change: crypto.change,
                    currency: crypto.currency,
                    countryCode: crypto.countryCode,
                    assetType: crypto.assetType,
                    dayHigh: crypto.dayHigh,
                    dayLow: crypto.dayLow,
                    high52w: crypto.high52w,
                    low52w: crypto.low52w
                  }}
                  autoAnalyze={true}
                  compact={true}
                  quickPrompts={[
                    "Price prediction",
                    "Market sentiment",
                    "Risk analysis",
                    "Investment potential"
                  ]}
                  maxHeight="300px"
                />
              </div>

              {/* Additional Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Market Statistics */}
                <div className="lg:col-span-2">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-emerald-600" />
                      Market Statistics
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-gray-600">Market Cap</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{formatMarketCap(crypto.marketCap)}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Volume2 className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-gray-600">24h Volume</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{formatVolume(crypto.volume)}</p>
                      </div>
                      {crypto.dayHigh && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm text-gray-600">Day High</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{formatPrice(crypto.dayHigh)}</p>
                        </div>
                      )}
                      {crypto.dayLow && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm text-gray-600">Day Low</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{formatPrice(crypto.dayLow)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="lg:col-span-1">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
                    <div className="space-y-2">
                      {crypto.website && (
                        <a
                          href={crypto.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Globe className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-gray-700">Official Website</span>
                          <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
                        </a>
                      )}
                      {!crypto.website && (
                        <div className="text-center py-4">
                          <Globe className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No official website available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'markets' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                Market Data
              </h2>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600">Detailed market analysis coming soon</p>
                <p className="text-sm text-gray-500 mt-2">Advanced market metrics and trading data</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* AI Analysis */}
              <div className="lg:col-span-2">
                <AIAnalysisPanel
                  title={`${crypto.name} Analysis`}
                  pageType="crypto-detail"
                  pageData={{
                    symbol: crypto.symbol,
                    name: crypto.name,
                    price: crypto.price,
                    marketCap: crypto.marketCap,
                    volume: crypto.volume,
                    changePercent: crypto.changePercent,
                    change: crypto.change,
                    currency: crypto.currency,
                    countryCode: crypto.countryCode,
                    assetType: crypto.assetType,
                    dayHigh: crypto.dayHigh,
                    dayLow: crypto.dayLow,
                    high52w: crypto.high52w,
                    low52w: crypto.low52w
                  }}
                  autoAnalyze={true}
                  compact={false}
                  quickPrompts={[
                    "Price prediction",
                    "Market sentiment",
                    "Risk analysis",
                    "Investment potential"
                  ]}
                  maxHeight="600px"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
