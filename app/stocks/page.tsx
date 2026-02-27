'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Activity, BarChart3
} from 'lucide-react';
import AllStocks from '../components/stocks/AllStocks';
import Gainers from '../components/stocks/Gainers';
import Losers from '../components/stocks/Losers';
import Trending from '../components/stocks/Trending';

type TabType = 'all' | 'gainers' | 'losers' | 'trending';

export default function StockScreener() {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const tabs = [
    { id: 'all' as TabType, label: 'All Stocks', icon: BarChart3 },
    { id: 'gainers' as TabType, label: 'Gainers', icon: TrendingUp },
    { id: 'losers' as TabType, label: 'Losers', icon: TrendingDown },
    { id: 'trending' as TabType, label: 'Trending', icon: Activity },
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="p-4 lg:p-6 space-y-6 w-full">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Stocks
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Browse and analyze stocks, track top movers
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition ${isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

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
    </div>
  );
}