'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, ArrowUpDown, Star, RefreshCw, X
} from 'lucide-react';
import { stockAPI } from '../../utils/api';
import { Stock } from '../../types';
import Link from 'next/link';
import PriceDisplay from '../common/PriceDisplay';

interface AllStocksProps {
  className?: string;
}

export default function AllStocks({ className = '' }: AllStocksProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
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

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setIsLoading(true);
        const response = await stockAPI.getAllStocks();

        if (response.success && response.data) {
          setStocks(response.data);
          setFilteredStocks(response.data);
        }
      } catch (error) {
        console.error('[AllStocks] Error fetching stocks:', error);
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

  const parseMarketCapToNumber = (val: string): number => {
    if (val === '—') return 0;
    const num = parseFloat(val.replace(/[^0-9.]/g, ''));
    if (val.includes('T')) return num * 1e12;
    if (val.includes('B')) return num * 1e9;
    if (val.includes('M')) return num * 1e6;
    return num;
  };

  useEffect(() => {
    let filtered = stocks.filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSector = filters.sector === 'all' || stock.sector === filters.sector;
      const matchesExchange = filters.exchange === 'all' || stock.exchange === filters.exchange;

      const matchesMinPrice = !filters.minPrice || stock.price >= parseFloat(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || stock.price <= parseFloat(filters.maxPrice);
      const matchesMinVolume = !filters.minVolume || (stock.volume || 0) >= parseInt(filters.minVolume);

      return matchesSearch && matchesSector && matchesExchange && matchesMinPrice && matchesMaxPrice && matchesMinVolume;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Stock];
        let bValue: any = b[sortConfig.key as keyof Stock];

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
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-3 sm:p-4 transition-colors duration-300">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-pearto-gray" />
            <input
              type="text"
              placeholder="Search by symbol or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-pearto-green focus:border-blue-500 dark:focus:border-pearto-green bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-pearto-gray text-sm sm:text-base transition-colors duration-300"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap ${showFilters || hasActiveFilters
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700'
              }`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-600 dark:bg-pearto-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition-colors duration-300">
                {[filters.sector !== 'all', filters.exchange !== 'all', filters.minPrice, filters.maxPrice, filters.minVolume].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 overflow-hidden transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">Advanced Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors duration-300">
                  <X className="h-4 w-4" /> Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-400 mb-1.5 transition-colors duration-300">Sector</label>
                <select
                  value={filters.sector}
                  onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg text-sm appearance-none bg-white dark:bg-gray-800 transition-colors duration-300"
                >
                  <option value="all">All Sectors</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Consumer Cyclical">Consumer Cyclical</option>
                  <option value="Energy">Energy</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-400 mb-1.5 transition-colors duration-300">Exchange</label>
                <select
                  value={filters.exchange}
                  onChange={(e) => setFilters({ ...filters, exchange: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg text-sm appearance-none bg-white dark:bg-gray-800 transition-colors duration-300"
                >
                  <option value="all">All Exchanges</option>
                  <option value="NASDAQ">NASDAQ</option>
                  <option value="NYSE">NYSE</option>
                  <option value="NMS">NMS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-400 mb-1.5 transition-colors duration-300">Min Price</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg text-sm transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-400 mb-1.5 transition-colors duration-300">Max Price</label>
                <input
                  type="number"
                  placeholder="$∞"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg text-sm transition-colors duration-300"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between transition-colors duration-300">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">
            {isLoading ? 'Loading...' : `${filteredStocks.length} Stock${filteredStocks.length !== 1 ? 's' : ''} Found`}
          </h3>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 dark:bg-pearto-blue text-white rounded-lg hover:bg-blue-700 dark:hover:bg-pearto-blue-hover transition-colors shadow-sm text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">No stocks found matching your criteria.</p>
            <button onClick={clearFilters} className="mt-4 text-blue-600 font-medium text-sm">Clear all filters</button>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="block lg:hidden divide-y divide-gray-200 dark:divide-pearto-border dark:divide-pearto-border transition-colors duration-300">
              {filteredStocks.map((stock, index) => (
                <motion.div key={stock.symbol} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
                  <Link href={`/stock/${stock.symbol.toLowerCase()}`}>
                    <div className="flex justify-between mb-2">
                      <span className="font-bold">{stock.symbol}</span>
                      <PriceDisplay amount={stock.price} className="font-bold" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 truncate max-w-[150px] transition-colors duration-300">{stock.name}</span>
                      <span className={stock.change >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'}>
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-pearto-border dark:divide-pearto-border text-sm transition-colors duration-300">
                <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase transition-colors duration-300">Stock</th>
                    {['Price', 'Change', 'Volume', 'MarketCap', 'PE'].map((key) => (
                      <th key={key} onClick={() => handleSort(key === 'MarketCap' ? 'marketCap' : key.toLowerCase())} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:bg-gray-700 transition-colors duration-300">
                        <div className="flex items-center gap-1">{key} <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                    ))}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase transition-colors duration-300">Sector</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-pearto-border transition-colors duration-300">
                  {filteredStocks.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-gray-50 dark:bg-gray-700 transition-colors">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Link href={`/stock/${stock.symbol.toLowerCase()}`}>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white transition-colors duration-300">{stock.symbol}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] transition-colors duration-300">{stock.name}</div>
                        </Link>
                      </td>

                      <td className="px-4 py-2 text-sm font-medium text-slate-900 dark:text-white transition-colors duration-300">
                        <PriceDisplay amount={stock.price} />
                      </td>
                      <td className={`px-4 py-2 text-sm font-medium ${stock.change >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'}`}>
                        {stock.changePercent.toFixed(2)}%
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-900 dark:text-white transition-colors duration-300">{formatNumber(stock.volume || 0)}</td>
                      <td className="px-4 py-2 text-sm text-slate-900 dark:text-white transition-colors duration-300">{formatMarketCap(stock.marketCap)}</td>
                      <td className="px-4 py-2 text-sm text-slate-900 dark:text-white transition-colors duration-300">{stock.peRatio?.toFixed(2) || '—'}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">{stock.sector || 'Unknown'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div >
  );
}
