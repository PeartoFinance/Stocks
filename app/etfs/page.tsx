'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, TrendingDown, Star, BarChart3, DollarSign } from 'lucide-react';
import AIAnalysisPanel from '../components/ai/AIAnalysisPanel';

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
    const generateETFData = () => {
      const etfList = [
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', category: 'Large Blend' },
        { symbol: 'QQQ', name: 'Invesco QQQ Trust', category: 'Technology' },
        { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', category: 'Large Blend' },
        { symbol: 'IWM', name: 'iShares Russell 2000 ETF', category: 'Small Blend' },
        { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', category: 'Foreign Large Blend' },
        { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', category: 'Foreign Large Blend' },
        { symbol: 'IEMG', name: 'iShares Core MSCI Emerging Markets IMI Index ETF', category: 'Emerging Markets' },
        { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', category: 'Intermediate Core Bond' },
        { symbol: 'VNQ', name: 'Vanguard Real Estate Index Fund ETF', category: 'Real Estate' },
        { symbol: 'GLD', name: 'SPDR Gold Shares', category: 'Commodities' },
        { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', category: 'Technology' },
        { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', category: 'Financial' },
        { symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', category: 'Energy' },
        { symbol: 'XLV', name: 'Health Care Select Sector SPDR Fund', category: 'Health' },
        { symbol: 'ARKK', name: 'ARK Innovation ETF', category: 'Technology' }
      ];

      return etfList.map(etf => ({
        ...etf,
        price: Math.random() * 500 + 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 50000000) + 1000000,
        aum: `${(Math.random() * 300 + 10).toFixed(1)}B`,
        expenseRatio: Math.random() * 1.5 + 0.03,
        yield: Math.random() * 5 + 0.5,
        inception: `${2000 + Math.floor(Math.random() * 23)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
      }));
    };

    setTimeout(() => {
      const mockData = generateETFData();
      setETFs(mockData);
      setFilteredETFs(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = etfs.filter(etf => {
      const matchesSearch = etf.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etf.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filters.category === 'all' || etf.category === filters.category;
      const matchesMinAUM = !filters.minAUM || parseFloat(etf.aum.replace('B', '')) >= parseFloat(filters.minAUM);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ETF Screener</h1>
                <p className="text-gray-600 mt-2">Find ETFs that match your investment criteria</p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search ETFs</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by symbol or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Large Blend">Large Blend</option>
                    <option value="Technology">Technology</option>
                    <option value="Foreign Large Blend">International</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Commodities">Commodities</option>
                    <option value="Financial">Financial</option>
                  </select>
                </div>

                {/* Min AUM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min AUM (B)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1"
                    value={filters.minAUM}
                    onChange={(e) => setFilters({ ...filters, minAUM: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Max Expense Ratio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Exp Ratio (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 0.5"
                    value={filters.maxExpenseRatio}
                    onChange={(e) => setFilters({ ...filters, maxExpenseRatio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total ETFs</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredETFs.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Expense Ratio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(filteredETFs.reduce((acc, etf) => acc + etf.expenseRatio, 0) / filteredETFs.length || 0).toFixed(2)}%
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Yield</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(filteredETFs.reduce((acc, etf) => acc + etf.yield, 0) / filteredETFs.length || 0).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total AUM</p>
                    <p className="text-2xl font-bold text-gray-900">$2.1T</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* ETF Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isLoading ? 'Loading...' : `${filteredETFs.length} ETFs Found`}
                </h3>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Filters applied</span>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETF</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AUM</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exp Ratio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yield</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredETFs.map((etf, index) => (
                        <motion.tr
                          key={etf.symbol}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{etf.symbol}</div>
                              <div className="text-sm text-gray-500">{etf.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">${etf.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center space-x-1 ${etf.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {etf.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              <span className="text-sm font-medium">
                                {etf.changePercent >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatNumber(etf.volume)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{etf.aum}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{etf.expenseRatio.toFixed(2)}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{etf.yield.toFixed(1)}%</div>
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

          {/* AI Analysis Sidebar */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="xl:sticky xl:top-4">
              <AIAnalysisPanel
                title="ETF Insights"
                pageType="etf-overview"
                pageData={{
                  count: filteredETFs.length,
                  categories: Array.from(new Set(filteredETFs.map(e => e.category))).slice(0, 5),
                  topETFs: filteredETFs.slice(0, 5).map(e => ({
                    symbol: e.symbol,
                    price: e.price,
                    yield: e.yield,
                    expenseRatio: e.expenseRatio
                  })),
                  avgExpenseRatio: (filteredETFs.reduce((acc, e) => acc + e.expenseRatio, 0) / filteredETFs.length || 0).toFixed(2),
                  avgYield: (filteredETFs.reduce((acc, e) => acc + e.yield, 0) / filteredETFs.length || 0).toFixed(1)
                }}
                autoAnalyze={!isLoading && filteredETFs.length > 0}
                quickPrompts={[
                  'Best low-cost ETFs',
                  'Highest yield options',
                  'Sector diversification'
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