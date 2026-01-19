"use client";

import React, { useEffect, useState } from "react";
import { Activity, TrendingUp, TrendingDown, BarChart3, AreaChart, CandlestickChart, LineChart } from "lucide-react";
import { stockAPI } from "../../utils/api";
import { Stock, HistoricalData } from "../../types";
import toast from "react-hot-toast";

// Components
import StockChart from "../../components/StockChart";
import StockHeader from "../../components/StockHeader";
import StockOverview from "../../components/StockOverview";

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
  const [activeTab, setActiveTab] = useState("Overview");
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

  // Actions
  const loadChartData = async (period: string) => {
    try {
      setChartLoading(true);
      const periodMap: Record<string, string> = {
        "1D": "1d", "5D": "5d", "1M": "1mo", "YTD": "1y", "1Y": "1y", "5Y": "5y", "Max": "5y",
      };
      const mappedPeriod = periodMap[period] || "1d";
      const historyResponse = await stockAPI.getHistoricalData(symbol, mappedPeriod);
      if (historyResponse.data) setHistoricalData(historyResponse.data);
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
        const [stockResponse, historyResponse, todayResponse] = await Promise.all([
          stockAPI.getStockQuote(symbol),
          stockAPI.getHistoricalData(symbol, "1d"),
          stockAPI.getTodayData(symbol),
        ]);

        if (stockResponse.data) setStock(stockResponse.data);
        if (historyResponse.data) setHistoricalData(historyResponse.data);
        if (todayResponse.data) setTodayData(todayResponse.data);

        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        setIsWatchlisted(watchlist.some((item: Stock) => item.symbol === symbol));
      } catch (error) {
        toast.error("Failed to load stock information");
      } finally {
        setLoading(false);
      }
    };
    fetchStockData();
  }, [symbol]);

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Activity className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!stock) return <div className="p-8 text-center text-xl font-bold">Stock Not Found</div>;

  const isPositive = stock.change >= 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <StockHeader 
        stock={stock}
        isWatchlisted={isWatchlisted}
        toggleWatchlist={toggleWatchlist}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Key Metrics */}
        <div className="space-y-4">
          <StockOverview stock={stock} />
        </div>

        {/* Center/Right Column: Chart & Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            {/* Chart Controls */}
            <div className="mb-8 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
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
                  isPositive ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                }`}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
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
                <StockChart data={historicalData} isPositive={isPositive} height={384} chartType={chartType} />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg text-gray-400">
                  No data available for this period.
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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
        </div>
      </div>
    </div>
  );
}