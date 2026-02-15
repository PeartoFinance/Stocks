'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Activity, List
} from 'lucide-react';
import AllStocks from '../components/stocks/AllStocks';
import Gainers from '../components/stocks/Gainers';
import Losers from '../components/stocks/Losers';
import Trending from '../components/stocks/Trending';
import ChartAnalysisWrapper from '../components/stocks/ChartAnalysisWrapper';

type TabType = 'all' | 'gainers' | 'losers' | 'trending';

export default function StockScreener() {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const tabs = [
    { id: 'all' as TabType, label: 'All Stocks', icon: List, color: 'blue' },
    { id: 'gainers' as TabType, label: 'Gainers', icon: TrendingUp, color: 'green' },
    { id: 'losers' as TabType, label: 'Losers', icon: TrendingDown, color: 'red' },
    { id: 'trending' as TabType, label: 'Trending', icon: Activity, color: 'purple' },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'all':
        return <AllStocks />;
      case 'gainers':
        return <Gainers />;
      case 'losers':
        return <Losers />;
      case 'trending':
        return <Trending />;
      default:
        return <AllStocks />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-[2560px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 py-4 sm:py-6 lg:py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Stock Market</h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 mt-1 sm:mt-2 transition-colors duration-300">Explore stocks, gainers, losers, and trending assets</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-blue-200 dark:border-gray-700 p-1 mb-3 sm:mb-4 md:mb-6 transition-colors duration-300">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 text-[10px] sm:text-sm md:text-base ${
                    isActive
                      ? `text-white shadow-md`
                      : 'text-slate-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-pearto-luna hover:bg-slate-50 dark:hover:bg-gray-700'
                  }`}
                  style={{
                    backgroundColor: isActive ? 
                      (tab.color === 'blue' ? '#2563eb' : 
                       tab.color === 'green' ? '#0aff8d' : 
                       tab.color === 'red' ? '#e02d75' : 
                       tab.color === 'purple' ? '#9333ea' : undefined) : undefined
                  }}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span className="xs:hidden truncate">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content - Desktop Flex Layout */}
        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 xl:max-w-[calc(100%-360px)]">
            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderActiveTab()}
            </motion.div>
          </div>

          {/* Chart Analysis Panel - Desktop Sidebar */}
          <div className="hidden xl:block w-[340px] flex-shrink-0">
            <div className="sticky top-8">
              <ChartAnalysisWrapper activeTab={activeTab} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}