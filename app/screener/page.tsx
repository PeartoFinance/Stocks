'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  BarChart3,
  DollarSign,
  Percent,
  Activity
} from 'lucide-react';
import { stockAPI } from '../utils/api';
import { Stock, ScreenerFilters } from '../types';
import { formatPrice, formatChange, formatNumber, formatVolume } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AIAnalysisPanel from '../components/ai/AIAnalysisPanel';

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Stock>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ScreenerFilters>({
    minPrice: 0,
    maxPrice: 10000,
    minMarketCap: 0,
    maxMarketCap: 100000000000,
    minPE: 0,
    maxPE: 100,
    sectors: [],
    minVolume: 0,
    maxVolume: 1000000000
  });

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const response = await stockAPI.getAllStocks();
        setStocks(response.data);
        setFilteredStocks(response.data);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        toast.error('Failed to load stocks data');
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  useEffect(() => {
    let filtered = stocks.filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPrice = stock.price >= (filters.minPrice || 0) && stock.price <= (filters.maxPrice || 10000);
      const matchesMarketCap = (stock.marketCap || 0) >= (filters.minMarketCap || 0) &&
        (stock.marketCap || 0) <= (filters.maxMarketCap || 100000000000);
      const matchesPE = !stock.peRatio || (stock.peRatio >= (filters.minPE || 0) && stock.peRatio <= (filters.maxPE || 100));
      const matchesSector = (filters.sectors || []).length === 0 ||
        (stock.sector && (filters.sectors || []).includes(stock.sector));
      const matchesVolume = (stock.volume || 0) >= (filters.minVolume || 0) &&
        (stock.volume || 0) <= (filters.maxVolume || 1000000000);

      return matchesSearch && matchesPrice && matchesMarketCap && matchesPE && matchesSector && matchesVolume;
    });

    // Sort stocks
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredStocks(filtered);
  }, [stocks, searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field: keyof Stock) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const resetFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 10000,
      minMarketCap: 0,
      maxMarketCap: 100000000000,
      minPE: 0,
      maxPE: 100,
      sectors: [],
      minVolume: 0,
      maxVolume: 1000000000
    });
    setSearchTerm('');
  };

  const sectors = Array.from(new Set(stocks.map(stock => stock.sector).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Activity className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Loading Stock Screener</h2>
              <p className="text-gray-600">Please wait while we fetch stock data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 sm:mb-8"
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                Stock Screener
              </h1>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600">
                Find the best investment opportunities with advanced filtering
              </p>
            </motion.div>

            {/* Search and Filter Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 mb-6 sm:mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by symbol or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center text-sm sm:text-base whitespace-nowrap ${showFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Filters
                </button>

                {/* Reset Button */}
                <button
                  onClick={resetFilters}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold text-sm sm:text-base whitespace-nowrap"
                >
                  Reset
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range
                      </label>
                      <div className="space-y-2">
                        <input
                          type="number"
                          placeholder="Min Price"
                          value={filters.minPrice || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Max Price"
                          value={filters.maxPrice || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || 10000 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Market Cap Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Market Cap (Billions)
                      </label>
                      <div className="space-y-2">
                        <input
                          type="number"
                          placeholder="Min Market Cap"
                          value={filters.minMarketCap ? filters.minMarketCap / 1000000000 : ''}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            minMarketCap: (Number(e.target.value) || 0) * 1000000000
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Max Market Cap"
                          value={filters.maxMarketCap ? filters.maxMarketCap / 1000000000 : ''}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            maxMarketCap: (Number(e.target.value) || 100000) * 1000000000
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* P/E Ratio Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        P/E Ratio
                      </label>
                      <div className="space-y-2">
                        <input
                          type="number"
                          placeholder="Min P/E"
                          value={filters.minPE || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, minPE: Number(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Max P/E"
                          value={filters.maxPE || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxPE: Number(e.target.value) || 100 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Sectors */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sectors
                      </label>
                      <select
                        multiple
                        value={filters.sectors}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setFilters(prev => ({ ...prev, sectors: selected }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-20"
                      >
                        {sectors.map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Results Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4 sm:mb-6"
            >
              <p className="text-sm sm:text-base text-gray-600 px-1">
                Showing <span className="font-semibold text-gray-900">{filteredStocks.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{stocks.length}</span> stocks
              </p>
            </motion.div>

            {/* Stock Table - Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('symbol')}
                          className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                        >
                          <span>Symbol</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                        >
                          <span>Company</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSort('price')}
                          className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                        >
                          <span>Price</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSort('changePercent')}
                          className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                        >
                          <span>Change %</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSort('marketCap')}
                          className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                        >
                          <span>Market Cap</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSort('volume')}
                          className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                        >
                          <span>Volume</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSort('peRatio')}
                          className="flex items-center space-x-1 font-semibold text-gray-900 hover:text-blue-600"
                        >
                          <span>P/E</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">Sector</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStocks.map((stock, index) => {
                      const changeData = formatChange(stock.change, stock.changePercent);
                      return (
                        <motion.tr
                          key={stock.symbol}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.02 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link
                              href={`/stock/${stock.symbol}`}
                              className="font-semibold text-blue-600 hover:text-blue-800"
                            >
                              {stock.symbol}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 line-clamp-1">{stock.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">
                            {formatPrice(stock.price)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className={`flex items-center justify-end ${changeData.isPositive ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {changeData.isPositive ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                              ) : (
                                <TrendingDown className="h-4 w-4 mr-1" />
                              )}
                              <span className="font-medium">{changeData.value}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900">
                            {formatNumber(stock.marketCap)}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-600">
                            {formatVolume(stock.volume)}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900">
                            {stock.peRatio ? stock.peRatio.toFixed(2) : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {stock.sector || 'Other'}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredStocks.length === 0 && (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No stocks found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search terms</p>
                </div>
              )}
            </motion.div>

            {/* Stock Cards - Mobile/Tablet */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:hidden space-y-3 sm:space-y-4"
            >
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock, index) => {
                  const changeData = formatChange(stock.change, stock.changePercent);
                  return (
                    <Link key={stock.symbol} href={`/stock/${stock.symbol}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-blue-600 text-base mb-1">{stock.symbol}</h3>
                            <p className="text-sm text-gray-900 font-medium line-clamp-1">{stock.name}</p>
                            <span className="inline-flex px-2 py-1 mt-2 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {stock.sector || 'Other'}
                            </span>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-lg font-bold text-gray-900">{formatPrice(stock.price)}</div>
                            <div className={`text-sm font-medium flex items-center justify-end mt-1 ${changeData.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              {changeData.isPositive ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                              ) : (
                                <TrendingDown className="h-4 w-4 mr-1" />
                              )}
                              <span>{changeData.value}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                          <div>
                            <div className="text-xs text-gray-500">Market Cap</div>
                            <div className="text-sm font-semibold text-gray-900">{formatNumber(stock.marketCap)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Volume</div>
                            <div className="text-sm font-semibold text-gray-900">{formatVolume(stock.volume)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">P/E Ratio</div>
                            <div className="text-sm font-semibold text-gray-900">
                              {stock.peRatio ? stock.peRatio.toFixed(2) : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })
              ) : (
                <div className="bg-white rounded-xl p-8 text-center shadow-lg border border-gray-100">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-900 mb-2">No stocks found</h3>
                  <p className="text-sm text-gray-600">Try adjusting your filters or search terms</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* AI Analysis Sidebar */}
          <div className="w-full xl:w-80 flex-shrink-0 mt-6 xl:mt-0">
            <div className="xl:sticky xl:top-4">
              <AIAnalysisPanel
                title="Screener Insights"
                pageType="screener-advanced"
                pageData={{
                  count: filteredStocks.length,
                  totalStocks: stocks.length,
                  criteria: {
                    priceRange: `$${filters.minPrice || 0} - $${filters.maxPrice || 'Any'}`,
                    marketCap: filters.minMarketCap ? `>${(filters.minMarketCap / 1e9).toFixed(1)}B` : 'Any',
                    peRatio: filters.minPE ? `${filters.minPE}-${filters.maxPE}` : 'Any',
                    sectors: (filters.sectors && filters.sectors.length > 0) ? filters.sectors.join(', ') : 'All'
                  },
                  topResults: filteredStocks.slice(0, 5).map(s => ({
                    symbol: s.symbol,
                    price: s.price,
                    change: s.changePercent
                  }))
                }}
                autoAnalyze={!loading && filteredStocks.length > 0}
                quickPrompts={[
                  'Best value picks',
                  'Growth opportunities',
                  'Undervalued stocks'
                ]}
                maxHeight="500px"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}