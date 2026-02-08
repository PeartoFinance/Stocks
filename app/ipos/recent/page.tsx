'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Building2, Users, ArrowUpDown } from 'lucide-react';

interface RecentIPO {
  symbol: string;
  company: string;
  ipoDate: string;
  offerPrice: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  sector: string;
  exchange: string;
  shares: number;
}

export default function RecentIPOs() {
  const [recentIPOs, setRecentIPOs] = useState<RecentIPO[]>([]);
  const [filteredIPOs, setFilteredIPOs] = useState<RecentIPO[]>([]);
  const [sortConfig, setSortConfig] = useState({ key: 'ipoDate', direction: 'desc' });
  const [filterPeriod, setFilterPeriod] = useState('30'); // days
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateRecentIPOs = () => {
      const companies = [
        { symbol: 'RIVN', company: 'Rivian Automotive Inc.', sector: 'Automotive', exchange: 'NASDAQ' },
        { symbol: 'COIN', company: 'Coinbase Global Inc.', sector: 'Financial Services', exchange: 'NASDAQ' },
        { symbol: 'RBLX', company: 'Roblox Corporation', sector: 'Technology', exchange: 'NYSE' },
        { symbol: 'ABNB', company: 'Airbnb Inc.', sector: 'Technology', exchange: 'NASDAQ' },
        { symbol: 'SNOW', company: 'Snowflake Inc.', sector: 'Technology', exchange: 'NYSE' },
        { symbol: 'PLTR', company: 'Palantir Technologies Inc.', sector: 'Technology', exchange: 'NYSE' },
        { symbol: 'DASH', company: 'DoorDash Inc.', sector: 'Technology', exchange: 'NYSE' },
        { symbol: 'CVNA', company: 'Carvana Co.', sector: 'Retail', exchange: 'NYSE' },
        { symbol: 'ROOT', company: 'Root Inc.', sector: 'Insurance', exchange: 'NASDAQ' },
        { symbol: 'WISH', company: 'ContextLogic Inc.', sector: 'E-commerce', exchange: 'NASDAQ' },
        { symbol: 'HOOD', company: 'Robinhood Markets Inc.', sector: 'Financial Services', exchange: 'NASDAQ' },
        { symbol: 'SOFI', company: 'SoFi Technologies Inc.', sector: 'Financial Services', exchange: 'NASDAQ' }
      ];

      return companies.map((company, index) => {
        const daysAgo = Math.floor(Math.random() * 90) + 1;
        const ipoDate = new Date();
        ipoDate.setDate(ipoDate.getDate() - daysAgo);
        
        const offerPrice = Math.random() * 100 + 20;
        const currentPrice = offerPrice + (Math.random() - 0.3) * offerPrice * 0.5;
        const change = currentPrice - offerPrice;
        const changePercent = (change / offerPrice) * 100;
        
        return {
          ...company,
          ipoDate: ipoDate.toISOString().split('T')[0],
          offerPrice,
          currentPrice,
          change,
          changePercent,
          volume: Math.floor(Math.random() * 50000000) + 1000000,
          marketCap: `${(Math.random() * 100 + 10).toFixed(1)}B`,
          shares: Math.floor(Math.random() * 100000000) + 10000000
        };
      });
    };

    setTimeout(() => {
      const mockData = generateRecentIPOs();
      setRecentIPOs(mockData);
      setFilteredIPOs(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const days = parseInt(filterPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let filtered = recentIPOs.filter(ipo => new Date(ipo.ipoDate) >= cutoffDate);
    
    // Sort the filtered results
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof RecentIPO];
        let bValue = b[sortConfig.key as keyof RecentIPO];
        
        if (sortConfig.key === 'marketCap') {
          aValue = parseFloat(String(aValue).replace('B', ''));
          bValue = parseFloat(String(bValue).replace('B', ''));
        } else if (sortConfig.key === 'ipoDate') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
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
    
    setFilteredIPOs(filtered);
  }, [recentIPOs, filterPeriod, sortConfig]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-pearto-blockchain">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-pearto-luna">Recent IPOs</h1>
            <p className="text-gray-600 dark:text-pearto-cloud mt-2">Track newly public companies and their performance</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select 
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-pearto-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="180">Last 6 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-pearto-card rounded-xl p-6 border border-gray-200 dark:border-pearto-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-pearto-cloud">Total IPOs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-pearto-luna">{filteredIPOs.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-pearto-card rounded-xl p-6 border border-gray-200 dark:border-pearto-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-pearto-cloud">Avg. Performance</p>
                <p className="text-2xl font-bold text-green-600">
                  +{(filteredIPOs.reduce((acc, ipo) => acc + ipo.changePercent, 0) / filteredIPOs.length || 0).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-pearto-card rounded-xl p-6 border border-gray-200 dark:border-pearto-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-pearto-cloud">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-pearto-luna">
                  {formatNumber(filteredIPOs.reduce((acc, ipo) => acc + ipo.volume, 0))}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-pearto-card rounded-xl p-6 border border-gray-200 dark:border-pearto-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-pearto-cloud">Market Cap</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-pearto-luna">$842.5B</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* IPO Table */}
        <div className="bg-white dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-pearto-border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-pearto-luna">
              {isLoading ? 'Loading...' : `${filteredIPOs.length} Recent IPOs`}
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-pearto-border">
                <thead className="bg-gray-50 dark:bg-pearto-blockchain">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:bg-pearto-surface" onClick={() => handleSort('ipoDate')}>
                      <div className="flex items-center space-x-1">
                        <span>IPO Date</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:bg-pearto-surface" onClick={() => handleSort('offerPrice')}>
                      <div className="flex items-center space-x-1">
                        <span>Offer Price</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:bg-pearto-surface" onClick={() => handleSort('currentPrice')}>
                      <div className="flex items-center space-x-1">
                        <span>Current Price</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:bg-pearto-surface" onClick={() => handleSort('changePercent')}>
                      <div className="flex items-center space-x-1">
                        <span>Performance</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:bg-pearto-surface" onClick={() => handleSort('volume')}>
                      <div className="flex items-center space-x-1">
                        <span>Volume</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:bg-pearto-surface" onClick={() => handleSort('marketCap')}>
                      <div className="flex items-center space-x-1">
                        <span>Market Cap</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase tracking-wider">Sector</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-pearto-card divide-y divide-gray-200 dark:divide-pearto-border">
                  {filteredIPOs.map((ipo, index) => (
                    <motion.tr
                      key={ipo.symbol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:bg-pearto-blockchain transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-pearto-luna">{ipo.symbol}</div>
                          <div className="text-sm text-gray-500 dark:text-pearto-gray">{ipo.company}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-pearto-luna">{formatDate(ipo.ipoDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-pearto-luna">${ipo.offerPrice.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-pearto-luna">${ipo.currentPrice.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center space-x-1 ${ipo.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {ipo.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span className="text-sm font-medium">
                            {ipo.changePercent >= 0 ? '+' : ''}{ipo.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-pearto-luna">{formatNumber(ipo.volume)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-pearto-luna">{ipo.marketCap}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {ipo.sector}
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
  );
}