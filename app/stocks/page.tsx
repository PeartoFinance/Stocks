'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Download, Eye, TrendingUp, TrendingDown,
  ArrowUpDown, Star, MoreVertical, RefreshCw
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
        let aValue = a[sortConfig.key as keyof StockData];
        let bValue = b[sortConfig.key as keyof StockData];

        if (sortConfig.key === 'marketCap') {
          aValue = parseFloat(String(aValue).replace('B', ''));
          bValue = parseFloat(String(bValue).replace('B', ''));
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
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
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Stock Screener</h1>
                <p className="text-gray-600 mt-2">Screen stocks based on your criteria</p>
              </div>

              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Stocks</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by symbol or company name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Sector Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
                  <select
                    value={filters.sector}
                    onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Sectors</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Consumer Discretionary">Consumer Discretionary</option>
                    <option value="Consumer Staples">Consumer Staples</option>
                    <option value="Communication Services">Communication Services</option>
                  </select>
                </div>

                {/* Exchange Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exchange</label>
                  <select
                    value={filters.exchange}
                    onChange={(e) => setFilters({ ...filters, exchange: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Exchanges</option>
                    <option value="NASDAQ">NASDAQ</option>
                    <option value="NYSE">NYSE</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isLoading ? 'Loading...' : `${filteredStocks.length} Stocks Found`}
                </h3>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Advanced filters applied</span>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('price')}>
                          <div className="flex items-center space-x-1">
                            <span>Price</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('change')}>
                          <div className="flex items-center space-x-1">
                            <span>Change</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('volume')}>
                          <div className="flex items-center space-x-1">
                            <span>Volume</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('marketCap')}>
                          <div className="flex items-center space-x-1">
                            <span>Market Cap</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('pe')}>
                          <div className="flex items-center space-x-1">
                            <span>P/E Ratio</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStocks.map((stock, index) => (
                        <motion.tr
                          key={stock.symbol}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="hover:text-emerald-600">
                              <div className="text-sm font-medium text-gray-900 hover:text-emerald-600">{stock.symbol}</div>
                              <div className="text-sm text-gray-500">{stock.company}</div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">${stock.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center space-x-1 ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              <span className="text-sm font-medium">
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatNumber(stock.volume)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{stock.marketCap}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{stock.pe.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {stock.sector}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                <Star className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* AI Analysis Sidebar */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="xl:sticky xl:top-4">
              <AIAnalysisPanel
                title="Screener Insights"
                pageType="stock-screener"
                pageData={{
                  count: filteredStocks.length,
                  filters: {
                    sector: filters.sector !== 'all' ? filters.sector : null,
                    exchange: filters.exchange !== 'all' ? filters.exchange : null,
                    priceRange: filters.minPrice || filters.maxPrice ? `$${filters.minPrice || '0'} - $${filters.maxPrice || '∞'}` : null
                  },
                  topStocks: filteredStocks.slice(0, 5).map(s => ({
                    symbol: s.symbol,
                    price: s.price,
                    change: s.changePercent
                  }))
                }}
                autoAnalyze={!isLoading && filteredStocks.length > 0}
                quickPrompts={[
                  'Best value stocks here',
                  'High dividend picks',
                  'Growth opportunities'
                ]}
                maxHeight="500px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}