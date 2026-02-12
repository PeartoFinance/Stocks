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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-[2560px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 py-4 sm:py-6 lg:py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-pearto-luna transition-colors duration-300">Stock Market</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-pearto-cloud mt-1 sm:mt-2 transition-colors duration-300">Explore stocks, gainers, losers, and trending assets</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border p-1 mb-4 sm:mb-6 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
                    isActive
                      ? `text-white shadow-sm`
                      : 'text-gray-600 dark:text-pearto-cloud hover:text-gray-900 dark:hover:text-pearto-luna hover:bg-gray-50 dark:hover:bg-pearto-surface'
                  }`}
                  style={{
                    backgroundColor: isActive ? 
                      (tab.color === 'blue' ? '#2563eb' : 
                       tab.color === 'green' ? '#0aff8d' : 
                       tab.color === 'red' ? '#e02d75' : 
                       tab.color === 'purple' ? '#9333ea' : undefined) : undefined
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
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