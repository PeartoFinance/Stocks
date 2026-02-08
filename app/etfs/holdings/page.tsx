'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, PieChart, BarChart3, MapPin, Building2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface Holding {
  symbol: string;
  name: string;
  weight: number;
  shares: number;
  marketValue: string;
  sector: string;
  country: string;
  change: number;
  changePercent: number;
}

interface ETFData {
  symbol: string;
  name: string;
  totalHoldings: number;
  totalAssets: string;
  lastUpdated: string;
}

export default function ETFHoldingsPage() {
  const [selectedETF] = useState<ETFData>({
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    totalHoldings: 503,
    totalAssets: '$385.2B',
    lastUpdated: '2024-01-15'
  });
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateHoldings = () => {
      const companies = [
        { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary' },
        { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', sector: 'Technology' },
        { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary' },
        { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
        { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', sector: 'Financial' },
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial' },
        { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
        { symbol: 'V', name: 'Visa Inc.', sector: 'Financial' },
        { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Staples' },
        { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare' },
        { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Discretionary' },
        { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial' },
        { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financial' },
        { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy' },
        { symbol: 'DIS', name: 'Walt Disney Co.', sector: 'Communication' },
        { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology' },
        { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology' }
      ];

      let cumulativeWeight = 0;
      return companies.map((company, index) => {
        const weight = Math.max(0.5, 8 - (index * 0.3));
        cumulativeWeight += weight;
        if (cumulativeWeight > 100) return null;

        return {
          ...company,
          weight,
          shares: Math.floor(Math.random() * 10000000) + 100000,
          marketValue: `$${(weight * 3852000000 / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}M`,
          country: 'United States',
          change: (Math.random() - 0.5) * 20,
          changePercent: (Math.random() - 0.5) * 5
        };
      }).filter(Boolean) as Holding[];
    };

    setTimeout(() => {
      const mockHoldings = generateHoldings();
      setHoldings(mockHoldings);
      setIsLoading(false);
    }, 1000);
  }, [selectedETF]);

  const sectorAllocation = holdings.reduce((acc, holding) => {
    acc[holding.sector] = (acc[holding.sector] || 0) + holding.weight;
    return acc;
  }, {} as Record<string, number>);

  const topSectors = Object.entries(sectorAllocation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const filteredHoldings = holdings.filter(holding => {
    const matchesSearch = holding.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      holding.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'all' || holding.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const getConcentrationLevel = () => {
    const top10Weight = holdings.slice(0, 10).reduce((sum, holding) => sum + holding.weight, 0);
    if (top10Weight > 60) return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
    if (top10Weight > 40) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const concentration = getConcentrationLevel();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-pearto-blockchain dark:bg-pearto-surface">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-pearto-luna dark:text-pearto-luna">{selectedETF.symbol} Holdings</h1>
              <p className="text-gray-600 dark:text-pearto-cloud dark:text-pearto-cloud mt-2">{selectedETF.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-pearto-gray dark:text-pearto-gray">Total Holdings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-pearto-luna dark:text-pearto-luna">{selectedETF.totalHoldings}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl p-6 border border-gray-200 dark:border-pearto-border dark:border-pearto-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-pearto-cloud dark:text-pearto-cloud">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-pearto-luna dark:text-pearto-luna">{selectedETF.totalAssets}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl p-6 border border-gray-200 dark:border-pearto-border dark:border-pearto-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-pearto-cloud dark:text-pearto-cloud">Top 10 Weight</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-pearto-luna dark:text-pearto-luna">
                  {holdings.slice(0, 10).reduce((sum, holding) => sum + holding.weight, 0).toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl p-6 border border-gray-200 dark:border-pearto-border dark:border-pearto-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-pearto-cloud dark:text-pearto-cloud">Concentration</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${concentration.bg} ${concentration.color}`}>
                  {concentration.level}
                </span>
              </div>
              <PieChart className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl p-6 border border-gray-200 dark:border-pearto-border dark:border-pearto-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-pearto-cloud dark:text-pearto-cloud">Sectors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-pearto-luna dark:text-pearto-luna">{Object.keys(sectorAllocation).length}</p>
              </div>
              <Building2 className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border dark:border-pearto-border p-6 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-pearto-cloud dark:text-pearto-cloud mb-2">Search Holdings</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by symbol or company name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-pearto-border dark:border-pearto-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-pearto-cloud dark:text-pearto-cloud mb-2">Filter by Sector</label>
                  <select
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-pearto-border dark:border-pearto-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Sectors</option>
                    {Object.keys(sectorAllocation).map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border dark:border-pearto-border overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-pearto-border dark:border-pearto-border">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-pearto-luna dark:text-pearto-luna">
                  Top Holdings ({filteredHoldings.length} of {holdings.length})
                </h3>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-pearto-border dark:divide-pearto-border">
                    <thead className="bg-gray-50 dark:bg-pearto-blockchain dark:bg-pearto-surface">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray dark:text-pearto-gray uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray dark:text-pearto-gray uppercase tracking-wider">Weight</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray dark:text-pearto-gray uppercase tracking-wider">Market Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray dark:text-pearto-gray uppercase tracking-wider">Change</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray dark:text-pearto-gray uppercase tracking-wider">Sector</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-pearto-card dark:bg-pearto-card divide-y divide-gray-200 dark:divide-pearto-border dark:divide-pearto-border">
                      {filteredHoldings.map((holding, index) => (
                        <motion.tr
                          key={holding.symbol}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="hover:bg-gray-50 dark:bg-pearto-blockchain dark:bg-pearto-surface transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-pearto-luna dark:text-pearto-luna">{holding.symbol}</div>
                              <div className="text-sm text-gray-500 dark:text-pearto-gray dark:text-pearto-gray">{holding.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-pearto-luna dark:text-pearto-luna">{holding.weight.toFixed(2)}%</div>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${Math.min(100, (holding.weight / 8) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-pearto-luna dark:text-pearto-luna">{holding.marketValue}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center space-x-1 ${holding.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {holding.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              <span className="text-sm font-medium">
                                {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-pearto-surface dark:bg-pearto-surface text-gray-800">
                              {holding.sector}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border dark:border-pearto-border p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-pearto-luna dark:text-pearto-luna mb-4">Sector Allocation</h3>
              <div className="space-y-4">
                {topSectors.map(([sector, weight], index) => (
                  <div key={sector} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-pearto-luna dark:text-pearto-luna">{sector}</span>
                        <span className="text-sm text-gray-600 dark:text-pearto-cloud dark:text-pearto-cloud">{weight.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(weight / Math.max(...topSectors.map(([, w]) => w))) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border dark:border-pearto-border p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-pearto-luna dark:text-pearto-luna mb-4">Geographic Allocation</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-pearto-luna dark:text-pearto-luna">United States</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-pearto-cloud dark:text-pearto-cloud">98.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-pearto-luna dark:text-pearto-luna">International</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-pearto-cloud dark:text-pearto-cloud">1.5%</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white dark:bg-pearto-card dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border dark:border-pearto-border p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-pearto-luna dark:text-pearto-luna mb-4">Data Info</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-pearto-cloud dark:text-pearto-cloud">
                <p><strong>Last Updated:</strong> {selectedETF.lastUpdated}</p>
                <p><strong>Frequency:</strong> Daily</p>
                <p><strong>Source:</strong> Fund Company</p>
                <p className="text-xs text-gray-500 dark:text-pearto-gray dark:text-pearto-gray mt-3">
                  Holdings data is updated daily and represents the most recent portfolio information available.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}