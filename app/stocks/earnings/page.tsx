'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Clock,
  DollarSign,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '../../context/CurrencyContext';

interface EarningsEvent {
  id: string;
  symbol: string;
  name: string;
  date: string;
  time: 'BMO' | 'AMC' | 'TBD';
  epsEstimate: number;
  revenueEstimate: string;
  previousEps?: number;
  previousRevenue?: string;
  marketCap: string;
  sector: string;
}

// Mock earnings data
const generateMockEarnings = (): EarningsEvent[] => {
  const companies = [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', marketCap: '2.89T' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', marketCap: '2.78T' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', marketCap: '1.72T' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', marketCap: '1.55T' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', marketCap: '1.18T' },
    { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', marketCap: '910B' },
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical', marketCap: '785B' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial', marketCap: '502B' },
    { symbol: 'V', name: 'Visa Inc.', sector: 'Financial', marketCap: '485B' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', marketCap: '425B' },
    { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive', marketCap: '415B' },
    { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive', marketCap: '365B' },
    { symbol: 'HD', name: 'The Home Depot Inc.', sector: 'Consumer Cyclical', marketCap: '345B' },
    { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', marketCap: '285B' },
    { symbol: 'KO', name: 'Coca-Cola Company', sector: 'Consumer Defensive', marketCap: '265B' },
  ];

  const times: ('BMO' | 'AMC' | 'TBD')[] = ['BMO', 'AMC', 'TBD'];
  const today = new Date();

  return companies.map((company, i) => {
    const daysOffset = Math.floor(i / 3) - 2; // Spread over several days
    const date = new Date(today);
    date.setDate(date.getDate() + daysOffset);

    return {
      id: `${company.symbol}-${i}`,
      symbol: company.symbol,
      name: company.name,
      date: date.toISOString().split('T')[0],
      time: times[i % 3],
      epsEstimate: Math.random() * 3 + 0.5,
      revenueEstimate: `${(Math.random() * 50 + 10).toFixed(1)}B`,
      previousEps: Math.random() * 3 + 0.3,
      previousRevenue: `${(Math.random() * 50 + 8).toFixed(1)}B`,
      marketCap: company.marketCap,
      sector: company.sector,
    };
  });
};

export default function EarningsCalendar() {
  const { formatPrice } = useCurrency();
  const [earnings, setEarnings] = useState<EarningsEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEarnings(generateMockEarnings());
      setLoading(false);
    }, 500);
  }, []);

  const sectors = ['all', ...Array.from(new Set(earnings.map(e => e.sector)))];

  const filteredEarnings = earnings.filter(event => {
    const matchesSearch = event.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'all' || event.sector === selectedSector;
    const matchesDate = selectedDate === 'all' || event.date === selectedDate;
    return matchesSearch && matchesSector && matchesDate;
  });

  const uniqueDates = Array.from(new Set(earnings.map(e => e.date))).sort();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getTimeLabel = (time: string) => {
    switch (time) {
      case 'BMO': return 'Before Market Open';
      case 'AMC': return 'After Market Close';
      default: return 'Time TBD';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Calendar className="h-16 w-16 text-blue-600 animate-pulse mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Loading Earnings Calendar</h2>
              <p className="text-gray-600">Please wait...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Earnings Calendar
          </h1>
          <p className="text-xl text-gray-600">
            Track upcoming earnings announcements and historical performance
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by symbol or company name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Date Filter */}
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>{formatDate(date)}</option>
              ))}
            </select>

            {/* Sector Filter */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sectors</option>
              {sectors.filter(s => s !== 'all').map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="text-sm text-gray-500">This Week</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{earnings.length}</p>
            <p className="text-sm text-gray-600">Earnings Reports</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <span className="text-sm text-gray-500">Today</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {earnings.filter(e => e.date === new Date().toISOString().split('T')[0]).length}
            </p>
            <p className="text-sm text-gray-600">Reports Today</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <span className="text-sm text-gray-500">Avg Beat</span>
            </div>
            <p className="text-3xl font-bold text-green-600">+4.2%</p>
            <p className="text-sm text-gray-600">Last Quarter</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <span className="text-sm text-gray-500">Beat Rate</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">72%</p>
            <p className="text-sm text-gray-600">Companies Beat Est.</p>
          </div>
        </motion.div>

        {/* Earnings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Earnings</h2>
            <p className="text-gray-600">
              {filteredEarnings.length} companies reporting earnings
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Company</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Time</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">EPS Est.</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Prev. EPS</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Rev Est.</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Sector</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-pearto-border">
                {filteredEarnings.map((event, index) => (
                  <motion.tr
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <Link href={`/stock/${event.symbol.toLowerCase()}`} className="block">
                        <p className="font-semibold text-blue-600 hover:text-blue-800">{event.symbol}</p>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{event.name}</p>
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900">{formatDate(event.date)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${event.time === 'BMO' ? 'bg-orange-100 text-orange-700' :
                        event.time === 'AMC' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                        {event.time}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">
                      {formatPrice(event.epsEstimate)}
                    </td>
                    <td className="py-4 px-6 text-right text-gray-600">
                      {event.previousEps !== undefined ? formatPrice(event.previousEps) : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right text-gray-600">
                      ${event.revenueEstimate}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {event.sector}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Bell className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEarnings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No earnings found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </motion.div>

        {/* Historical Performance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-white rounded-xl p-8 shadow-lg border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Earnings Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { symbol: 'AAPL', name: 'Apple', eps: 1.52, estimate: 1.43, beat: true },
              { symbol: 'MSFT', name: 'Microsoft', eps: 2.89, estimate: 2.78, beat: true },
              { symbol: 'GOOGL', name: 'Alphabet', eps: 1.55, estimate: 1.48, beat: true },
              { symbol: 'AMZN', name: 'Amazon', eps: 0.94, estimate: 1.02, beat: false },
            ].map((result, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/stock/${result.symbol.toLowerCase()}`} className="font-semibold text-blue-600 hover:text-blue-800">
                    {result.symbol}
                  </Link>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${result.beat ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {result.beat ? 'BEAT' : 'MISS'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{result.name}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">EPS: <span className="font-semibold text-gray-900">{formatPrice(result.eps)}</span></span>
                  <span className={result.beat ? 'text-green-600' : 'text-red-600'}>
                    {result.beat ? '+' : ''}{((result.eps - result.estimate) / result.estimate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}