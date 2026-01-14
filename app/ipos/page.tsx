'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  Building2,
  DollarSign,
  Users,
  Clock,
  Star,
  Filter,
  Search,
  Activity,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { formatPrice, formatNumber } from '@/lib/utils';
import toast from 'react-hot-toast';
import AIAnalysisPanel from '../components/ai/AIAnalysisPanel';
import { stockAPI } from '../utils/api';

interface IPO {
  id: string | number;
  company: string;
  symbol: string;
  exchange?: string;
  sector?: string;
  priceRange: string;
  shares?: number;
  estimatedValue?: number;
  filingDate?: string;
  expectedDate?: string;
  openDate?: string;
  closeDate?: string;
  listingDate?: string;
  status: string;
  underwriters?: string[];
  description?: string;
  logo?: string;
  offerType?: string;
}

export default function IPOsPage() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [filteredIpos, setFilteredIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recent' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('expectedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState({ total: 0, upcoming: 0, pricing: 0, totalValue: 0 });

  useEffect(() => {
    const fetchIpos = async () => {
      try {
        setLoading(true);
        const data = await stockAPI.getStockOffers();
        
        const mappedIpos: IPO[] = data.map((item: any) => ({
          id: item.id,
          company: item.companyName || 'Unknown Company',
          symbol: item.symbol || '',
          exchange: 'N/A',
          sector: 'N/A',
          priceRange: item.priceRange || 'TBD',
          shares: 0,
          estimatedValue: 0,
          openDate: item.openDate,
          closeDate: item.closeDate,
          listingDate: item.listingDate,
          expectedDate: item.listingDate || item.closeDate || item.openDate,
          status: item.status || 'upcoming',
          offerType: item.offerType || 'IPO',
          underwriters: [],
          description: `${item.offerType || 'IPO'} offering for ${item.companyName || item.symbol}`
        }));
        
        setIpos(mappedIpos);
        setFilteredIpos(mappedIpos);
        
        const upcoming = mappedIpos.filter(i => i.status === 'upcoming').length;
        const pricing = mappedIpos.filter(i => i.status === 'pricing').length;
        setStats({ total: mappedIpos.length, upcoming, pricing, totalValue: 0 });
      } catch (error) {
        console.error('Error fetching IPOs:', error);
        toast.error('Failed to load IPO data');
        setIpos([]);
        setFilteredIpos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIpos();
  }, []);

  useEffect(() => {
    let filtered = ipos.filter(ipo => {
      const matchesSearch = ipo.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ipo.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ipo.sector && ipo.sector.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTab = activeTab === 'all' ||
        (activeTab === 'upcoming' && ['upcoming', 'pricing', 'open'].includes(ipo.status)) ||
        (activeTab === 'recent' && ['trading', 'listed', 'closed'].includes(ipo.status));

      return matchesSearch && matchesTab;
    });

    filtered.sort((a, b) => {
      const aValue = a.expectedDate || '';
      const bValue = b.expectedDate || '';
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    setFilteredIpos(filtered);
  }, [ipos, searchTerm, activeTab, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Upcoming' },
      pricing: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Pricing' },
      open: { bg: 'bg-green-100', text: 'text-green-700', label: 'Open' },
      trading: { bg: 'bg-green-100', text: 'text-green-700', label: 'Trading' },
      listed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Listed' },
      closed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Closed' },
      withdrawn: { bg: 'bg-red-100', text: 'text-red-700', label: 'Withdrawn' }
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.upcoming;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Activity className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Loading IPO Data</h2>
              <p className="text-gray-600">Please wait while we fetch the latest IPO information...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="p-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Initial Public Offerings
              </h1>
              <p className="text-xl text-gray-600">
                Track upcoming IPOs, recent listings, and investment opportunities
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <span className="text-sm text-gray-500">This Month</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
                <p className="text-sm text-gray-600">Upcoming offers</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <span className="text-sm text-gray-500">Total Value</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total offers</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <span className="text-sm text-gray-500">Avg Performance</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.pricing}</p>
                <p className="text-sm text-gray-600">In pricing stage</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Building2 className="h-8 w-8 text-orange-600" />
                  <span className="text-sm text-gray-500">Sectors</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{filteredIpos.length}</p>
                <p className="text-sm text-gray-600">Filtered results</p>
              </div>
            </motion.div>

            {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
            >
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  {['upcoming', 'recent', 'all'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${activeTab === tab
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search IPOs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>

            {/* IPO Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {filteredIpos.map((ipo, index) => (
                <motion.div
                  key={ipo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all card-hover"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{ipo.company}</h3>
                        <p className="text-sm text-gray-600">{ipo.symbol} • {ipo.exchange}</p>
                      </div>
                    </div>
                    {getStatusBadge(ipo.status)}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">{ipo.description}</p>
                    {ipo.offerType && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {ipo.offerType}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Price Range</p>
                      <p className="font-semibold text-gray-900">{ipo.priceRange}</p>
                    </div>
                    {ipo.openDate && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Open Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(ipo.openDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {ipo.closeDate && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Close Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(ipo.closeDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {ipo.listingDate && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Listing Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(ipo.listingDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {ipo.underwriters && ipo.underwriters.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Lead Underwriters</p>
                      <div className="flex flex-wrap gap-1">
                        {ipo.underwriters.slice(0, 2).map((underwriter) => (
                          <span
                            key={underwriter}
                            className="inline-flex px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
                          >
                            {underwriter}
                          </span>
                        ))}
                        {ipo.underwriters.length > 2 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                            +{ipo.underwriters.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
                      <Star className="h-4 w-4" />
                      <span className="text-sm font-medium">Add to Watchlist</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                      <span className="text-sm font-medium">View Details</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {filteredIpos.length === 0 && (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No IPOs found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>

          {/* AI Analysis Sidebar */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="xl:sticky xl:top-4">
              <AIAnalysisPanel
                title="IPO Insights"
                pageType="ipos"
                pageData={{
                  upcomingCount: ipos.filter(i => i.status === 'upcoming').length,
                  pricingCount: ipos.filter(i => i.status === 'pricing').length,
                  totalValue: ipos.reduce((sum, i) => sum + i.estimatedValue, 0),
                  sectors: Array.from(new Set(ipos.map(i => i.sector))),
                  topIPOs: ipos.slice(0, 3).map(i => ({
                    company: i.company,
                    symbol: i.symbol,
                    value: i.estimatedValue,
                    status: i.status
                  }))
                }}
                autoAnalyze={!loading && ipos.length > 0}
                quickPrompts={[
                  'Best IPO opportunities',
                  'Sector analysis',
                  'Risk assessment'
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