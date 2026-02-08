'use client';

import { useState } from 'react';
import { Search, Bell } from 'lucide-react';

interface SharedHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
}

export default function SharedHeader({ title = "STOCK ANALYSIS", subtitle, showSearch = true }: SharedHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-pearto-card border-b border-gray-200 dark:border-pearto-border shadow-lg backdrop-blur-sm bg-white dark:bg-pearto-card/95 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div>
                <span className="text-xl font-bold text-gray-900 dark:text-pearto-luna transition-colors duration-300">{title?.split(' ')[0] || "STOCK"}</span>
                <span className="text-xl font-normal text-gray-600 dark:text-pearto-cloud ml-1 transition-colors duration-300">{title?.split(' ').slice(1).join(' ') || "ANALYSIS"}</span>
                <div className="text-xs text-gray-500 dark:text-pearto-gray transition-colors duration-300">{subtitle || "Professional Platform"}</div>
              </div>
            </div>
            
            {showSearch && (
              <div className="relative ml-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks, ETFs, indices..."
                  className="w-96 pl-12 pr-4 py-3 border border-gray-300 dark:border-pearto-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 dark:bg-pearto-surface focus:bg-white dark:bg-pearto-card transition-colors"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                  Ctrl+K
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-50 dark:bg-pearto-green/100 rounded-full animate-pulse transition-colors duration-300"></div>
                <span className="text-gray-600 dark:text-pearto-cloud transition-colors duration-300">Market Open</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600 dark:text-pearto-cloud transition-colors duration-300">Last updated: {lastUpdate}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 dark:text-pearto-cloud hover:text-gray-900 dark:text-pearto-luna hover:bg-gray-100 dark:bg-pearto-surface rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="text-gray-600 dark:text-pearto-cloud hover:text-gray-900 dark:text-pearto-luna text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:bg-pearto-surface transition-colors">
                Log Out
              </button>
              <button className="bg-blue-600 dark:bg-pearto-blue text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-pearto-blue-hover transition-colors">
                My Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}