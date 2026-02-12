'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { TrendingStocks, TrendingCrypto } from '../components/trending';

export default function TrendingPage() {
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto'>('stocks');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header with Toggle */}
      <div className="bg-white dark:bg-pearto-card border-b border-gray-200 dark:border-pearto-border shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-pearto-luna transition-colors duration-300">
                Trending Markets
              </h1>
              <p className="text-sm text-gray-600 dark:text-pearto-cloud mt-1 transition-colors duration-300">
                Discover the most talked about and actively traded assets
              </p>
            </div>
            
            {/* Toggle Buttons */}
            <div className="flex bg-gray-100 dark:bg-pearto-surface rounded-lg p-1 transition-colors duration-300">
              <button
                onClick={() => setActiveTab('stocks')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === 'stocks'
                    ? 'bg-blue-600 dark:bg-pearto-green text-white shadow-sm'
                    : 'text-gray-600 dark:text-pearto-cloud hover:text-gray-900 dark:hover:text-pearto-luna'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Stocks
              </button>
              <button
                onClick={() => setActiveTab('crypto')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === 'crypto'
                    ? 'bg-orange-600 dark:bg-pearto-pink text-white shadow-sm'
                    : 'text-gray-600 dark:text-pearto-cloud hover:text-gray-900 dark:hover:text-pearto-luna'
                }`}
              >
                <Activity className="h-4 w-4" />
                Crypto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
        {activeTab === 'stocks' ? (
          <TrendingStocks />
        ) : (
          <TrendingCrypto />
        )}
      </div>
    </div>
  );
}