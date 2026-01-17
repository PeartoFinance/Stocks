"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Plus,
  BarChart3,
  AreaChart,
  CandlestickChart,
  LineChart,
} from "lucide-react";
import { stockAPI } from "../../utils/api";
import { Stock, HistoricalData } from "../../types";
import toast from "react-hot-toast";
import StockChart from "../../components/StockChart";

interface PageProps {
  params: { symbol: string };
}

export default function StockDetailPage({ params }: PageProps) {
  const { symbol } = params;
  const [stock, setStock] = useState<Stock | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [chartPeriod, setChartPeriod] = useState("1 Day");
  const [chartType, setChartType] = useState<
    "area" | "candlestick" | "line" | "mountain"
  >("area");
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);

  const loadChartData = async (period: string) => {
    try {
      setChartLoading(true);
      const periodMap: Record<string, string> = {
        "1D": "1d",
        "5D": "5d",
        "1M": "1mo",
        YTD: "1y",
        "1Y": "1y",
        "5Y": "5y",
        Max: "5y",
      };
      const mappedPeriod = periodMap[period] || "1d";
      const historyResponse = await stockAPI.getHistoricalData(
        symbol,
        mappedPeriod
      );
      if (historyResponse.data) {
        setHistoricalData(historyResponse.data);
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

  useEffect(() => {
    const fetchStockData = async () => {
      if (!symbol) return;

      try {
        setLoading(true);
        const [stockResponse, historyResponse] = await Promise.all([
          stockAPI.getStockQuote(symbol),
          stockAPI.getHistoricalData(symbol, "1d"),
        ]);

        if (stockResponse.data) {
          setStock(stockResponse.data);
        }
        if (historyResponse.data) {
          setHistoricalData(historyResponse.data);
        }

        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        setIsWatchlisted(
          watchlist.some((item: Stock) => item.symbol === symbol)
        );
      } catch (error) {
        console.error("Error fetching stock data:", error);
        toast.error("Failed to load stock information");
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  const toggleWatchlist = () => {
    if (!stock) return;
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    if (isWatchlisted) {
      const newWatchlist = watchlist.filter(
        (item: Stock) => item.symbol !== stock.symbol
      );
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

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="flex items-center justify-center h-96">
          <Activity className="h-12 w-12 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Stock Not Found
          </h2>
          <p className="text-gray-600">Symbol: {symbol}</p>
        </div>
      </div>
    );
  }

  const isPositive = stock.change >= 0;
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number, percent: number) =>
    `${change >= 0 ? "+" : ""}${change.toFixed(2)} (${
      percent >= 0 ? "+" : ""
    }${percent.toFixed(2)}%)`;

  const tabs = [
    "Overview",
    "Financials",
    "Forecast",
    "Statistics",
    "Metrics",
    "Dividends",
    "History",
    "Profile",
    "Chart",
  ];
  const periods = ["1D", "5D", "1M", "YTD", "1Y", "5Y", "Max"];
  const chartTypes = [
    { key: "area", label: "Area", icon: AreaChart },
    { key: "candlestick", label: "Candle", icon: CandlestickChart },
    { key: "line", label: "Line", icon: LineChart },
    { key: "mountain", label: "Mountain", icon: AreaChart },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {stock.name} ({stock.symbol})
            </h1>
            <p className="text-gray-600">
              NASDAQ: {stock.symbol} · Real-Time Price · USD
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleWatchlist}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isWatchlisted
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
            >
              <Plus className="h-4 w-4" />
              {isWatchlisted ? "Watchlist" : "Watchlist"}
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Compare
            </button>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-gray-900">
              {formatPrice(stock.price)}
            </span>
            <div
              className={`flex items-center gap-1 ${
                isPositive ? "text-red-600" : "text-green-600"
              }`}
            >
              {isPositive ? (
                <TrendingDown className="h-5 w-5" />
              ) : (
                <TrendingUp className="h-5 w-5" />
              )}
              <span className="font-medium">
                {formatChange(stock.change, stock.changePercent)}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <div>At close: Jan 16, 2026, 4:00 PM EST</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={isPositive ? "text-red-600" : "text-green-600"}>
                {formatPrice(stock.price + 0.28)} {formatChange(0.28, 0.11)}
              </span>
              <span>After-hours: Jan 16, 2026, 7:59 PM EST</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Key Metrics */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Market Statistics
              </h3>
            </div>

            <div className="p-4">
              {/* 2-column grid for the data list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 text-sm">
                {/* Market Cap */}
                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Market Cap
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {stock.marketCap
                      ? `$${(stock.marketCap / 1e12).toFixed(2)}T`
                      : "N/A"}
                  </span>
                </div>

                {/* Volume */}
                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Volume
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {stock.volume ? stock.volume.toLocaleString() : "N/A"}
                  </span>
                </div>

                {/* Revenue */}
                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Revenue (ttm)
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    416.16B
                  </span>
                </div>

                {/* Open */}
                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Open
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatPrice(stock.price * 1.01)}
                  </span>
                </div>

                {/* Net Income */}
                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Net Income (ttm)
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    112.01B
                  </span>
                </div>

                {/* Previous Close */}
                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Previous Close
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatPrice(stock.price + stock.change)}
                  </span>
                </div>

                {/* Shares Out */}
                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Shares Out
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    14.70B
                  </span>
                </div>

                {/* Day's Range */}
                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Day's Range
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatPrice(stock.price * 0.99)} -{" "}
                    {formatPrice(stock.price * 1.01)}
                  </span>
                </div>

                {/* EPS */}
                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    EPS (ttm)
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {stock.eps ? stock.eps.toFixed(2) : "7.46"}
                  </span>
                </div>

                {/* 52-Week Range */}
                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    52-Week Range
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                    {stock.low52Week ? formatPrice(stock.low52Week) : "169.21"}{" "}
                    -{" "}
                    {stock.high52Week
                      ? formatPrice(stock.high52Week)
                      : "288.62"}
                  </span>
                </div>

                {/* PE Ratio */}
                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    PE Ratio
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {stock.peRatio ? stock.peRatio.toFixed(2) : "34.25"}
                  </span>
                </div>

                {/* Beta */}
                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Beta
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {stock.beta ? stock.beta.toFixed(2) : "1.09"}
                  </span>
                </div>

                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Forward PE
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    30.97
                  </span>
                </div>

                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Analysts
                  </span>
                  <span className="font-bold text-emerald-600">Buy</span>
                </div>

                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Dividend
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {stock.dividendYield
                      ? `$${((stock.dividendYield * stock.price) / 100).toFixed(
                          2
                        )} (${stock.dividendYield.toFixed(2)}%)`
                      : "$1.04 (0.41%)"}
                  </span>
                </div>

                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Price Target
                  </span>
                  <span className="font-bold text-emerald-600">
                    292.22 (+14.36%)
                  </span>
                </div>

                <div className="flex justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50 md:border-b-0">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Ex-Dividend
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Nov 10, 2025
                  </span>
                </div>

                <div className="flex justify-between py-2.5 md:border-b-0">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Earnings Date
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Jan 29, 2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            {/* Professional Chart Controls Header */}
            <div className="mb-8 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              {/* First Row - Duration Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">
                    Duration
                  </span>
                  <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200 overflow-x-auto">
                    {periods.map((period) => (
                      <button
                        key={period}
                        onClick={() => handlePeriodChange(period)}
                        disabled={chartLoading}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 disabled:opacity-50 whitespace-nowrap ${
                          chartPeriod === period
                            ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                        }`}
                      >
                        {chartLoading && chartPeriod === period ? (
                          <Activity className="h-4 w-4 animate-spin" />
                        ) : (
                          period
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Change Indicator */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                    isPositive
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}
                >
                  {isPositive ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  <span>{formatChange(stock.change, stock.changePercent)}</span>
                  <span className="text-xs opacity-75 font-normal">
                    (Today)
                  </span>
                </div>
              </div>

              {/* Second Row - Chart Type Controls */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">
                  Chart Type
                </span>
                <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200 overflow-x-auto">
                  {chartTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.key}
                        onClick={() => setChartType(type.key)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                          chartType === type.key
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="h-96 relative">
                {historicalData.length > 0 ? (
                  <StockChart
                    data={historicalData}
                    isPositive={!isPositive}
                    height={384}
                    chartType={chartType}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <div className="text-center text-gray-500">
                      {chartLoading ? (
                        <>
                          <Activity className="h-12 w-12 mx-auto mb-3 text-blue-500 animate-spin" />
                          <p className="text-lg font-medium text-gray-700">
                            Loading chart data...
                          </p>
                          <p className="text-sm text-gray-500">
                            Fetching {chartPeriod.toLowerCase()} data
                          </p>
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-lg font-medium text-gray-700">
                            No chart data available
                          </p>
                          <p className="text-sm text-gray-500">
                            Try selecting a different time period
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chart Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">
                    Today's High
                  </span>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xl font-bold text-blue-900">
                  {formatPrice(stock.price * 1.02)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-700">
                    Today's Low
                  </span>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-xl font-bold text-red-900">
                  {formatPrice(stock.price * 0.98)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">
                    Volume
                  </span>
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-xl font-bold text-purple-900">
                  {stock.volume
                    ? (stock.volume / 1000000).toFixed(1) + "M"
                    : "N/A"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700">
                    Avg Volume
                  </span>
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-xl font-bold text-green-900">
                  {stock.volume
                    ? ((stock.volume * 0.8) / 1000000).toFixed(1) + "M"
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
