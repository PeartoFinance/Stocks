"use client";

import React, { useEffect, useState } from "react";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  AreaChart, 
  CandlestickChart, 
  LineChart, 
  ArrowLeft, 
  Star,
  Share2,
  Bell,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { marketService } from "../../utils/marketService";
import { Stock, HistoricalData } from "../../types";
import toast from "react-hot-toast";

// Components
import StockChart from "../../components/StockChart";
import StockHeader from "../../components/StockHeader";
import StockOverview from "../../components/StockOverview";
import AIAnalysisPanel from "../../components/ai/AIAnalysisPanel";
import {
  StockTabs,
  FinancialsTab,
  ForecastTab,
  StatisticsTab,
  DividendsTab,
  ProfileTab,
  NewsTab,
  MetricsTab,
  type TabId
} from "../../components/stock";

interface PageProps {
  params: { symbol: string };
}

export default function StockDetailPage({ params }: PageProps) {
  const { symbol } = params;
  
  // State
  const [stock, setStock] = useState<Stock | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [todayData, setTodayData] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [chartPeriod, setChartPeriod] = useState("1D");
  const [chartType, setChartType] = useState<"area" | "candlestick" | "line" | "mountain">("area");
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showChartControls, setShowChartControls] = useState(false);
  const [showStatsExpanded, setShowStatsExpanded] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Constants
  const periods = ["1D", "5D", "1M", "YTD", "1Y", "5Y", "Max"];
  const chartTypes = [
    { key: "area", label: "Area", icon: AreaChart },
    { key: "candlestick", label: "Candle", icon: CandlestickChart },
    { key: "line", label: "Line", icon: LineChart },
    { key: "mountain", label: "Mountain", icon: AreaChart },
  ] as const;
  
  const minuteIntervals = ["1m", "5m", "15m", "30m", "1h"];
  const [selectedInterval, setSelectedInterval] = useState("1m");

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number, percent: number) =>
    `${change >= 0 ? "+" : ""}${change.toFixed(2)} (${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%)`;
  
  const formatNumber = (num: number | undefined | null, decimals = 2): string => {
    if (num == null) return '-';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatLargeNumber = (num: number | undefined | null): string => {
    if (num == null) return '-';
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  // Actions
  const loadChartData = async (period: string, interval?: string) => {
    try {
      setChartLoading(true);
      const periodMap: Record<string, string> = {
        "1D": "1d", "5D": "5d", "1M": "1mo", "YTD": "1y", "1Y": "1y", "5Y": "5y", "Max": "5y",
      };
      const mappedPeriod = periodMap[period] || "1d";
      const dataInterval = period === "1D" && interval ? interval : "1d";
      
      const historyResponse = await marketService.getStockHistory(symbol, mappedPeriod, dataInterval);
      if ((historyResponse as any)?.data) {
        const transformedData: HistoricalData[] = (historyResponse as any).data.map((item: any) => ({
          date: item.date,
          open: item.open || item.close,
          high: item.high || item.close,
          low: item.low || item.close,
          close: item.close,
          volume: item.volume || 0,
        }));
        setHistoricalData(transformedData);
      }
    } catch (error) {
      console.error("Error loading chart data:", error);
    } finally {
      setChartLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    setChartPeriod(period);
    if (period === "1D") {
      loadChartData(period, "1m");
    } else {
      loadChartData(period);
    }
  };

  const handleIntervalChange = (interval: string) => {
    setSelectedInterval(interval);
    if (chartPeriod === "1D") {
      loadChartData(chartPeriod, interval);
    }
  };

  const toggleWatchlist = () => {
    if (!stock) return;
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    if (isWatchlisted) {
      const newWatchlist = watchlist.filter((item: Stock) => item.symbol !== stock.symbol);
      localStorage.setItem("watchlist", JSON.stringify(newWatchlist));
      setIsWatchlisted(false);
      toast.success("Removed from watchlist");
    } else {
      watchlist.push(stock);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      setIsWatchlisted(true);
      toast.success("Added to watchlist");
    }
  };

  const handleShare = async () => {
    if (navigator.share && stock) {
      try {
        await navigator.share({
          title: `${stock.name} (${stock.symbol})`,
          text: `Check out ${stock.name} stock price: $${stock.price}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    const fetchStockData = async () => {
      if (!symbol) return;
      try {
        setLoading(true);
        const [stockResponse, historyResponse] = await Promise.all([
          marketService.getStockProfile(symbol),
          marketService.getStockHistory(symbol, "1d", "1m"),
        ]);

        if (stockResponse) {
          const apiResponse = stockResponse as any;
          const transformedStock: Stock = {
            symbol: apiResponse.symbol || symbol,
            name: apiResponse.name || 'Unknown',
            price: apiResponse.price || 0,
            change: apiResponse.change || 0,
            changePercent: apiResponse.changePercent || 0,
            volume: apiResponse.volume,
            marketCap: apiResponse.marketCap,
            peRatio: apiResponse.peRatio,
            eps: apiResponse.eps,
            dividendYield: apiResponse.dividendYield,
            week52High: apiResponse.high52w,
            week52Low: apiResponse.low52w,
            beta: apiResponse.beta,
            sector: apiResponse.sector,
            industry: apiResponse.industry,
            description: apiResponse.description,
            open: apiResponse.open,
            high: apiResponse.dayHigh,
            low: apiResponse.dayLow,
            previousClose: apiResponse.previousClose,
            avgVolume: apiResponse.avgVolume,
            forwardPe: apiResponse.forwardPe,
            exchange: apiResponse.exchange,
            currency: apiResponse.currency,
            lastUpdated: apiResponse.lastUpdated,
          };
          setStock(transformedStock);
        }
        
        if ((historyResponse as any)?.data) {
          const transformedData: HistoricalData[] = (historyResponse as any).data.map((item: any) => ({
            date: item.date,
            open: item.open || item.close,
            high: item.high || item.close,
            low: item.low || item.close,
            close: item.close,
            volume: item.volume || 0,
          }));
          setHistoricalData(transformedData);
          
          if (transformedData.length > 0) {
            setTodayData(transformedData[transformedData.length - 1]);
          }
        }

        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        setIsWatchlisted(watchlist.some((item: Stock) => item.symbol === symbol));
      } catch (error) {
        toast.error("Failed to load stock information");
        console.error('Stock fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStockData();
  }, [symbol]);

  // Render tab content
  const renderTabContent = () => {
    if (!stock) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <>
            {/* Mobile Compact Stats */}
            <div className="lg:hidden space-y-3 mb-4">
              {/* Today's Stats */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Today's Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Open", val: stock.open, icon: TrendingUp },
                    { label: "High", val: stock.dayHigh || todayData?.high, icon: TrendingUp },
                    { label: "Low", val: stock.dayLow || todayData?.low, icon: TrendingDown },
                    { label: "Prev Close", val: stock.previousClose, icon: BarChart3 },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                      </div>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {typeof item.val === 'number' ? formatPrice(item.val) : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volume Stats */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Volume</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Volume", val: stock.volume ? `${(stock.volume / 1e6).toFixed(1)}M` : "N/A" },
                    { label: "Avg Vol", val: stock.avgVolume ? `${(stock.avgVolume / 1e6).toFixed(1)}M` : "N/A" },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{item.label}</span>
                      <p className="text-base font-bold text-slate-900 dark:text-white">{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Metrics - Collapsible */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setShowStatsExpanded(!showStatsExpanded)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Key Metrics</h3>
                  {showStatsExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </button>
                
                <AnimatePresence>
                  {showStatsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2">
                        {[
                          { label: 'Market Cap', value: formatLargeNumber(stock.marketCap) },
                          { label: 'P/E Ratio', value: formatNumber(stock.peRatio) },
                          { label: 'EPS', value: stock.eps ? `$${formatNumber(stock.eps)}` : '-' },
                          { label: 'Beta', value: formatNumber(stock.beta) },
                          { label: 'Div Yield', value: stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : '-' },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                            <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Desktop Stats + Chart Grid */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-5 mb-5">
              {/* Key Stats - Smaller */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Key Statistics
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Market Cap', value: formatLargeNumber(stock.marketCap) },
                    { label: 'P/E Ratio', value: formatNumber(stock.peRatio) },
                    { label: 'Forward P/E', value: formatNumber(stock.forwardPe) },
                    { label: 'EPS', value: stock.eps ? `$${formatNumber(stock.eps)}` : '-' },
                    { label: 'Beta', value: formatNumber(stock.beta) },
                    { label: 'Book Value', value: stock.bookValue ? `$${formatNumber(stock.bookValue)}` : '-' },
                    { label: 'P/B Ratio', value: formatNumber(stock.priceToBook) },
                    { label: 'Div Yield', value: stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : '-' },
                    { label: 'Div Rate', value: stock.dividendRate ? `$${formatNumber(stock.dividendRate)}` : '-' },
                    { label: 'Short Ratio', value: formatNumber(stock.shortRatio) },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                      <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart - Desktop */}
              <div className="lg:col-span-3">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                  {/* Chart Controls */}
                  <div className="mb-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">Duration</span>
                        <div className="flex bg-white rounded-lg p-1 border border-slate-200 overflow-x-auto">
                          {periods.map((p) => (
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
                        stock.change >= 0 ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                      }`}>
                        {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {formatChange(stock.change, stock.changePercent)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">Type</span>
                      <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                        {chartTypes.map((type) => (
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
                    {historicalData.length > 0 ? (
                      <StockChart data={historicalData} isPositive={stock.change >= 0} height={320} chartType={chartType} />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg text-gray-400">
                        No data available for this period.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Chart */}
            <div className="lg:hidden mb-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                {/* Mobile Chart Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${
                    stock.change >= 0 ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                  }`}>
                    {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {formatChange(stock.change, stock.changePercent)}
                  </div>
                  <button
                    onClick={() => setShowChartControls(!showChartControls)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  >
                    <Menu className="h-5 w-5 text-slate-600" />
                  </button>
                </div>

                {/* Period Selector - Always Visible on Mobile */}
                <div className="mb-3 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-2 pb-2">
                    {periods.map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePeriodChange(p)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                          chartPeriod === p 
                            ? "bg-blue-600 text-white shadow-sm" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart Type Selector - Collapsible */}
                <AnimatePresence>
                  {showChartControls && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-3"
                    >
                      <div className="flex gap-2 pb-2">
                        {chartTypes.map((type) => (
                          <button
                            key={type.key}
                            onClick={() => setChartType(type.key)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                              chartType === type.key 
                                ? "bg-blue-600 text-white" 
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <type.icon className="h-4 w-4" />
                            <span>{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Chart */}
                <div className="h-64 relative">
                  {chartLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                      <Activity className="h-6 w-6 text-blue-600 animate-spin" />
                    </div>
                  ) : null}
                  {historicalData.length > 0 ? (
                    <StockChart data={historicalData} isPositive={stock.change >= 0} height={256} chartType={chartType} />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg text-gray-400 text-sm">
                      No data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Row - Desktop Only */}
            <div className="hidden lg:grid lg:grid-cols-6 gap-3 mb-5">
              {[
                { label: "Open", val: stock.open, color: "blue", Icon: TrendingUp },
                { label: "High", val: stock.dayHigh || todayData?.high, color: "green", Icon: TrendingUp },
                { label: "Low", val: stock.dayLow || todayData?.low, color: "red", Icon: TrendingDown },
                { label: "Prev Close", val: stock.previousClose, color: "gray", Icon: BarChart3 },
                { label: "Volume", val: stock.volume ? `${(stock.volume / 1e6).toFixed(1)}M` : "N/A", color: "purple", Icon: BarChart3 },
                { label: "Avg Vol", val: stock.avgVolume ? `${(stock.avgVolume / 1e6).toFixed(1)}M` : "N/A", color: "indigo", Icon: Activity },
              ].map((item, i) => (
                <div key={i} className={`bg-${item.color}-50 p-3 rounded-xl border border-${item.color}-100`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-medium text-${item.color}-700`}>{item.label}</span>
                    <item.Icon className={`h-3 w-3 text-${item.color}-600`} />
                  </div>
                  <p className={`text-sm font-bold text-${item.color}-900`}>
                    {typeof item.val === 'number' ? formatPrice(item.val) : item.val}
                  </p>
                </div>
              ))}
            </div>

            {/* About Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 mb-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-base lg:text-lg font-semibold text-slate-900 dark:text-white">
                  About {stock.name}
                </h3>
              </div>
              
              {/* Company Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Description */}
                <div className="lg:col-span-2">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Company Overview</h4>
                  {stock.description ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {stock.description}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400">No description available.</p>
                  )}
                </div>
                
                {/* Company Details */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Company Details</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Sector', value: stock.sector },
                      { label: 'Industry', value: stock.industry },
                      { label: 'Exchange', value: stock.exchange },
                      { label: 'Currency', value: stock.currency },
                      { label: '52W Range', value: stock.low52w && stock.high52w ? `$${formatNumber(stock.low52w)} - $${formatNumber(stock.high52w)}` : '-' },
                      { label: 'Shares Out', value: stock.sharesOutstanding ? formatLargeNumber(stock.sharesOutstanding) : '-' },
                      { label: 'Website', value: stock.website ? 'Available' : '-' },
                    ].map((item, i) => (
                      item.value && (
                        <div key={i} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                          <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                          {item.label === 'Website' && stock.website ? (
                            <a href={stock.website} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
                              Visit Site
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-xs font-medium text-slate-900 dark:text-white">{item.value}</span>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis Panel - Desktop */}
            <div className="hidden lg:block">
              <AIAnalysisPanel
                title={`${stock.symbol} Analysis`}
                pageType="stock-detail"
                pageData={{
                  symbol: stock.symbol,
                  name: stock.name,
                  price: stock.price,
                  change: stock.changePercent,
                  volume: stock.volume,
                  marketCap: stock.marketCap,
                  pe: stock.peRatio,
                  sector: stock.sector,
                  high: todayData?.high,
                  low: todayData?.low,
                  beta: stock.beta,
                  dividendYield: stock.dividendYield
                } as any}
                autoAnalyze={true}
                quickPrompts={[
                  `Is ${stock.symbol} undervalued?`,
                  'Technical analysis',
                  'Buy or sell recommendation'
                ]}
              />
            </div>

            {/* Mobile AI Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowAIPanel(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition"
              >
                <BarChart3 className="h-5 w-5" />
                Get AI Analysis
              </button>
            </div>
          </>
        );

      case 'financials':
        return <FinancialsTab symbol={symbol} />;

      case 'forecast':
        return <ForecastTab symbol={symbol} currentPrice={stock.price} />;

      case 'statistics':
        return <StatisticsTab stock={stock} />;

      case 'metrics':
        return <MetricsTab stock={stock} />;

      case 'dividends':
        return <DividendsTab symbol={symbol} />;

      case 'history':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-5">
            <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="flex flex-col gap-3 mb-3">
                <span className="text-sm font-semibold text-gray-700">Duration</span>
                <div className="flex bg-white rounded-lg p-1 border border-slate-200 overflow-x-auto scrollbar-hide">
                  {periods.map((p) => (
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
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-gray-700">Type</span>
                <div className="flex bg-white rounded-lg p-1 border border-slate-200 overflow-x-auto scrollbar-hide">
                  {chartTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setChartType(type.key)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                        chartType === type.key ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <type.icon className="h-3.5 w-3.5" />
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-64 lg:h-[500px] relative">
              {chartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                  <Activity className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
              ) : null}
              {historicalData.length > 0 ? (
                <StockChart data={historicalData} isPositive={stock.change >= 0} height={window.innerWidth < 1024 ? 256 : 500} chartType={chartType} />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg text-gray-400">
                  No data available for this period.
                </div>
              )}
            </div>
          </div>
        );

      case 'profile':
        return <ProfileTab stock={stock} />;

      case 'news':
        return <NewsTab symbol={symbol} />;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 lg:p-8 flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen p-4 lg:p-8 flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">Stock Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-4">The symbol "{symbol}" could not be found.</p>
          <Link href="/stocks" className="text-blue-600 hover:text-blue-500">
            ← Back to Stocks
          </Link>
        </div>
      </div>
    );
  }

  const isPositive = stock.change >= 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Mobile Header - Sticky */}
      <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Link href="/stocks" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleWatchlist}
                className={`p-2 rounded-lg transition ${
                  isWatchlisted 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Star className="h-5 w-5" fill={isWatchlisted ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">{stock.symbol}</h1>
              <span className="text-sm text-slate-500 dark:text-slate-400">{stock.exchange}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{stock.name}</p>
            
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                ${formatNumber(stock.price)}
              </span>
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>
                  {isPositive ? '+' : ''}{formatNumber(stock.change)} ({isPositive ? '+' : ''}{formatNumber(stock.changePercent)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block p-4 lg:p-6 space-y-5 w-full max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/stocks"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Stocks</span>
        </Link>

        {/* Company Header */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Left: Company Info */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                {stock.name} ({stock.symbol})
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {stock.exchange} · Real-Time Price · {stock.currency}
              </p>

              {/* Price Row */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mt-3">
                <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  ${formatNumber(stock.price)}
                </span>
                <div className={`flex items-center gap-1 text-base sm:text-lg font-semibold ${
                  isPositive ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {isPositive ? <TrendingUp size={18} className="sm:w-5 sm:h-5" /> : <TrendingDown size={18} className="sm:w-5 sm:h-5" />}
                  <span>
                    {isPositive ? '+' : ''}{formatNumber(stock.change)} ({isPositive ? '+' : ''}{formatNumber(stock.changePercent)}%)
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
                  isWatchlisted 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Star size={16} fill={isWatchlisted ? 'currentColor' : 'none'} />
                Watchlist
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition text-sm font-medium"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <StockTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden px-4 py-4 space-y-4">
        {/* Mobile Tab Navigation */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-2">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'statistics', label: 'Stats' },
                { id: 'financials', label: 'Financials' },
                { id: 'news', label: 'News' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

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
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
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
              <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">AI Analysis</h3>
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
                  pageType="stock-detail"
                  pageData={{
                    symbol: stock.symbol,
                    name: stock.name,
                    price: stock.price,
                    change: stock.changePercent,
                    volume: stock.volume,
                    marketCap: stock.marketCap,
                    pe: stock.peRatio,
                    sector: stock.sector,
                    high: todayData?.high,
                    low: todayData?.low,
                    beta: stock.beta,
                    dividendYield: stock.dividendYield
                  } as any}
                  autoAnalyze={true}
                  quickPrompts={[
                    `Is ${stock.symbol} undervalued?`,
                    'Technical analysis',
                    'Buy or sell?'
                  ]}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}