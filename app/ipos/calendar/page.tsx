'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, Building2, DollarSign, Users } from 'lucide-react';

interface UpcomingIPO {
  company: string;
  symbol: string;
  expectedDate: string;
  priceRange: string;
  shares: string;
  sector: string;
  exchange: string;
  status: 'Filed' | 'Priced' | 'Expected' | 'Postponed';
  description: string;
}

export default function IPOCalendar() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const upcomingIPOs: UpcomingIPO[] = [
    {
      company: 'TechStart Solutions Inc.',
      symbol: 'TECH',
      expectedDate: '2025-11-25',
      priceRange: '$18-22',
      shares: '15M',
      sector: 'Technology',
      exchange: 'NASDAQ',
      status: 'Expected',
      description: 'Cloud-based software solutions for small businesses'
    },
    {
      company: 'GreenEnergy Corp',
      symbol: 'GREEN',
      expectedDate: '2025-11-28',
      priceRange: '$25-30',
      shares: '20M',
      sector: 'Renewable Energy',
      exchange: 'NYSE',
      status: 'Filed',
      description: 'Solar and wind energy development and manufacturing'
    },
    {
      company: 'HealthTech Innovations',
      symbol: 'HLTH',
      expectedDate: '2025-12-02',
      priceRange: '$12-16',
      shares: '10M',
      sector: 'Healthcare',
      exchange: 'NASDAQ',
      status: 'Expected',
      description: 'AI-powered diagnostic and treatment platforms'
    },
    {
      company: 'FinanceFlow Systems',
      symbol: 'FLOW',
      expectedDate: '2025-12-05',
      priceRange: '$15-20',
      shares: '12M',
      sector: 'Financial Services',
      exchange: 'NYSE',
      status: 'Priced',
      description: 'Digital payment processing and financial technology'
    },
    {
      company: 'EcoMaterials Ltd',
      symbol: 'ECO',
      expectedDate: '2025-12-10',
      priceRange: '$20-25',
      shares: '8M',
      sector: 'Materials',
      exchange: 'NASDAQ',
      status: 'Filed',
      description: 'Sustainable building materials and construction solutions'
    },
    {
      company: 'DataStream Analytics',
      symbol: 'DATA',
      expectedDate: '2025-12-15',
      priceRange: '$30-35',
      shares: '18M',
      sector: 'Technology',
      exchange: 'NYSE',
      status: 'Postponed',
      description: 'Big data analytics and machine learning platforms'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Filed':
        return 'bg-blue-100 text-blue-800';
      case 'Priced':
        return 'bg-green-100 text-green-800';
      case 'Expected':
        return 'bg-yellow-100 text-yellow-800';
      case 'Postponed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-pearto-luna">IPO Calendar</h1>
            <p className="text-gray-600 dark:text-pearto-cloud mt-2">Upcoming IPOs and important filing dates</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-pearto-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-pearto-card rounded-xl p-6 border border-gray-200 dark:border-pearto-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-pearto-cloud">Upcoming IPOs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-pearto-luna">{upcomingIPOs.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-pearto-card rounded-xl p-6 border border-gray-200 dark:border-pearto-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-pearto-cloud">Expected This Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-pearto-luna">3</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-pearto-card rounded-xl p-6 border border-gray-200 dark:border-pearto-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-pearto-cloud">Total Shares</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-pearto-luna">83M</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-pearto-card rounded-xl p-6 border border-gray-200 dark:border-pearto-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-pearto-cloud">Est. Proceeds</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-pearto-luna">$1.8B</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-pearto-border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-pearto-luna">Upcoming IPOs</h3>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {upcomingIPOs.map((ipo, index) => (
                <motion.div
                  key={ipo.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-pearto-border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-pearto-luna">{ipo.company}</h4>
                        <span className="text-sm font-medium text-blue-600">({ipo.symbol})</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ipo.status)}`}>
                          {ipo.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-pearto-cloud mb-3">{ipo.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-pearto-gray">
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4" />
                          <span>{ipo.sector}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Exchange: {ipo.exchange}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Shares: {ipo.shares}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:text-right space-y-2">
                      <div className="flex items-center space-x-2 lg:justify-end">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-pearto-luna">{formatDate(ipo.expectedDate)}</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-pearto-luna">{ipo.priceRange}</div>
                      <div className="text-sm text-gray-500 dark:text-pearto-gray">Price Range</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Impact */}
        <div className="bg-white dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-pearto-luna mb-4">Market Impact Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-pearto-luna mb-3">Sector Distribution</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-pearto-cloud">Technology</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-pearto-cloud">Healthcare</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-pearto-cloud">Energy</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-pearto-luna mb-3">Key Insights</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-pearto-cloud">Technology sector dominates upcoming IPOs with 60% of total offerings</p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-pearto-cloud">Average price range indicates strong investor confidence</p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-pearto-cloud">Q4 2025 expected to be active period for public offerings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}