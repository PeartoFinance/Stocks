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
  Info,
  GitCompare,
  Brain,
  Maximize2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { marketService } from "../../utils/marketService";
import { Stock, HistoricalData } from "../../types";
import toast from "react-hot-toast";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "../../utils/portfolioWatchlistAPI";
import { useAuth } from "../../context/AuthContext";

// Components
import StockChart from "../../components/StockChart";
import StockHeader from "../../components/StockHeader";
import StockOverview from "../../components/StockOverview";
import StockRiskAnalysisChart from "../../components/stock/StockRiskAnalysisChart";
import AIAnalysisPanel from "../../components/ai/AIAnalysisPanel";
import VendorsList from "../../components/VendorsList";
import VendorsListSimple from "../../components/VendorsListSimple";
import { useCurrency } from "../../context/CurrencyContext";
import PriceDisplay from "../../components/common/PriceDisplay";
import {
  StockTabs,
  FinancialsTab,
  ForecastTab,
  StatisticsTab,
  DividendsTab,
  ProfileTab,
  NewsTab,
  MetricsTab,
  type TabId,
  HistoricalDataTable
} from "../../components/stock";

interface PageProps {
  params: { symbol: string };
}

export default function StockDetailPage({ params }: PageProps) {
  const { symbol } = params;
  const router = useRouter();
  const { user } = useAuth();

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

  const { formatPrice, currency } = useCurrency();

  const formatChange = (change: number, percent: number) => {
    return (
      <span className="flex items-center gap-1">
        <PriceDisplay amount={change} coloredChange showSign />
        <span>({percent >= 0 ? "+" : ""}{percent.toFixed(2)}%)</span>
      </span>
    );
  };

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
    if (!symbol) return;
    try {
      setChartLoading(true);
      const periodMap: Record<string, string> = {
        "1D": "1d", "5D": "5d", "1M": "1mo", "YTD": "1y", "1Y": "1y", "5Y": "5y", "Max": "5y",
      };
      const mappedPeriod = periodMap[period] || "1d";
      const dataInterval = period === "1D" && interval ? interval : "1d";

      const historyResponse = await marketService.getStockHistory(symbol, mappedPeriod, dataInterval);
      if ((historyResponse as any)?.data && Array.isArray((historyResponse as any).data)) {
        const transformedData: HistoricalData[] = (historyResponse as any).data
          .filter((item: any) => item && item.date)
          .map((item: any) => ({
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

  const toggleWatchlist = async () => {
    if (!stock) return;
    
    if (!user) {
      toast.error("Sign in to add to watchlist");
      return;
    }

    try {
      if (isWatchlisted) {
        await removeFromWatchlist(stock.symbol);
        setIsWatchlisted(false);
        toast.success("Removed from watchlist");
      } else {
        await addToWatchlist(stock.symbol);
        setIsWatchlisted(true);
        toast.success("Added to watchlist");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update watchlist");
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

        if ((historyResponse as any)?.data && Array.isArray((historyResponse as any).data)) {
          const transformedData: HistoricalData[] = (historyResponse as any).data
            .filter((item: any) => item && item.date)
            .map((item: any) => ({
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
      } catch (error) {
        toast.error("Failed to load stock information");
        console.error('Stock fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStockData();
  }, [symbol]);

  // Check watchlist status when user changes
  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (user && symbol) {
        try {
          const watchlist = await getWatchlist();
          if (!watchlist || !Array.isArray(watchlist)) {
            setIsWatchlisted(false);
            return;
          }
          const decodedSymbol = decodeURIComponent(symbol);
          setIsWatchlisted(watchlist.some((item) => item?.symbol?.toUpperCase() === decodedSymbol.toUpperCase()));
        } catch (error) {
          console.error('Failed to check watchlist status:', error);
        }
      } else {
        setIsWatchlisted(false);
      }
    };
    checkWatchlistStatus();
  }, [user, symbol]);

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
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Today's Stats</h3>
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
                        {typeof item.val === 'number' ? <PriceDisplay amount={item.val} /> : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volume Stats */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Volume</h3>
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
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Key Metrics</h3>
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
                          { label: 'Market Cap', value: stock.marketCap ? <span className="flex items-center gap-0.5"><PriceDisplay amount={stock.marketCap / (stock.marketCap >= 1e12 ? 1e12 : (stock.marketCap >= 1e9 ? 1e9 : 1e6))} maximumFractionDigits={2} />{stock.marketCap >= 1e12 ? 'T' : (stock.marketCap >= 1e9 ? 'B' : 'M')}</span> : '-' },
                          { label: 'P/E Ratio', value: formatNumber(stock.peRatio) },
                          { label: 'EPS', value: stock.eps ? <PriceDisplay amount={stock.eps} /> : '-' },
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

            {/* Desktop Stats + Chart + Vendors Grid */}
            <div className="hidden lg:grid lg:grid-cols-5 gap-4 mb-5">
              {/* Key Stats - Smaller */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Key Statistics
                </h3>
                <div className="space-y-1">
                  {[
                    { label: 'Market Cap', value: stock.marketCap ? <span className="flex items-center gap-0.5"><PriceDisplay amount={stock.marketCap / (stock.marketCap >= 1e12 ? 1e12 : (stock.marketCap >= 1e9 ? 1e9 : 1e6))} maximumFractionDigits={2} />{stock.marketCap >= 1e12 ? 'T' : (stock.marketCap >= 1e9 ? 'B' : 'M')}</span> : '-' },
                    { label: 'P/E Ratio', value: formatNumber(stock.peRatio) },
                    { label: 'Forward P/E', value: formatNumber(stock.forwardPe) },
                    { label: 'EPS', value: stock.eps ? <PriceDisplay amount={stock.eps} /> : '-' },
                    { label: 'Beta', value: formatNumber(stock.beta) },
                    { label: 'Book Value', value: stock.bookValue ? <PriceDisplay amount={stock.bookValue} /> : '-' },
                    { label: 'P/B Ratio', value: formatNumber(stock.priceToBook) },
                    { label: 'Div Yield', value: stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : '-' },
                    { label: 'Div Rate', value: stock.dividendRate ? <PriceDisplay amount={stock.dividendRate} /> : '-' },
                    { label: 'Short Ratio', value: formatNumber(stock.shortRatio) },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart - Desktop (Wider) */}
              <div className="lg:col-span-3">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                  {/* Chart Controls */}
                  <div className="mb-4 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 transition-colors duration-300">Duration</span>
                        <div className="flex bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600 transition-colors duration-300 overflow-x-auto">
                          {periods.map((p) => (
                            <button
                              key={p}
                              onClick={() => handlePeriodChange(p)}
                              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${chartPeriod === p ? "bg-blue-600 dark:bg-emerald-600 text-white shadow-sm" : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600"
                                }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-base font-bold ${stock.change >= 0 ? "text-green-700 bg-green-50 dark:bg-pearto-green/10" : "text-red-700 bg-red-50 dark:bg-pearto-pink/10"
                        }`}>
                        {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {formatChange(stock.change, stock.changePercent)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 transition-colors duration-300">Type</span>
                      <div className="flex bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600 transition-colors duration-300">
                        {chartTypes.map((type) => (
                          <button
                            key={type.key}
                            onClick={() => setChartType(type.key)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${chartType === type.key ? "bg-blue-600 dark:bg-purple-600 text-white shadow-sm" : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600"
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
                      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-pearto-surface rounded-lg text-gray-400">
                        No data available for this period.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side Column - Risk Analysis + Vendors */}
              <div className="lg:col-span-1 flex flex-col">
                {/* Risk Analysis Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex-1">
                  <StockRiskAnalysisChart stock={stock} />
                </div>

                {/* Vendors List */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex-1">
                  <VendorsListSimple limit={8} />
                </div>
              </div>
            </div>

            {/* Mobile Chart */}
            <div className="lg:hidden mb-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                {/* Mobile Chart Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${stock.change >= 0 ? "text-green-700 bg-green-50 dark:bg-pearto-green/10" : "text-red-700 bg-red-50 dark:bg-pearto-pink/10"
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
                        className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${chartPeriod === p
                          ? "bg-blue-600 dark:bg-pearto-pink text-white shadow-sm"
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
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${chartType === type.key
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
                    <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-pearto-surface rounded-lg text-gray-400 text-sm">
                      No data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Risk Analysis */}
            <div className="lg:hidden mt-4">
              <StockRiskAnalysisChart stock={stock} />
            </div>

            {/* Mobile Vendors */}
            <div className="lg:hidden mt-4">
              <VendorsListSimple limit={8} />
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
                <div key={i} className={`bg-${item.color}-50 dark:bg-slate-800 p-3 rounded-xl border border-${item.color}-100 dark:border-slate-700`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium text-${item.color}-700 dark:text-slate-300`}>{item.label}</span>
                    <item.Icon className={`h-3 w-3 text-${item.color}-600 dark:text-${item.color}-400`} />
                  </div>
                  <p className={`text-base font-bold text-${item.color}-900 dark:text-white`}>
                    {typeof item.val === 'number' ? <PriceDisplay amount={item.val} /> : item.val}
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
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  About {stock.name}
                </h3>
              </div>

              {/* Company Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Description */}
                <div className="lg:col-span-2">
                  <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2">Company Overview</h4>
                  {stock.description ? (
                    <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                      {stock.description}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400">No description available.</p>
                  )}
                </div>

                {/* Company Details */}
                <div>
                  <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">Company Details</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Sector', value: stock.sector },
                      { label: 'Industry', value: stock.industry },
                      { label: 'Exchange', value: stock.exchange },
                      { label: 'Currency', value: stock.currency },
                      { label: '52W Range', value: stock.low52w && stock.high52w ? `${formatPrice(stock.low52w)} - ${formatPrice(stock.high52w)}` : '-' },
                      { label: 'Shares Out', value: stock.sharesOutstanding ? formatLargeNumber(stock.sharesOutstanding) : '-' },
                      { label: 'Website', value: stock.website ? 'Available' : '-' },
                    ].map((item, i) => (
                      item.value && (
                        <div key={i} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                          <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                          {item.label === 'Website' && stock.website ? (
                            <a href={stock.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center gap-1">
                              Visit Site
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
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

      case 'chart':
        return (
          <div className="space-y-4">
            {/* Chart Container */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
              {/* Chart Header */}
              <div className="p-4 lg:p-5 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">
                  {stock.name} ({stock.symbol}) Price Chart
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    isPositive ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10"
                  }`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    ${formatNumber(stock.price)}
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    isPositive ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10"
                  }`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {isPositive ? '+' : ''}{formatNumber(stock.change)} ({isPositive ? '+' : ''}{formatNumber(stock.changePercent)}%)
                  </div>
                </div>
              </div>

              {/* Chart Controls */}
              <div className="p-4 lg:p-5 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide transition-colors duration-300">Time Period</label>
                    <div className="flex flex-wrap gap-2">
                      {periods.map((p) => (
                        <button
                          key={p}
                          onClick={() => handlePeriodChange(p)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            chartPeriod === p ? "bg-emerald-600 text-white shadow-sm" : "bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500 border border-slate-200 dark:border-slate-600"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide transition-colors duration-300">Chart Type</label>
                    <div className="flex flex-wrap gap-2">
                      {chartTypes.map((type) => (
                        <button
                          key={type.key}
                          onClick={() => setChartType(type.key)}
                          className={`flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            chartType === type.key ? "bg-blue-600 text-white shadow-sm" : "bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500 border border-slate-200 dark:border-slate-600"
                          }`}
                        >
                          <type.icon className="h-3.5 w-3.5" />
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Display */}
              <div className="h-[400px] lg:h-[500px] relative bg-white dark:bg-slate-900 transition-colors duration-300">
                {chartLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Loading chart data...</p>
                    </div>
                  </div>
                ) : null}
                {historicalData && historicalData.length > 0 ? (
                  <div className="h-full p-2">
                    <StockChart data={historicalData} isPositive={stock.change >= 0} height={typeof window !== 'undefined' && window.innerWidth < 1024 ? 380 : 480} chartType={chartType} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No chart data available</p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Try selecting a different time period</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chart Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {[
                { label: 'Period High', value: historicalData.length > 0 ? formatPrice(Math.max(...historicalData.map(d => d.high))) : '-', icon: TrendingUp, color: 'emerald' },
                { label: 'Period Low', value: historicalData.length > 0 ? formatPrice(Math.min(...historicalData.map(d => d.low))) : '-', icon: TrendingDown, color: 'red' },
                { label: 'Average Price', value: historicalData.length > 0 ? formatPrice(historicalData.reduce((sum, d) => sum + d.close, 0) / historicalData.length) : '-', icon: BarChart3, color: 'blue' },
                { label: 'Volatility', value: historicalData.length > 1 ? `${((Math.max(...historicalData.map(d => d.high)) - Math.min(...historicalData.map(d => d.low))) / Math.min(...historicalData.map(d => d.low)) * 100).toFixed(2)}%` : '-', icon: Activity, color: 'purple' },
              ].map((item, i) => (
                <div key={i} className={`bg-${item.color}-50 dark:bg-slate-800 p-3 lg:p-4 rounded-xl border border-${item.color}-100 dark:border-slate-700 shadow-sm`}>
                  <div className="flex items-center gap-1.5 lg:gap-2 mb-1.5 lg:mb-2">
                    <item.icon className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-${item.color}-600 dark:text-${item.color}-400`} />
                    <span className={`text-xs lg:text-sm font-semibold text-${item.color}-700 dark:text-${item.color}-300`}>{item.label}</span>
                  </div>
                  <p className="text-base lg:text-lg font-bold text-slate-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Volume Analysis */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
              <div className="p-4 lg:p-5 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">Volume Analysis</h3>
              </div>
              <div className="p-4 lg:p-5">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                  {[
                    { label: 'Total Volume', value: historicalData.length > 0 ? `${(historicalData.reduce((sum, d) => sum + d.volume, 0) / 1e9).toFixed(2)}B` : '-', icon: Activity, color: 'blue' },
                    { label: 'Average Volume', value: historicalData.length > 0 ? `${(historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length / 1e6).toFixed(2)}M` : '-', icon: BarChart3, color: 'emerald' },
                    { label: 'Max Volume', value: historicalData.length > 0 ? `${(Math.max(...historicalData.map(d => d.volume)) / 1e6).toFixed(2)}M` : '-', icon: TrendingUp, color: 'purple' },
                  ].map((item, i) => (
                    <div key={i} className={`bg-${item.color}-50 dark:bg-slate-700/50 p-3 lg:p-4 rounded-xl border border-${item.color}-100 dark:border-slate-600 shadow-sm`}>
                      <div className="flex items-center gap-1.5 lg:gap-2 mb-1.5 lg:mb-2">
                        <item.icon className={`h-3.5 w-3.5 lg:h-4 lg:w-4 text-${item.color}-600 dark:text-${item.color}-400`} />
                        <span className={`text-xs lg:text-sm font-semibold text-${item.color}-700 dark:text-${item.color}-300`}>{item.label}</span>
                      </div>
                      <p className="text-base lg:text-lg font-bold text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <HistoricalDataTable
            data={historicalData}
            symbol={symbol}
            onDataUpdate={(newData: HistoricalData[]) => setHistoricalData(newData)}
            onLoadingChange={(loading: boolean) => setChartLoading(loading)}
          />
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
      <div className="min-h-screen p-4 lg:p-8 flex items-center justify-center bg-gray-50 e dark:bg-slate-900">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen p-4 lg:p-8 flex items-center justify-center bg-gray-50  dark:bg-slate-900">
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
    <div className="min-h-screen bg-gray-50  dark:bg-slate-900">
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
                className={`p-2 rounded-lg transition ${isWatchlisted
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
              >
                <Star className="h-5 w-5" fill={isWatchlisted ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => router.push(`/stocks/comparison?stocks=${stock.symbol}`)}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <GitCompare className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push(`/stockchart/${stock.symbol}/detailedpage`)}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
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
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">{stock.symbol}</h1>
              <span className="text-sm text-slate-500 dark:text-slate-400">{stock.exchange}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{stock.name}</p>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                ${formatNumber(stock.price)}
              </span>
              <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'
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
      <div className="hidden lg:block p-4 lg:p-6 space-y-5 w-full">
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
                <div className={`flex items-center gap-1 text-base sm:text-lg font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${isWatchlisted
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
              >
                <Star size={16} fill={isWatchlisted ? 'currentColor' : 'none'} />
                Watchlist
              </button>
              <button
                onClick={() => router.push(`/stocks/comparison?stocks=${stock.symbol}`)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition text-sm font-medium"
              >
                <GitCompare size={16} />
                Compare
              </button>
              <button
                onClick={() => router.push(`/stockchart/${stock.symbol}/detailedpage`)}
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
        <StockTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden px-4 py-4 space-y-4">
        {/* Mobile Tab Navigation */}
        <StockTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
              <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
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
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">AI Stock Analysis</h3>
                    </div>
                    <button
                      onClick={() => setShowAIPanel(false)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
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
                    quickPrompts={[
                      `Is ${stock.symbol} undervalued?`,
                      'Technical analysis',
                      'Buy or sell?',
                      'Risk assessment',
                      'Price target'
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