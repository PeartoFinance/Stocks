"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  X,
  ArrowLeft,
  BarChart3,
  AreaChart,
  CandlestickChart,
  LineChart,
} from "lucide-react";
import { stockAPI } from "../../../utils/api";
import { Stock, HistoricalData } from "../../../types";
import toast from "react-hot-toast";
import { createChart, ColorType, LineSeries, AreaSeries, CandlestickSeries, IChartApi } from 'lightweight-charts';

interface PageProps {
  params: { symbol: string };
}

export default function StockComparePage({ params }: PageProps) {
  const { symbol } = params;
  const [primaryStock, setPrimaryStock] = useState<Stock | null>(null);
  const [compareStock, setCompareStock] = useState<Stock | null>(null);
  const [primaryData, setPrimaryData] = useState<HistoricalData[]>([]);
  const [compareData, setCompareData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [searching, setSearching] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("1M");
  const [chartType, setChartType] = useState<"area" | "candlestick" | "line" | "mountain">("line");
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstanceRef = React.useRef<IChartApi | null>(null);

  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Load primary stock (from URL)
        const [primaryResponse, primaryHistoryResponse] = await Promise.all([
          stockAPI.getStockQuote(symbol),
          stockAPI.getHistoricalData(symbol, "1mo"),
        ]);

        if (primaryResponse.data) {
          setPrimaryStock(primaryResponse.data);
        }
        if (primaryHistoryResponse.data) {
          setPrimaryData(primaryHistoryResponse.data);
        }

        // Load default comparison stock (AAPL)
        if (symbol.toUpperCase() !== "AAPL") {
          const [compareResponse, compareHistoryResponse] = await Promise.all([
            stockAPI.getStockQuote("AAPL"),
            stockAPI.getHistoricalData("AAPL", "1mo"),
          ]);

          if (compareResponse.data) {
            setCompareStock(compareResponse.data);
          }
          if (compareHistoryResponse.data) {
            setCompareData(compareHistoryResponse.data);
          }
        }
      } catch (error) {
        console.error("Error fetching comparison data:", error);
        toast.error("Failed to load comparison data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [symbol]);

  // Chart rendering effect
  useEffect(() => {
    if (!chartRef.current || primaryData.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
    }

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6b7280',
        attributionLogo: false,
      },
      width: chartRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: { color: 'rgba(243, 244, 246, 0.3)' },
        horzLines: { color: 'rgba(243, 244, 246, 0.3)' },
      },
      timeScale: {
        borderColor: '#e5e7eb',
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });

    chartInstanceRef.current = chart;

    if (chartType === 'candlestick') {
      // Primary stock candlestick
      const primarySeries = chart.addSeries(CandlestickSeries, {
        upColor: '#2563eb',
        downColor: '#1d4ed8',
        borderVisible: false,
        wickUpColor: '#2563eb',
        wickDownColor: '#1d4ed8',
      });
      
      primarySeries.setData(primaryData.map(item => ({
        time: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      })));

      // Compare stock candlestick (if available)
      if (compareStock && compareData.length > 0) {
        const compareSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#ea580c',
          downColor: '#c2410c',
          borderVisible: false,
          wickUpColor: '#ea580c',
          wickDownColor: '#c2410c',
        });
        
        compareSeries.setData(compareData.map(item => ({
          time: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        })));
      }
    } else if (chartType === 'area' || chartType === 'mountain') {
      // Primary stock area/mountain
      const primarySeries = chart.addSeries(AreaSeries, {
        lineColor: '#2563eb',
        topColor: chartType === 'mountain' ? 'rgba(37, 99, 235, 0.6)' : 'rgba(37, 99, 235, 0.4)',
        bottomColor: chartType === 'mountain' ? 'rgba(37, 99, 235, 0)' : 'rgba(37, 99, 235, 0.05)',
        lineWidth: chartType === 'mountain' ? 3 : 2,
      });
      
      primarySeries.setData(primaryData.map(item => ({ 
        time: item.date, 
        value: item.close 
      })));

      // Compare stock area/mountain
      if (compareStock && compareData.length > 0) {
        const compareSeries = chart.addSeries(AreaSeries, {
          lineColor: '#ea580c',
          topColor: chartType === 'mountain' ? 'rgba(234, 88, 12, 0.6)' : 'rgba(234, 88, 12, 0.4)',
          bottomColor: chartType === 'mountain' ? 'rgba(234, 88, 12, 0)' : 'rgba(234, 88, 12, 0.05)',
          lineWidth: chartType === 'mountain' ? 3 : 2,
        });
        
        compareSeries.setData(compareData.map(item => ({ 
          time: item.date, 
          value: item.close 
        })));
      }
    } else {
      // Line chart (default)
      const primarySeries = chart.addSeries(LineSeries, {
        color: '#2563eb',
        lineWidth: 3,
        title: primaryStock?.symbol || '',
      });
      
      primarySeries.setData(primaryData.map(item => ({ 
        time: item.date, 
        value: item.close 
      })));

      // Compare stock line
      if (compareStock && compareData.length > 0) {
        const compareSeries = chart.addSeries(LineSeries, {
          color: '#ea580c',
          lineWidth: 3,
          title: compareStock.symbol,
        });
        
        compareSeries.setData(compareData.map(item => ({ 
          time: item.date, 
          value: item.close 
        })));
      }
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({ width: chartRef.current.clientWidth });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [primaryData, compareData, primaryStock, compareStock, chartType]);

  const searchStocks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await stockAPI.getAllStocks();
      const filtered = response.data.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching stocks:", error);
    } finally {
      setSearching(false);
    }
  };

  const selectCompareStock = async (stock: Stock) => {
    try {
      setCompareStock(stock);
      setSearchQuery("");
      setSearchResults([]);
      
      // Load historical data for the selected stock
      const periodMap: Record<string, string> = {
        "1D": "1d",
        "5D": "5d", 
        "1M": "1mo",
        "3M": "3mo",
        "6M": "6mo",
        "1Y": "1y",
      };
      
      const mappedPeriod = periodMap[chartPeriod] || "1mo";
      const historyResponse = await stockAPI.getHistoricalData(stock.symbol, mappedPeriod);
      if (historyResponse.data) {
        setCompareData(historyResponse.data);
      }
      
      toast.success(`Now comparing with ${stock.symbol}`);
    } catch (error) {
      console.error("Error loading compare stock data:", error);
      toast.error("Failed to load comparison stock data");
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number, percent: number) =>
    `${change >= 0 ? "+" : ""}${change.toFixed(2)} (${
      percent >= 0 ? "+" : ""
    }${percent.toFixed(2)}%)`;

  const periods = ["1D", "5D", "1M", "3M", "6M", "1Y"];
  const chartTypes = [
    { key: "line", label: "Line", icon: LineChart },
    { key: "area", label: "Area", icon: AreaChart },
    { key: "mountain", label: "Mountain", icon: AreaChart },
    { key: "candlestick", label: "Candle", icon: CandlestickChart },
  ] as const;

  const handlePeriodChange = async (period: string) => {
    setChartPeriod(period);
    
    try {
      const periodMap: Record<string, string> = {
        "1D": "1d",
        "5D": "5d", 
        "1M": "1mo",
        "3M": "3mo",
        "6M": "6mo",
        "1Y": "1y",
      };
      
      const mappedPeriod = periodMap[period] || "1mo";
      
      const [primaryHistoryResponse, compareHistoryResponse] = await Promise.all([
        stockAPI.getHistoricalData(symbol, mappedPeriod),
        compareStock ? stockAPI.getHistoricalData(compareStock.symbol, mappedPeriod) : Promise.resolve({ data: [] }),
      ]);

      if (primaryHistoryResponse.data) {
        setPrimaryData(primaryHistoryResponse.data);
      }
      if (compareHistoryResponse.data) {
        setCompareData(compareHistoryResponse.data);
      }
    } catch (error) {
      console.error("Error loading period data:", error);
      toast.error("Failed to load chart data");
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Comparison</h1>
            <p className="text-gray-600">Compare stock performance side by side</p>
          </div>
        </div>

        {/* Stock Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Primary Stock Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Primary Stock</span>
            </div>
            {primaryStock && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {primaryStock.name}
                </h3>
                <div className="text-lg font-medium text-gray-600 mb-3">{primaryStock.symbol}</div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(primaryStock.price)}</span>
                  <span
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      primaryStock.change >= 0 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {primaryStock.change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {formatChange(primaryStock.change, primaryStock.changePercent)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Compare Stock Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Compare With</span>
              </div>
              {compareStock && (
                <button
                  onClick={() => setCompareStock(null)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
            
            {compareStock ? (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {compareStock.name}
                </h3>
                <div className="text-lg font-medium text-gray-600 mb-3">{compareStock.symbol}</div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(compareStock.price)}</span>
                  <span
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      compareStock.change >= 0 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {compareStock.change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {formatChange(compareStock.change, compareStock.changePercent)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search stocks to compare (e.g., TSLA, MSFT)..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchStocks(e.target.value);
                    }}
                    className="flex-1 outline-none text-gray-700 placeholder-gray-500"
                  />
                  {searching && <Activity className="h-5 w-5 text-blue-600 animate-spin" />}
                </div>
                
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    {searchResults.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => selectCompareStock(stock)}
                        className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-gray-900">{stock.symbol}</div>
                            <div className="text-sm text-gray-600 truncate">{stock.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatPrice(stock.price)}</div>
                            <div className={`text-sm ${
                              stock.change >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Period and Chart Type Selection */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
          {/* Period Selection */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">Period:</span>
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    chartPeriod === period
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Type Selection */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">Chart:</span>
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
              {chartTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.key}
                    onClick={() => setChartType(type.key)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      chartType === type.key
                        ? "bg-orange-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BarChart3 className="h-6 w-6 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">Price Comparison Chart</h2>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-6">
            {primaryStock && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-600 rounded"></div>
                <span className="text-sm font-medium text-gray-700">{primaryStock.symbol}</span>
              </div>
            )}
            {compareStock && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-orange-600 rounded"></div>
                <span className="text-sm font-medium text-gray-700">{compareStock.symbol}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="h-96 w-full">
          {primaryData.length > 0 ? (
            <div ref={chartRef} className="w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium text-gray-700">Loading chart data...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Metrics */}
      {primaryStock && compareStock && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Key Metrics Comparison */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Key Metrics</h3>
            
            <div className="space-y-4">
              {[
                { label: "Market Cap", primary: primaryStock.marketCap ? `$${(primaryStock.marketCap / 1e12).toFixed(2)}T` : "N/A", compare: compareStock.marketCap ? `$${(compareStock.marketCap / 1e12).toFixed(2)}T` : "N/A" },
                { label: "P/E Ratio", primary: primaryStock.peRatio ? primaryStock.peRatio.toFixed(2) : "N/A", compare: compareStock.peRatio ? compareStock.peRatio.toFixed(2) : "N/A" },
                { label: "Volume", primary: primaryStock.volume ? (primaryStock.volume / 1e6).toFixed(1) + "M" : "N/A", compare: compareStock.volume ? (compareStock.volume / 1e6).toFixed(1) + "M" : "N/A" },
                { label: "Beta", primary: primaryStock.beta ? primaryStock.beta.toFixed(2) : "N/A", compare: compareStock.beta ? compareStock.beta.toFixed(2) : "N/A" },
                { label: "Dividend Yield", primary: primaryStock.dividendYield ? `${primaryStock.dividendYield.toFixed(2)}%` : "N/A", compare: compareStock.dividendYield ? `${compareStock.dividendYield.toFixed(2)}%` : "N/A" },
              ].map((metric, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="text-sm font-medium text-gray-600 mb-3">{metric.label}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span className="font-semibold text-gray-900">{metric.primary}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                      <span className="font-semibold text-gray-900">{metric.compare}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Better Performer Today</span>
                <span className={`font-bold ${
                  primaryStock.changePercent > compareStock.changePercent 
                    ? "text-blue-600" 
                    : "text-orange-600"
                }`}>
                  {primaryStock.changePercent > compareStock.changePercent 
                    ? primaryStock.symbol 
                    : compareStock.symbol}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Higher Volume</span>
                <span className={`font-bold ${
                  (primaryStock.volume || 0) > (compareStock.volume || 0)
                    ? "text-blue-600" 
                    : "text-orange-600"
                }`}>
                  {(primaryStock.volume || 0) > (compareStock.volume || 0)
                    ? primaryStock.symbol 
                    : compareStock.symbol}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Lower P/E Ratio</span>
                <span className={`font-bold ${
                  (primaryStock.peRatio || 999) < (compareStock.peRatio || 999)
                    ? "text-blue-600" 
                    : "text-orange-600"
                }`}>
                  {(primaryStock.peRatio || 999) < (compareStock.peRatio || 999)
                    ? primaryStock.symbol 
                    : compareStock.symbol}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Larger Market Cap</span>
                <span className={`font-bold ${
                  (primaryStock.marketCap || 0) > (compareStock.marketCap || 0)
                    ? "text-blue-600" 
                    : "text-orange-600"
                }`}>
                  {(primaryStock.marketCap || 0) > (compareStock.marketCap || 0)
                    ? primaryStock.symbol 
                    : compareStock.symbol}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}