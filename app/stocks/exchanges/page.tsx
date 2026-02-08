'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Globe, Clock, TrendingUp, TrendingDown, Activity,
  Search, MapPin, Users, DollarSign, Calendar, Info
} from 'lucide-react';
import { formatNumber, formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Exchange {
  id: string;
  name: string;
  code: string;
  country: string;
  city: string;
  timezone: string;
  marketCap: number;
  listedCompanies: number;
  dailyVolume: number;
  tradingHours: {
    open: string;
    close: string;
    preMarket?: string;
    afterHours?: string;
  };
  indices: string[];
  description: string;
  website: string;
  established: number;
  currency: string;
  status: 'open' | 'closed' | 'pre-market' | 'after-hours';
  topSectors: string[];
}

export default function StockExchanges() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [filteredExchanges, setFilteredExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const mockExchanges: Exchange[] = [
    {
      id: '1',
      name: 'New York Stock Exchange',
      code: 'NYSE',
      country: 'United States',
      city: 'New York',
      timezone: 'EST',
      marketCap: 28500000000000,
      listedCompanies: 2400,
      dailyVolume: 85000000000,
      tradingHours: {
        open: '09:30',
        close: '16:00',
        preMarket: '04:00',
        afterHours: '20:00'
      },
      indices: ['S&P 500', 'Dow Jones', 'NYSE Composite'],
      description: 'The largest stock exchange in the world by market capitalization.',
      website: 'nyse.com',
      established: 1792,
      currency: 'USD',
      status: 'open',
      topSectors: ['Technology', 'Financial Services', 'Healthcare']
    },
    {
      id: '2',
      name: 'NASDAQ Stock Market',
      code: 'NASDAQ',
      country: 'United States',
      city: 'New York',
      timezone: 'EST',
      marketCap: 22800000000000,
      listedCompanies: 3300,
      dailyVolume: 78000000000,
      tradingHours: {
        open: '09:30',
        close: '16:00',
        preMarket: '04:00',
        afterHours: '20:00'
      },
      indices: ['NASDAQ Composite', 'NASDAQ 100', 'QQQ'],
      description: 'Electronic exchange known for technology companies.',
      website: 'nasdaq.com',
      established: 1971,
      currency: 'USD',
      status: 'open',
      topSectors: ['Technology', 'Biotechnology', 'Internet']
    },
    {
      id: '3',
      name: 'London Stock Exchange',
      code: 'LSE',
      country: 'United Kingdom',
      city: 'London',
      timezone: 'GMT',
      marketCap: 4200000000000,
      listedCompanies: 2000,
      dailyVolume: 12000000000,
      tradingHours: {
        open: '08:00',
        close: '16:30'
      },
      indices: ['FTSE 100', 'FTSE 250', 'FTSE All-Share'],
      description: 'One of the oldest stock exchanges in the world.',
      website: 'londonstockexchange.com',
      established: 1801,
      currency: 'GBP',
      status: 'closed',
      topSectors: ['Financial Services', 'Oil & Gas', 'Mining']
    },
    {
      id: '4',
      name: 'Tokyo Stock Exchange',
      code: 'TSE',
      country: 'Japan',
      city: 'Tokyo',
      timezone: 'JST',
      marketCap: 5800000000000,
      listedCompanies: 3700,
      dailyVolume: 45000000000,
      tradingHours: {
        open: '09:00',
        close: '15:30'
      },
      indices: ['Nikkei 225', 'TOPIX', 'JPX-Nikkei 400'],
      description: 'The largest stock exchange in Asia by market capitalization.',
      website: 'jpx.co.jp',
      established: 1878,
      currency: 'JPY',
      status: 'closed',
      topSectors: ['Technology', 'Automotive', 'Industrial']
    },
    {
      id: '5',
      name: 'Shanghai Stock Exchange',
      code: 'SSE',
      country: 'China',
      city: 'Shanghai',
      timezone: 'CST',
      marketCap: 7200000000000,
      listedCompanies: 1800,
      dailyVolume: 35000000000,
      tradingHours: {
        open: '09:30',
        close: '15:00'
      },
      indices: ['SSE Composite', 'SSE 50', 'STAR 50'],
      description: 'One of the three stock exchanges operating independently in China.',
      website: 'sse.com.cn',
      established: 1990,
      currency: 'CNY',
      status: 'closed',
      topSectors: ['Banking', 'Energy', 'Technology']
    },
    {
      id: '6',
      name: 'Euronext',
      code: 'ENX',
      country: 'Pan-European',
      city: 'Amsterdam, Brussels, Dublin, Lisbon, Milan, Paris',
      timezone: 'CET',
      marketCap: 5100000000000,
      listedCompanies: 1300,
      dailyVolume: 18000000000,
      tradingHours: {
        open: '09:00',
        close: '17:30'
      },
      indices: ['CAC 40', 'AEX', 'BEL 20'],
      description: 'Pan-European exchange across multiple countries.',
      website: 'euronext.com',
      established: 2000,
      currency: 'EUR',
      status: 'closed',
      topSectors: ['Luxury Goods', 'Banking', 'Energy']
    }
  ];

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'North America', label: 'North America' },
    { value: 'Europe', label: 'Europe' },
    { value: 'Asia', label: 'Asia' },
    { value: 'Others', label: 'Others' }
  ];

  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setExchanges(mockExchanges);
        setFilteredExchanges(mockExchanges);
      } catch (error) {
        console.error('Error fetching exchanges:', error);
        toast.error('Failed to load stock exchanges data');
      } finally {
        setLoading(false);
      }
    };

    fetchExchanges();
  }, []);

  useEffect(() => {
    let filtered = exchanges.filter(exchange => {
      const matchesSearch = exchange.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exchange.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exchange.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exchange.city.toLowerCase().includes(searchTerm.toLowerCase());

      const getRegion = (country: string) => {
        if (['United States', 'Canada', 'Mexico'].includes(country)) return 'North America';
        if (['United Kingdom', 'Germany', 'France', 'Italy', 'Netherlands', 'Spain', 'Pan-European'].includes(country)) return 'Europe';
        if (['Japan', 'China', 'India', 'South Korea', 'Singapore', 'Hong Kong'].includes(country)) return 'Asia';
        return 'Others';
      };

      const matchesRegion = selectedRegion === 'all' || getRegion(exchange.country) === selectedRegion;

      return matchesSearch && matchesRegion;
    });

    setFilteredExchanges(filtered);
  }, [exchanges, searchTerm, selectedRegion]);

  const getStatusColor = (status: Exchange['status']) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-red-100 text-red-700';
      case 'pre-market': return 'bg-blue-100 text-blue-700';
      case 'after-hours': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <main className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Activity className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading Exchanges</h2>
              <p className="text-gray-600 dark:text-slate-400">Please wait while we fetch exchange data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">

      <main className="p-8">
        {/* Header Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-500 dark:text-slate-400">Total Exchanges</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{exchanges.length}</p>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Worldwide coverage</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-500 dark:text-slate-400">Total Market Cap</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">$74.1T</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">Global markets</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-500 dark:text-slate-400">Listed Companies</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">13.5K</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">Total listings</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              <span className="text-sm text-gray-500 dark:text-slate-400">Active Now</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{exchanges.filter(e => e.status === 'open').length}</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">Markets trading</p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <button
                  key={region.value}
                  onClick={() => setSelectedRegion(region.value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedRegion === region.value
                      ? 'bg-blue-600 dark:bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                >
                  <span>{region.label}</span>
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exchanges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </motion.div>

        {/* Exchanges Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredExchanges.map((exchange, index) => (
            <motion.div
              key={exchange.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{exchange.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{exchange.code}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(exchange.status)}`}>
                  {exchange.status.replace('-', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Location</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{exchange.city}</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">{exchange.country}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Trading Hours</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {exchange.tradingHours.open} - {exchange.tradingHours.close}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">{exchange.timezone}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Market Cap</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(exchange.marketCap / 1e12)}T</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Listed Companies</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(exchange.listedCompanies)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Daily Volume</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(exchange.dailyVolume / 1e9)}B</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Established</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{exchange.established}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Major Indices</p>
                <div className="flex flex-wrap gap-1">
                  {exchange.indices.map((index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-md">
                      {index}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Top Sectors</p>
                <div className="flex flex-wrap gap-1">
                  {exchange.topSectors.map((sector) => (
                    <span key={sector} className="inline-flex px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">{exchange.description}</p>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-slate-400">
                  <Globe className="h-4 w-4" />
                  <span>{exchange.website}</span>
                </div>
                <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">View Details</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredExchanges.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No exchanges found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}