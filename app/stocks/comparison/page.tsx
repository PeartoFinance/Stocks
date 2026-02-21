'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Search, Activity, Plus, Download, BarChart3, User, LineChart, FileText, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import { marketService } from '../../utils/marketService';
import { Stock, HistoricalData } from '../../types';
import PriceDisplay from '../../components/common/PriceDisplay';
import OverviewTab from './components/OverviewTab';
import ChartTab from './components/ChartTab';
import StatisticsTab from './components/StatisticsTab';
import ProfileTab from './components/ProfileTab';
import { ComparisonStock } from './components/types';
import AIAnalysisPanel from '../../components/ai/AIAnalysisPanel';

const STOCK_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function StockComparison() {
  const [comparedStocks, setComparedStocks] = useState<ComparisonStock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartPeriod, setChartPeriod] = useState('1Y');
  const [chartType, setChartType] = useState<'line' | 'area' | 'candle'>('line');
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  const periods = ['1D', '5D', '1M', '3M', '6M', '1Y'];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'chart', label: 'Chart', icon: LineChart },
    { key: 'statistics', label: 'Statistics', icon: Activity },
    { key: 'profile', label: 'Profile', icon: User }
  ];

  const formatLargeNumber = (num: number | undefined | null): string => {
    if (num == null) return '-';
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  const searchParams = useSearchParams();
  useEffect(() => {
    const loadStocksFromQuery = async () => {
      const stocksParam = searchParams.get('stocks');
      if (stocksParam) {
        const stockSymbols = stocksParam.split('.').filter(symbol => symbol.trim());
        if (stockSymbols.length > 0 && stockSymbols.length <= 5) {
          try {
            setLoading(true);
            const stockPromises = stockSymbols.map(async (symbol) => {
              const profileResponse = await marketService.getStockProfile(symbol.trim().toUpperCase());
              if (profileResponse) {
                const apiResponse = profileResponse as any;
                return {
                  symbol: apiResponse.symbol || symbol.trim().toUpperCase(),
                  name: apiResponse.name || symbol.trim().toUpperCase(),
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
                  exchange: apiResponse.exchange,
                  currency: apiResponse.currency || 'USD',
                  color: STOCK_COLORS[0],
                };
              }
              return null;
            });

            const validStocks = (await Promise.all(stockPromises)).filter(stock => stock !== null);
            if (validStocks.length > 0) {
              const stocksWithColors = validStocks.map((stock, index) => ({ ...stock, color: STOCK_COLORS[index] }));
              setComparedStocks(stocksWithColors);
              await loadHistoricalData(stocksWithColors, chartPeriod);
              toast.success(`Loaded ${stocksWithColors.length} stocks`);
            }
          } catch (error) {
            toast.error('Failed to load stocks');
          } finally {
            setLoading(false);
          }
        }
      }
    };
    loadStocksFromQuery();
  }, [searchParams]);

  useEffect(() => {
    const searchStocks = async () => {
      if (searchTerm.length >= 2) {
        try {
          setLoading(true);
          const response = await marketService.searchStocks(searchTerm, 10);
          if (Array.isArray(response)) {
            const transformedResults: Stock[] = response.map((item: any) => ({
              symbol: item.symbol,
              name: item.name,
              price: item.price || 0,
              change: item.change || 0,
              changePercent: item.changePercent || 0,
              volume: item.volume,
              marketCap: item.marketCap,
              peRatio: item.peRatio,
              eps: item.eps,
              sector: item.sector,
              industry: item.industry,
              exchange: item.exchange,
              currency: item.currency || 'USD'
            }));
            setSearchResults(transformedResults);
          }
        } catch (error) {
          toast.error('Failed to search stocks');
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };
    const debounceTimer = setTimeout(searchStocks, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const loadHistoricalData = async (stocks: ComparisonStock[], period: string) => {
    if (stocks.length === 0) return;
    try {
      setChartLoading(true);
      const periodMap: Record<string, string> = { '1D': '1d', '5D': '5d', '1M': '1mo', '3M': '3mo', '6M': '6mo', '1Y': '1y' };
      const mappedPeriod = periodMap[period] || '1mo';
      const interval = period === '1D' ? '1m' : '1d';

      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const historyResponse = await marketService.getStockHistory(stock.symbol, mappedPeriod, interval);
            if ((historyResponse as any)?.data && Array.isArray((historyResponse as any).data)) {
              const transformedData: HistoricalData[] = (historyResponse as any).data
                .map((item: any) => ({
                  date: item.date,
                  open: item.open || item.close || 0,
                  high: item.high || item.close || 0,
                  low: item.low || item.close || 0,
                  close: item.close || 0,
                  volume: item.volume || 0,
                }))
                .sort((a: HistoricalData, b: HistoricalData) => new Date(a.date).getTime() - new Date(b.date).getTime());
              return { ...stock, historicalData: transformedData };
            }
            return stock;
          } catch (error) {
            return stock;
          }
        })
      );
      setComparedStocks(updatedStocks);
    } catch (error) {
      toast.error('Failed to load historical data');
    } finally {
      setChartLoading(false);
    }
  };

  const addToComparison = async (stock: Stock) => {
    if (comparedStocks.length >= 5) {
      toast.error('Maximum 5 stocks');
      return;
    }
    if (comparedStocks.find(s => s.symbol === stock.symbol)) {
      toast.error('Stock already added');
      return;
    }
    try {
      setLoading(true);
      const profileResponse = await marketService.getStockProfile(stock.symbol);
      if (profileResponse) {
        const apiResponse = profileResponse as any;
        const fullStock: ComparisonStock = {
          symbol: apiResponse.symbol || stock.symbol,
          name: apiResponse.name || stock.name,
          price: apiResponse.price || stock.price,
          change: apiResponse.change || stock.change,
          changePercent: apiResponse.changePercent || stock.changePercent,
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
          exchange: apiResponse.exchange,
          currency: apiResponse.currency,
          color: STOCK_COLORS[comparedStocks.length],
        };
        const newStocks = [...comparedStocks, fullStock];
        setComparedStocks(newStocks);
        await loadHistoricalData(newStocks, chartPeriod);
        setSearchTerm('');
        setSearchResults([]);
        toast.success(`${stock.symbol} added`);
      }
    } catch (error) {
      toast.error('Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  const removeFromComparison = (symbol: string) => {
    const newStocks = comparedStocks.filter(s => s.symbol !== symbol);
    const updatedStocks = newStocks.map((stock, index) => ({ ...stock, color: STOCK_COLORS[index] }));
    setComparedStocks(updatedStocks);
    toast.success(`${symbol} removed`);
  };

  const handlePeriodChange = (period: string) => {
    setChartPeriod(period);
    setChartLoading(true);
    loadHistoricalData(comparedStocks, period);
  };

  const enterFullscreen = () => {
    const chartContainer = document.getElementById('chart-container');
    if (chartContainer?.requestFullscreen) chartContainer.requestFullscreen();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/95">
      <main className="p-4 lg:p-6">
        <div className="max-w-[1600px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-medium text-slate-900 dark:text-white mb-1">Stock Comparison</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Compare up to 5 stocks side by side</p>
              </div>
              <button
                onClick={() => setIsAIPanelOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-emerald-700 transition-colors"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">AI Analysis</span>
              </button>
            </div>
          </motion.div>

          {/* Search Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-slate-900 dark:text-white">Add Stocks</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">{comparedStocks.length}/5</span>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500"
              />
              {loading && <Activity className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 dark:text-emerald-500 animate-spin" />}
            </div>

            {searchResults.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white">{stock.symbol}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{stock.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <PriceDisplay amount={stock.price} className="text-sm font-medium" />
                        <p className={`text-xs font-medium ${stock.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      <button onClick={() => addToComparison(stock)} disabled={loading} className="px-3 py-1 bg-blue-600 dark:bg-emerald-600 text-white text-xs rounded-md hover:bg-blue-700 dark:hover:bg-emerald-700 disabled:opacity-50">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchTerm === '' && comparedStocks.length < 5 && (
              <div>
                <h4 className="text-xs font-medium text-slate-700 dark:text-slate-400 mb-2">Popular Stocks</h4>
                <div className="flex flex-wrap gap-2">
                  {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'].map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setSearchTerm(symbol)}
                      disabled={comparedStocks.some(s => s.symbol === symbol)}
                      className="px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-700 dark:text-white rounded-md"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Tabs */}
          {comparedStocks.length > 0 && (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 mb-6">
                <div className="flex gap-1 overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                          isActive
                            ? 'bg-blue-600 dark:bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                {activeTab === 'overview' && <OverviewTab comparedStocks={comparedStocks} formatLargeNumber={formatLargeNumber} />}
                {activeTab === 'chart' && (
                  <ChartTab
                    comparedStocks={comparedStocks}
                    chartPeriod={chartPeriod}
                    chartType={chartType}
                    chartLoading={chartLoading}
                    periods={periods}
                    onPeriodChange={handlePeriodChange}
                    onChartTypeChange={setChartType}
                    onRemoveStock={removeFromComparison}
                    onFullscreen={enterFullscreen}
                  />
                )}
                {activeTab === 'statistics' && <StatisticsTab comparedStocks={comparedStocks} formatLargeNumber={formatLargeNumber} />}
                {activeTab === 'profile' && <ProfileTab comparedStocks={comparedStocks} formatLargeNumber={formatLargeNumber} />}
              </motion.div>
            </>
          )}
        </div>
      </main>

      {/* AI Analysis Panel */}
      {isAIPanelOpen && (
        <>
          <div className={`fixed bottom-0 md:top-0 md:right-0 left-0 md:left-auto h-[85vh] md:h-full w-full md:w-96 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 rounded-t-2xl md:rounded-none ${
            isAIPanelOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'
          }`}>
            <div className="h-full flex flex-col">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/95">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600 dark:text-emerald-500" />
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">AI Analysis</h3>
                  </div>
                  <button
                    onClick={() => setIsAIPanelOpen(false)}
                    className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AIAnalysisPanel
                  title=""
                  pageType="comparison"
                  pageData={{
                    stocks: comparedStocks.map(s => ({ symbol: s.symbol, name: s.name, price: s.price })),
                    count: comparedStocks.length
                  }}
                  quickPrompts={[
                    "Compare all stocks",
                    "Best performer",
                    "Risk analysis",
                    "Investment recommendation",
                    "Sector comparison"
                  ]}
                  compact={false}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40" onClick={() => setIsAIPanelOpen(false)} />
        </>
      )}
    </div>
  );
}
