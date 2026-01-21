"use client";

import React, { useEffect, useState } from "react";
import { Activity, TrendingUp, TrendingDown, BarChart3, AreaChart, CandlestickChart, LineChart, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
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

  // Constants
  const periods = ["1D", "5D", "1M", "YTD", "1Y", "5Y", "Max"];
  const chartTypes = [
    { key: "area", label: "Area", icon: AreaChart },
    { key: "candlestick", label: "Candle", icon: CandlestickChart },
    { key: "line", label: "Line", icon: LineChart },
    { key: "mountain", label: "Mountain", icon: AreaChart },
  ] as const;

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
  const loadChartData = async (period: string) => {
    try {
      setChartLoading(true);
      const periodMap: Record<string, string> = {
        "1D": "1d", "5D": "5d", "1M": "1mo", "YTD": "1y", "1Y": "1y", "5Y": "5y", "Max": "5y",
      };
      const mappedPeriod = periodMap[period] || "1d";
      const historyResponse = await marketService.getStockHistory(symbol, mappedPeriod);
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
    loadChartData(period);
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

  // Initial Data Fetch
  useEffect(() => {
    const fetchStockData = async () => {
      if (!symbol) return;
      try {
        setLoading(true);
        const [stockResponse, historyResponse] = await Promise.all([
          marketService.getStockProfile(symbol),
          marketService.getStockHistory(symbol, "1d"),
        ]);

        if (stockResponse) {
          // Transform API response to Stock type
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
          
          // Set today data from last item
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
            {/* AI Analysis Panel */}
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
              className="mb-5"
            />

            {/* Stats + Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Key Stats */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                  Key Statistics
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Market Cap', value: formatLargeNumber(stock.marketCap) },
                    { label: 'Volume', value: formatLargeNumber(stock.volume) },
                    { label: 'P/E Ratio (TTM)', value: formatNumber(stock.peRatio) },
                    { label: 'EPS (TTM)', value: stock.eps ? `$${formatNumber(stock.eps)}` : '-' },
                    { label: 'Beta', value: formatNumber(stock.beta) },
                    { label: '52-Week Range', value: stock.week52Low && stock.week52High ? `$${formatNumber(stock.week52Low)} - $${formatNumber(stock.week52High)}` : '-' },
                    { label: 'Dividend Yield', value: stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : '-' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                  {/* Chart Controls */}
                  <div className="mb-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
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
                  <div className="h-96 relative">
                    {chartLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                        <Activity className="h-8 w-8 text-blue-600 animate-spin" />
                      </div>
                    ) : null}
                    {historicalData.length > 0 ? (
                      <StockChart data={historicalData} isPositive={stock.change >= 0} height={384} chartType={chartType} />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg text-gray-400">
                        No data available for this period.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  About {stock.name}
                </h3>
                {stock.description ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {stock.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">No description available.</p>
                )}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {stock.sector && (
                    <span className="text-sm text-slate-500">{stock.sector}</span>
                  )}
                  {stock.industry && (
                    <span className="text-sm text-slate-400">• {stock.industry}</span>
                  )}
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "High", val: todayData?.high, color: "blue", Icon: TrendingUp },
                  { label: "Low", val: todayData?.low, color: "red", Icon: TrendingDown },
                  { label: "Volume", val: todayData?.volume ? `${(todayData.volume / 1e6).toFixed(1)}M` : "N/A", color: "purple", Icon: BarChart3 },
                  { label: "Avg Vol", val: stock.volume ? `${(stock.volume / 1e6).toFixed(1)}M` : "N/A", color: "green", Icon: Activity },
                ].map((item, i) => (
                  <div key={i} className={`bg-${item.color}-50 p-4 rounded-xl border border-${item.color}-100`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-medium text-${item.color}-700`}>{item.label}</span>
                      <item.Icon className={`h-4 w-4 text-${item.color}-600`} />
                    </div>
                    <p className={`text-lg font-bold text-${item.color}-900`}>
                      {typeof item.val === 'number' ? formatPrice(item.val) : item.val}
                    </p>
                  </div>
                ))}
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

      case 'history':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="mb-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
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
            <div className="h-[500px] relative">
              {chartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                  <Activity className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
              ) : null}
              {historicalData.length > 0 ? (
                <StockChart data={historicalData} isPositive={stock.change >= 0} height={500} chartType={chartType} />
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
      <div className="min-h-screen p-8 flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Activity className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Stock Not Found</h1>
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
      <div className="p-4 lg:p-6 space-y-5 w-full max-w-7xl mx-auto">
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
                NASDAQ · Real-Time Price · USD
              </p>

              {/* Price Row */}
              <div className="flex items-baseline gap-4 mt-3">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  ${formatNumber(stock.price)}
                </span>
                <div className={`flex items-center gap-1 text-lg font-semibold ${
                  isPositive ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
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
                <Star size={16} />
                Watchlist
              </button>
              <button 
                onClick={() => window.location.href = `/stock/${stock.symbol}/compare`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition text-sm font-medium"
              >
                <BarChart3 size={16} />
                Compare
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <StockTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}