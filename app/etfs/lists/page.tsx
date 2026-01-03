'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown, Filter, Search, BarChart3, DollarSign, Users, Award, Zap } from 'lucide-react';

interface ETFList {
  id: string;
  name: string;
  description: string;
  category: string;
  etfCount: number;
  totalAum: string;
  avgExpenseRatio: number;
  topPerformer: {
    symbol: string;
    return: number;
  };
  updatedAt: string;
}

interface ETFListItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  aum: string;
  expenseRatio: number;
  yield: number;
  ytdReturn: number;
  category: string;
}

export default function ETFListsPage() {
  const [etfLists, setETFLists] = useState<ETFList[]>([]);
  const [selectedList, setSelectedList] = useState<ETFList | null>(null);
  const [listETFs, setListETFs] = useState<ETFListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateETFLists = () => {
      return [
        {
          id: '1',
          name: 'Top Performing ETFs',
          description: 'Best performing ETFs based on YTD returns and consistent performance metrics',
          category: 'Performance',
          etfCount: 25,
          totalAum: '$2.3T',
          avgExpenseRatio: 0.15,
          topPerformer: { symbol: 'QQQ', return: 42.5 },
          updatedAt: '2024-01-15'
        },
        {
          id: '2',
          name: 'Low Cost Index ETFs',
          description: 'ETFs with the lowest expense ratios for cost-conscious investors',
          category: 'Value',
          etfCount: 18,
          totalAum: '$1.8T',
          avgExpenseRatio: 0.05,
          topPerformer: { symbol: 'VTI', return: 19.2 },
          updatedAt: '2024-01-15'
        },
        {
          id: '3',
          name: 'High Dividend Yield ETFs',
          description: 'ETFs focusing on dividend-paying stocks with yields above 3%',
          category: 'Income',
          etfCount: 22,
          totalAum: '$850B',
          avgExpenseRatio: 0.25,
          topPerformer: { symbol: 'VYM', return: 8.7 },
          updatedAt: '2024-01-15'
        },
        {
          id: '4',
          name: 'Technology Sector ETFs',
          description: 'ETFs with concentrated exposure to technology and innovation companies',
          category: 'Sector',
          etfCount: 31,
          totalAum: '$1.2T',
          avgExpenseRatio: 0.32,
          topPerformer: { symbol: 'ARKK', return: 35.8 },
          updatedAt: '2024-01-15'
        },
        {
          id: '5',
          name: 'International ETFs',
          description: 'ETFs providing exposure to international markets and currencies',
          category: 'Global',
          etfCount: 45,
          totalAum: '$950B',
          avgExpenseRatio: 0.18,
          topPerformer: { symbol: 'VEA', return: 15.3 },
          updatedAt: '2024-01-15'
        },
        {
          id: '6',
          name: 'ESG & Sustainable ETFs',
          description: 'Environmentally and socially responsible investment ETFs',
          category: 'ESG',
          etfCount: 28,
          totalAum: '$420B',
          avgExpenseRatio: 0.28,
          topPerformer: { symbol: 'ESGU', return: 18.9 },
          updatedAt: '2024-01-15'
        }
      ];
    };

    const generateListETFs = (listId: string) => {
      const etfs = [
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', category: 'Large Cap' },
        { symbol: 'QQQ', name: 'Invesco QQQ Trust', category: 'Technology' },
        { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', category: 'Total Market' },
        { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', category: 'International' },
        { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', category: 'Dividend' },
        { symbol: 'ARKK', name: 'ARK Innovation ETF', category: 'Innovation' },
        { symbol: 'VNQ', name: 'Vanguard Real Estate Index Fund ETF', category: 'Real Estate' },
        { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', category: 'Bonds' }
      ];

      return etfs.map(etf => ({
        ...etf,
        price: Math.random() * 500 + 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        aum: `${(Math.random() * 300 + 10).toFixed(1)}B`,
        expenseRatio: Math.random() * 0.8 + 0.03,
        yield: Math.random() * 5 + 0.5,
        ytdReturn: Math.random() * 40 + 5
      }));
    };

    setTimeout(() => {
      const lists = generateETFLists();
      setETFLists(lists);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleListSelect = (list: ETFList) => {
    setSelectedList(list);
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const etfs = generateListETFs(list.id);
      setListETFs(etfs);
      setIsLoading(false);
    }, 800);
  };

  const generateListETFs = (listId: string) => {
    const etfs = [
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', category: 'Large Cap' },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', category: 'Technology' },
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', category: 'Total Market' },
      { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', category: 'International' },
      { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', category: 'Dividend' },
      { symbol: 'ARKK', name: 'ARK Innovation ETF', category: 'Innovation' },
      { symbol: 'VNQ', name: 'Vanguard Real Estate Index Fund ETF', category: 'Real Estate' },
      { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', category: 'Bonds' }
    ];

    return etfs.map(etf => ({
      ...etf,
      price: Math.random() * 500 + 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      aum: `${(Math.random() * 300 + 10).toFixed(1)}B`,
      expenseRatio: Math.random() * 0.8 + 0.03,
      yield: Math.random() * 5 + 0.5,
      ytdReturn: Math.random() * 40 + 5
    }));
  };

  const filteredLists = etfLists.filter(list => {
    const matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         list.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || list.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedList ? (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-4">ETF Lists</h1>
              <p className="text-gray-600">Discover expertly curated ETF collections tailored to different investment strategies</p>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Lists</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="performance">Performance</option>
                    <option value="value">Value</option>
                    <option value="income">Income</option>
                    <option value="sector">Sector</option>
                    <option value="global">Global</option>
                    <option value="esg">ESG</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Lists</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredLists.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total ETFs</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredLists.reduce((acc, list) => acc + list.etfCount, 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Combined AUM</p>
                    <p className="text-2xl font-bold text-gray-900">$8.5T</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </motion.div>

            {/* ETF Lists Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {filteredLists.map((list, index) => (
                  <motion.div
                    key={list.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleListSelect(list)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{list.name}</h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {list.category}
                          </span>
                        </div>
                      </div>
                      <Zap className="h-5 w-5 text-yellow-500" />
                    </div>

                    <p className="text-gray-600 mb-4">{list.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">ETFs Count</p>
                        <p className="font-semibold text-gray-900">{list.etfCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total AUM</p>
                        <p className="font-semibold text-gray-900">{list.totalAum}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Avg Expense Ratio</p>
                        <p className="font-semibold text-gray-900">{list.avgExpenseRatio}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Top Performer</p>
                        <div className="flex items-center space-x-1">
                          <p className="font-semibold text-gray-900">{list.topPerformer.symbol}</p>
                          <span className="text-xs text-green-600">
                            +{list.topPerformer.return}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Updated {list.updatedAt}</p>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View ETFs →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        ) : (
          /* Selected List View */
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setSelectedList(null)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Back to Lists
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{selectedList.name}</h1>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {selectedList.category}
              </span>
            </div>

            {/* List ETFs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isLoading ? 'Loading...' : `${listETFs.length} ETFs in this list`}
                </h3>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">YTD Return</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AUM</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yield</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {listETFs.map((etf, index) => (
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
                            <span className="text-sm font-medium text-green-600">
                              +{etf.ytdReturn.toFixed(1)}%
                            </span>
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
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}