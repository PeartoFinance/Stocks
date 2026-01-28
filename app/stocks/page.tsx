'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, Eye, TrendingUp, TrendingDown,
  ArrowUpDown, Star, RefreshCw, X
} from 'lucide-react';
import { stockAPI } from '../utils/api';
import Link from 'next/link';
import AIAnalysisPanel from '../components/ai/AIAnalysisPanel';

interface StockData {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  pe: number;
  dividend: number;
  sector: string;
  exchange: string;
}

export default function StockScreener() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'marketCap', direction: 'desc' });
  const [filters, setFilters] = useState({
    sector: 'all',
    exchange: 'all',
    minPrice: '',
    maxPrice: '',
    minVolume: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Fetch real stock data
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setIsLoading(true);
        const response = await stockAPI.getAllStocks();

        if (response.success && response.data) {
          const stockData: StockData[] = response.data.map((stock: any) => ({
            symbol: stock.symbol || '',
            company: stock.name || '',
            price: stock.price || 0,
            change: stock.change || 0,
            changePercent: stock.changePercent || 0,
            volume: stock.volume || 0,
            marketCap: formatMarketCap(stock.marketCap),
            pe: stock.peRatio || 0,
            dividend: stock.dividendYield || 0,
            sector: stock.sector || 'Unknown',
            exchange: stock.exchange || 'NYSE'
          }));
          setStocks(stockData);
          setFilteredStocks(stockData);
        }
      } catch (error) {
        console.error('[StockScreener] Error fetching stocks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStocks();
  }, []);

  function formatMarketCap(value: number | undefined): string {
    if (!value) return '—';
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    return value.toLocaleString();
  }

  // Helper for sorting market caps correctly
  const parseMarketCapToNumber = (val: string): number => {
    if (val === '—') return 0;
    const num = parseFloat(val.replace(/[^0-9.]/g, ''));
    if (val.includes('T')) return num * 1e12;
    if (val.includes('B')) return num * 1e9;
    if (val.includes('M')) return num * 1e6;
    return num;
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = stocks.filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSector = filters.sector === 'all' || stock.sector === filters.sector;
      const matchesExchange = filters.exchange === 'all' || stock.exchange === filters.exchange;

      const matchesMinPrice = !filters.minPrice || stock.price >= parseFloat(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || stock.price <= parseFloat(filters.maxPrice);
      const matchesMinVolume = !filters.minVolume || stock.volume >= parseInt(filters.minVolume);

      return matchesSearch && matchesSector && matchesExchange && matchesMinPrice && matchesMaxPrice && matchesMinVolume;
    });

    // Sort the filtered results
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof StockData];
        let bValue: any = b[sortConfig.key as keyof StockData];

        if (sortConfig.key === 'marketCap') {
          aValue = parseMarketCapToNumber(String(aValue));
          bValue = parseMarketCapToNumber(String(bValue));
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredStocks(filtered);
  }, [stocks, searchTerm, filters, sortConfig]);

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const clearFilters = () => {
    setFilters({ sector: 'all', exchange: 'all', minPrice: '', maxPrice: '', minVolume: '' });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.sector !== 'all' || filters.exchange !== 'all' || 
    filters.minPrice || filters.maxPrice || filters.minVolume || searchTerm;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Stock Screener</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Screen stocks based on your criteria</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="lg:hidden flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm flex-1 sm:flex-none text-sm"
            >
              <Star className="h-4 w-4" />
              <span>AI Insights</span>
            </button>

            <button className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">Export</span>
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by symbol or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${
                  showFilters || hasActiveFilters
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {[filters.sector !== 'all', filters.exchange !== 'all', filters.minPrice, filters.maxPrice, filters.minVolume].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* AI Analysis Panel - Desktop */}
          <div className="hidden lg:block mb-4 sm:mb-6">
            <AIAnalysisPanel
              title="AI Screener Insights"
              pageType="stock-screener"
              pageData={{
                count: filteredStocks.length,
                filters: {
                  sector: filters.sector !== 'all' ? filters.sector : null,
                  exchange: filters.exchange !== 'all' ? filters.exchange : null,
                  priceRange: filters.minPrice || filters.maxPrice ? `$${filters.minPrice || '0'} - $${filters.maxPrice || '∞'}` : null
                },
                topStocks: filteredStocks.slice(0, 5).map(s => ({
                  symbol: s.symbol, price: s.price, change: s.changePercent
                }))
              }}
              autoAnalyze={!isLoading && filteredStocks.length > 0}
              quickPrompts={['Best value stocks here', 'High dividend picks', 'Growth opportunities']}
              maxHeight="400px"
            />
          </div>

          {/* Collapsible Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Advanced Filters</h3>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                      <X className="h-4 w-4" /> Clear All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Sector</label>
                    <select
                      value={filters.sector}
                      onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white"
                    >
                      <option value="all">All Sectors</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Financial Services">Financial Services</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Exchange</label>
                    <select
                      value={filters.exchange}
                      onChange={(e) => setFilters({ ...filters, exchange: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white"
                    >
                      <option value="all">All Exchanges</option>
                      <option value="NASDAQ">NASDAQ</option>
                      <option value="NYSE">NYSE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Min Price</label>
                    <input
                      type="number"
                      placeholder="$0"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Max Price</label>
                    <input
                      type="number"
                      placeholder="$∞"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {isLoading ? 'Loading...' : `${filteredStocks.length} Stock${filteredStocks.length !== 1 ? 's' : ''} Found`}
              </h3>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 sm:py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredStocks.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <p className="text-gray-500">No stocks found matching your criteria.</p>
                <button onClick={clearFilters} className="mt-4 text-blue-600 font-medium text-sm">Clear all filters</button>
              </div>
            ) : (
              <>
                {/* Mobile View */}
                <div className="block lg:hidden divide-y divide-gray-200">
                  {filteredStocks.map((stock, index) => (
                    <motion.div key={stock.symbol} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
                      <Link href={`/stock/${stock.symbol.toLowerCase()}`}>
                        <div className="flex justify-between mb-2">
                          <span className="font-bold">{stock.symbol}</span>
                          <span className="font-bold">${stock.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 truncate max-w-[150px]">{stock.company}</span>
                          <span className={stock.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        {['Price', 'Change', 'Volume', 'MarketCap', 'PE'].map((key) => (
                          <th key={key} onClick={() => handleSort(key === 'MarketCap' ? 'marketCap' : key.toLowerCase())} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                            <div className="flex items-center gap-1">{key} <ArrowUpDown className="h-3 w-3" /></div>
                          </th>
                        ))}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStocks.map((stock) => (
                        <tr key={stock.symbol} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/stock/${stock.symbol.toLowerCase()}`}>
                              <div className="text-sm font-semibold text-gray-900">{stock.symbol}</div>
                              <div className="text-sm text-gray-500 truncate max-w-[150px]">{stock.company}</div>
                            </Link>
                          </td>
                          <td className="px-6 py-4">${stock.price.toFixed(2)}</td>
                          <td className={`px-6 py-4 font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.changePercent.toFixed(2)}%
                          </td>
                          <td className="px-6 py-4">{formatNumber(stock.volume)}</td>
                          <td className="px-6 py-4">{stock.marketCap}</td>
                          <td className="px-6 py-4">{stock.pe.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">{stock.sector}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile AI Panel */}
      <AnimatePresence>
        {showAIPanel && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowAIPanel(false)}>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex justify-between">
                <h3 className="font-semibold">AI Insights</h3>
                <button onClick={() => setShowAIPanel(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(85vh - 60px)' }}>
                <AIAnalysisPanel
                  title=""
                  pageType="stock-screener"
                  pageData={{ count: filteredStocks.length, topStocks: filteredStocks.slice(0, 5) }}
                  autoAnalyze={!isLoading && filteredStocks.length > 0}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}