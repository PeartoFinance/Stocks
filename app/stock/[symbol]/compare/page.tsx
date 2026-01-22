"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, Search, TrendingUp, TrendingDown, Activity, Loader2, AreaChart, CandlestickChart, LineChart } from "lucide-react";
import { marketService } from "../../../utils/marketService";
import { Stock, HistoricalData } from "../../../types";
import AIAnalysisPanel from "../../../components/ai/AIAnalysisPanel";
import StockChart from "../../../components/StockChart";
import toast from "react-hot-toast";

interface PageProps {
  params: { symbol: string };
}

export default function StockComparePage({ params }: PageProps) {
  const { symbol } = params;
  const searchParams = useSearchParams();
  const compareSymbol = searchParams.get('compare');
  
  const [primaryStock, setPrimaryStock] = useState<Stock | null>(null);
  const [compareStock, setCompareStock] = useState<Stock | null>(null);
  const [primaryData, setPrimaryData] = useState<HistoricalData[]>([]);
  const [compareData, setCompareData] = useState<HistoricalData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("1M");
  const [chartType, setChartType] = useState<"area" | "candlestick" | "line" | "mountain">("line");
  const [chartLoading, setChartLoading] = useState(false);

  // Load primary stock data
  useEffect(() => {
    const fetchPrimaryStock = async () => {
      try {
        setLoading(true);
        const [stockResponse, historyResponse] = await Promise.all([
          marketService.getStockProfile(symbol),
          marketService.getStockHistory(symbol, "1mo")
        ]);
        
        if (stockResponse) {
          const apiResponse = stockResponse as any;
          const transformedStock: Stock = {
            symbol: apiResponse.symbol,
            name: apiResponse.name,
            price: apiResponse.price,
            change: apiResponse.change,
            changePercent: apiResponse.changePercent,
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
          };
          setPrimaryStock(transformedStock);
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
          setPrimaryData(transformedData);
        }
      } catch (error) {
        toast.error('Failed to load stock data');
        console.error('Stock fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrimaryStock();
  }, [symbol]);

  // Load compare stock if provided in URL
  useEffect(() => {
    if (compareSymbol && compareSymbol !== symbol) {
      fetchCompareStock(compareSymbol);
    }
  }, [compareSymbol, symbol]);

  // Search for stocks
  useEffect(() => {
    if (searchTerm.length > 1) {
      searchStocks();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchStocks = async () => {
    try {
      setSearchLoading(true);
      const results = await marketService.searchStocks(searchTerm, 10);
      const stocks: Stock[] = Array.isArray(results) ? results.map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        price: item.price || 0,
        change: item.change || 0,
        changePercent: item.changePercent || 0,
        marketCap: item.marketCap,
        peRatio: item.peRatio,
        sector: item.sector,
        volume: item.volume,
        eps: item.eps,
        beta: item.beta,
        dividendYield: item.dividendYield,
        week52High: item.high52w,
        week52Low: item.low52w,
      })).filter(stock => stock.symbol !== symbol) : [];
      setSearchResults(stocks);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchCompareStock = async (compareSymbol: string) => {
    try {
      const [stockResponse, historyResponse] = await Promise.all([
        marketService.getStockProfile(compareSymbol),
        marketService.getStockHistory(compareSymbol, chartPeriod === "1M" ? "1mo" : "1d")
      ]);
      
      if (stockResponse) {
        const apiResponse = stockResponse as any;
        const transformedStock: Stock = {
          symbol: apiResponse.symbol,
          name: apiResponse.name,
          price: apiResponse.price,
          change: apiResponse.change,
          changePercent: apiResponse.changePercent,
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
        };
        setCompareStock(transformedStock);
        
        if ((historyResponse as any)?.data) {
          const transformedData: HistoricalData[] = (historyResponse as any).data.map((item: any) => ({
            date: item.date,
            open: item.open || item.close,
            high: item.high || item.close,
            low: item.low || item.close,
            close: item.close,
            volume: item.volume || 0,
          }));
          setCompareData(transformedData);
        }
        
        // Update URL
        const url = new URL(window.location.href);
        url.searchParams.set('compare', compareSymbol);
        window.history.replaceState({}, '', url.toString());
      }
    } catch (error) {
      toast.error('Failed to load comparison stock');
      console.error('Compare stock fetch error:', error);
    }
  };

  const selectCompareStock = (stock: Stock) => {
    setCompareStock(stock);
    setSearchTerm('');
    setSearchResults([]);
    // Load historical data for selected stock
    const loadHistoricalData = async () => {
      try {
        const periodMap: Record<string, string> = {
          "1D": "1d", "5D": "5d", "1M": "1mo", "3M": "3mo", "6M": "6mo", "1Y": "1y"
        };
        const mappedPeriod = periodMap[chartPeriod] || "1mo";
        const historyResponse = await marketService.getStockHistory(stock.symbol, mappedPeriod);
        if ((historyResponse as any)?.data) {
          const transformedData: HistoricalData[] = (historyResponse as any).data.map((item: any) => ({
            date: item.date,
            open: item.open || item.close,
            high: item.high || item.close,
            low: item.low || item.close,
            close: item.close,
            volume: item.volume || 0,
          }));
          setCompareData(transformedData);
        }
      } catch (error) {
        console.error('Error loading compare stock history:', error);
      }
    };
    loadHistoricalData();
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('compare', stock.symbol);
    window.history.replaceState({}, '', url.toString());
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
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  // Chart controls
  const periods = ["1D", "5D", "1M", "3M", "6M", "1Y"];
  const chartTypes = [
    { key: "line", label: "Line", icon: LineChart },
    { key: "area", label: "Area", icon: AreaChart },
    { key: "mountain", label: "Mountain", icon: AreaChart },
    { key: "candlestick", label: "Candle", icon: CandlestickChart },
  ] as const;

  const handlePeriodChange = async (period: string) => {
    setChartPeriod(period);
    setChartLoading(true);
    
    try {
      const periodMap: Record<string, string> = {
        "1D": "1d", "5D": "5d", "1M": "1mo", "3M": "3mo", "6M": "6mo", "1Y": "1y"
      };
      const mappedPeriod = periodMap[period] || "1mo";
      
      const promises = [marketService.getStockHistory(symbol, mappedPeriod)];
      if (compareStock) {
        promises.push(marketService.getStockHistory(compareStock.symbol, mappedPeriod));
      }
      
      const [primaryHistoryResponse, compareHistoryResponse] = await Promise.all(promises);
      
      if ((primaryHistoryResponse as any)?.data) {
        const transformedData: HistoricalData[] = (primaryHistoryResponse as any).data.map((item: any) => ({
          date: item.date,
          open: item.open || item.close,
          high: item.high || item.close,
          low: item.low || item.close,
          close: item.close,
          volume: item.volume || 0,
        }));
        setPrimaryData(transformedData);
      }
      
      if (compareHistoryResponse && (compareHistoryResponse as any)?.data) {
        const transformedData: HistoricalData[] = (compareHistoryResponse as any).data.map((item: any) => ({
          date: item.date,
          open: item.open || item.close,
          high: item.high || item.close,
          low: item.low || item.close,
          close: item.close,
          volume: item.volume || 0,
        }));
        setCompareData(transformedData);
      }
    } catch (error) {
      console.error('Error loading period data:', error);
      toast.error('Failed to load chart data');
    } finally {
      setChartLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="p-4 lg:p-6 space-y-5 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/stock/${symbol}`}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              <span>Back to {symbol}</span>
            </Link>
            <div className="h-6 w-px bg-slate-300"></div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Stock Comparison
            </h1>
          </div>
        </div>

        {/* Stock Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Primary Stock</h3>
              {primaryStock && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {primaryStock.name} ({primaryStock.symbol})
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{primaryStock.sector}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        ${formatNumber(primaryStock.price)}
                      </p>
                      <div className={`flex items-center gap-1 text-sm ${
                        primaryStock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {primaryStock.changePercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span>{primaryStock.changePercent >= 0 ? '+' : ''}{formatNumber(primaryStock.changePercent)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compare Stock Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Compare With</h3>
              
              {!compareStock ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search for a stock to compare..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {searchLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Activity className="h-5 w-5 text-blue-500 animate-spin" />
                    </div>
                  )}
                  
                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {searchResults.map((stock) => (
                        <button
                          key={stock.symbol}
                          onClick={() => selectCompareStock(stock)}
                          className="w-full p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">
                                {stock.name} ({stock.symbol})
                              </h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{stock.sector}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                ${formatNumber(stock.price)}
                              </p>
                              <div className={`text-xs ${
                                stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {stock.changePercent >= 0 ? '+' : ''}{formatNumber(stock.changePercent)}%
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {compareStock.name} ({compareStock.symbol})
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{compareStock.sector}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        ${formatNumber(compareStock.price)}
                      </p>
                      <div className={`flex items-center gap-1 text-sm ${
                        compareStock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {compareStock.changePercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span>{compareStock.changePercent >= 0 ? '+' : ''}{formatNumber(compareStock.changePercent)}%</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCompareStock(null);
                      const url = new URL(window.location.href);
                      url.searchParams.delete('compare');
                      window.history.replaceState({}, '', url.toString());
                    }}
                    className="mt-3 text-sm text-orange-600 hover:text-orange-500"
                  >
                    Change comparison stock
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart Section */}
        {primaryStock && primaryData.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <BarChart3 className="h-6 w-6 text-gray-600" />
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Price Comparison Chart</h2>
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-blue-600 rounded"></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{primaryStock.symbol}</span>
                </div>
                {compareStock && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-orange-600 rounded"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{compareStock.symbol}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chart Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-4 lg:gap-6 mb-6">
              {/* Period Selection */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Period:</span>
                <div className="flex bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 overflow-x-auto">
                  {periods.map((period) => (
                    <button
                      key={period}
                      onClick={() => handlePeriodChange(period)}
                      className={`px-3 lg:px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                        chartPeriod === period
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Type Selection */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chart:</span>
                <div className="flex bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 overflow-x-auto">
                  {chartTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.key}
                        onClick={() => setChartType(type.key)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          chartType === type.key
                            ? "bg-orange-600 text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="hidden lg:inline">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className="h-80 lg:h-96 relative">
              {chartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 z-10">
                  <Activity className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
              ) : null}
              {primaryData.length > 0 ? (
                <StockChart 
                  data={primaryData} 
                  compareData={compareData.length > 0 ? compareData : undefined}
                  isPositive={primaryStock.change >= 0} 
                  height={384} 
                  chartType={chartType}
                  showComparison={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                    <p className="text-lg font-medium">Loading chart data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparison Results */}
        {primaryStock && compareStock && (
          <div className="space-y-6">
            {/* Key Metrics Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Key Metrics Comparison
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Metric</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-blue-600">{primaryStock.symbol}</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-orange-600">{compareStock.symbol}</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { 
                        label: 'Current Price', 
                        primary: `$${formatNumber(primaryStock.price)}`, 
                        compare: `$${formatNumber(compareStock.price)}`,
                        winner: 'N/A'
                      },
                      { 
                        label: 'Market Cap', 
                        primary: formatLargeNumber(primaryStock.marketCap), 
                        compare: formatLargeNumber(compareStock.marketCap),
                        winner: (primaryStock.marketCap || 0) > (compareStock.marketCap || 0) ? primaryStock.symbol : compareStock.symbol
                      },
                      { 
                        label: 'P/E Ratio', 
                        primary: formatNumber(primaryStock.peRatio), 
                        compare: formatNumber(compareStock.peRatio),
                        winner: (primaryStock.peRatio || 999) < (compareStock.peRatio || 999) ? primaryStock.symbol : compareStock.symbol
                      },
                      { 
                        label: 'Volume', 
                        primary: formatLargeNumber(primaryStock.volume), 
                        compare: formatLargeNumber(compareStock.volume),
                        winner: (primaryStock.volume || 0) > (compareStock.volume || 0) ? primaryStock.symbol : compareStock.symbol
                      },
                      { 
                        label: 'Beta', 
                        primary: formatNumber(primaryStock.beta), 
                        compare: formatNumber(compareStock.beta),
                        winner: 'N/A'
                      },
                      { 
                        label: 'Dividend Yield', 
                        primary: primaryStock.dividendYield ? `${(primaryStock.dividendYield * 100).toFixed(2)}%` : '-', 
                        compare: compareStock.dividendYield ? `${(compareStock.dividendYield * 100).toFixed(2)}%` : '-',
                        winner: (primaryStock.dividendYield || 0) > (compareStock.dividendYield || 0) ? primaryStock.symbol : compareStock.symbol
                      },
                      { 
                        label: 'Today\'s Change', 
                        primary: `${primaryStock.changePercent >= 0 ? '+' : ''}${formatNumber(primaryStock.changePercent)}%`, 
                        compare: `${compareStock.changePercent >= 0 ? '+' : ''}${formatNumber(compareStock.changePercent)}%`,
                        winner: primaryStock.changePercent > compareStock.changePercent ? primaryStock.symbol : compareStock.symbol
                      },
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">{row.label}</td>
                        <td className="py-3 px-4 text-sm text-center text-slate-900 dark:text-white">{row.primary}</td>
                        <td className="py-3 px-4 text-sm text-center text-slate-900 dark:text-white">{row.compare}</td>
                        <td className="py-3 px-4 text-sm text-center">
                          {row.winner === 'N/A' ? (
                            <span className="text-slate-400">-</span>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.winner === primaryStock.symbol 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                            }`}>
                              {row.winner}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Comparison Analysis */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <AIAnalysisPanel
                title="AI Comparison Analysis"
                pageType="comparison"
                pageData={{
                  stockCount: 2,
                  activeCategory: 'Comparison',
                  stocks: [
                    {
                      symbol: primaryStock.symbol,
                      name: primaryStock.name,
                      price: primaryStock.price,
                      pe: primaryStock.peRatio,
                      sector: primaryStock.sector,
                      marketCap: primaryStock.marketCap,
                      volume: primaryStock.volume,
                      change: primaryStock.changePercent,
                      beta: primaryStock.beta,
                      dividendYield: primaryStock.dividendYield
                    },
                    {
                      symbol: compareStock.symbol,
                      name: compareStock.name,
                      price: compareStock.price,
                      pe: compareStock.peRatio,
                      sector: compareStock.sector,
                      marketCap: compareStock.marketCap,
                      volume: compareStock.volume,
                      change: compareStock.changePercent,
                      beta: compareStock.beta,
                      dividendYield: compareStock.dividendYield
                    }
                  ]
                }}
                autoAnalyze={true}
                quickPrompts={[
                  "Which is the better investment?",
                  "Risk vs reward analysis",
                  "Value comparison",
                  "Growth potential analysis"
                ]}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {primaryStock && !compareStock && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Select a Stock to Compare
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Search and select another stock to see a detailed comparison with {primaryStock.symbol}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}