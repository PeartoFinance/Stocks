'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, TrendingDown, Star, BarChart3, DollarSign } from 'lucide-react';

import { stockAPI } from '../utils/api';
import toast from 'react-hot-toast';

interface ETF {
  symbol: string;
  name: string;
  category: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  aum: string;
  expenseRatio: number;
  yield: number;
  inception: string;
}

export default function ETFScreener() {
  const [etfs, setETFs] = useState<ETF[]>([]);
  const [filteredETFs, setFilteredETFs] = useState<ETF[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    minAUM: '',
    maxExpenseRatio: '',
    minYield: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchETFs = async () => {
      try {
        setIsLoading(true);
        const data = await stockAPI.getETFs({ limit: 100 });
        setETFs(data);
        setFilteredETFs(data);
      } catch (error) {
        console.error('Error fetching ETFs:', error);
        toast.error('Failed to load ETF data');
        setETFs([]);
        setFilteredETFs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchETFs();
  }, []);

  useEffect(() => {
    let filtered = etfs.filter(etf => {
      const matchesSearch = etf.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etf.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filters.category === 'all' || etf.category === filters.category;
      const matchesMinAUM = !filters.minAUM || parseFloat((etf.aum || '0').replace('B', '')) >= parseFloat(filters.minAUM);
      const matchesMaxExpenseRatio = !filters.maxExpenseRatio || etf.expenseRatio <= parseFloat(filters.maxExpenseRatio);
      const matchesMinYield = !filters.minYield || etf.yield >= parseFloat(filters.minYield);

      return matchesSearch && matchesCategory && matchesMinAUM && matchesMaxExpenseRatio && matchesMinYield;
    });

    setFilteredETFs(filtered);
  }, [etfs, searchTerm, filters]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const calculateTotalAUM = () => {
    const total = filteredETFs.reduce((acc, etf) => {
      const aumValue = parseFloat((etf.aum || '0').replace('B', ''));
      return acc + (isNaN(aumValue) ? 0 : aumValue);
    }, 0);
    return total.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/95">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ETF Screener</h1>
                <p className="text-slate-600 dark:text-gray-400 mt-2">Find ETFs that match your investment criteria</p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-6 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-400 mb-2">Search ETFs</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by symbol or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-400 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="Technology">Technology</option>
                    <option value="Financial">Financial</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Energy">Energy</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                {/* Min AUM */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-400 mb-2">Min AUM (B)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1"
                    value={filters.minAUM}
                    onChange={(e) => setFilters({ ...filters, minAUM: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Max Expense Ratio */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-400 mb-2">Max Exp Ratio (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 0.5"
                    value={filters.maxExpenseRatio}
                    onChange={(e) => setFilters({ ...filters, maxExpenseRatio: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Total ETFs</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{filteredETFs.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Avg Expense Ratio</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {(filteredETFs.reduce((acc, etf) => acc + (etf.expenseRatio || 0), 0) / filteredETFs.length || 0).toFixed(2)}%
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Avg Yield</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {(filteredETFs.reduce((acc, etf) => acc + (etf.yield || 0), 0) / filteredETFs.length || 0).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-slate-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Total AUM</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${calculateTotalAUM()}T
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* ETF Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {isLoading ? 'Loading...' : `${filteredETFs.length} ETFs Found`}
                </h3>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-slate-600 dark:text-gray-400">Filters applied</span>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-slate-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ETF</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Volume</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">AUM</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exp Ratio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Yield</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredETFs.map((etf, index) => (
                        <motion.tr
                          key={etf.symbol}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-slate-50 dark:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">{etf.symbol}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{etf.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">${etf.price?.toFixed(2) || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center space-x-1 ${(etf.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(etf.changePercent || 0) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              <span className="text-sm font-medium">
                                {(etf.changePercent || 0) >= 0 ? '+' : ''}{etf.changePercent?.toFixed(2) || '0.00'}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-white">{formatNumber(etf.volume)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-white">{etf.aum || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-white">{etf.expenseRatio?.toFixed(2) || 'N/A'}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-white">{etf.yield?.toFixed(1) || 'N/A'}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {etf.category}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
