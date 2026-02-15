'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { TrendingStocks, TrendingCrypto } from '../components/trending';

export default function TrendingPage() {
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto'>('stocks');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header with Toggle */}
      <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                Trending Markets
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                Discover the most talked about and actively traded assets
              </p>
            </div>
            
            {/* Toggle Buttons */}
            <div className="flex bg-slate-100 dark:bg-gray-700 rounded-lg p-1 transition-colors duration-300 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('stocks')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 flex-1 sm:flex-none ${
                  activeTab === 'stocks'
                    ? 'bg-blue-600 dark:bg-pearto-green text-white shadow-sm'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                Stocks
              </button>
              <button
                onClick={() => setActiveTab('crypto')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 flex-1 sm:flex-none ${
                  activeTab === 'crypto'
                    ? 'bg-orange-600 dark:bg-pearto-pink text-white shadow-sm'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                Crypto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 py-1">
        {activeTab === 'stocks' ? (
          <TrendingStocks />
        ) : (
          <TrendingCrypto />
        )}
      </div>
    </div>
  );
}