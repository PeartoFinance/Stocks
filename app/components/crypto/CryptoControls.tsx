'use client';

import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Grid, List } from 'lucide-react';

interface CryptoControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTab: 'all' | 'gainers' | 'losers';
  onTabChange: (tab: 'all' | 'gainers' | 'losers') => void;
  viewMode: 'table' | 'heatmap';
  onViewModeChange: (mode: 'table' | 'heatmap') => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export default function CryptoControls({ 
  searchQuery, 
  onSearchChange, 
  selectedTab, 
  onTabChange, 
  viewMode,
  onViewModeChange,
  onRefresh,
  refreshing 
}: CryptoControlsProps) {
  return (
    <div className="bg-gradient-to-r from-white via-emerald-50/30 to-white dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-emerald-200 dark:border-slate-700 p-2 sm:p-4 transition-all duration-300">
      <div className="flex flex-col gap-2">
        {/* Search Bar - Full width on mobile */}
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 bg-white dark:bg-slate-700 border border-emerald-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-slate-900 dark:text-white placeholder-gray-400 text-xs sm:text-sm transition-all duration-300 shadow-sm"
          />
        </div>
        
        {/* Controls Row - Compact on mobile */}
        <div className="flex gap-1.5 sm:gap-2 items-center justify-between">
          {/* Tab Navigation - Smaller pills on mobile */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-0.5 sm:p-1 rounded-lg sm:rounded-xl">
            <button
              onClick={() => onTabChange('all')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg font-medium transition-all duration-200 text-[10px] sm:text-xs ${
                selectedTab === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onTabChange('gainers')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg font-medium transition-all duration-200 text-[10px] sm:text-xs ${
                selectedTab === 'gainers'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-gray-600'
              }`}
            >
              <span className="hidden sm:inline">Gainers</span>
              <span className="sm:hidden">↑</span>
            </button>
            <button
              onClick={() => onTabChange('losers')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg font-medium transition-all duration-200 text-[10px] sm:text-xs ${
                selectedTab === 'losers'
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-gray-600'
              }`}
            >
              <span className="hidden sm:inline">Losers</span>
              <span className="sm:hidden">↓</span>
            </button>
          </div>

          {/* View Mode Toggle - Smaller on mobile */}
          <div className="flex bg-slate-100 dark:bg-slate-700 p-0.5 sm:p-1 rounded-lg sm:rounded-xl">
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'
              }`}
              title="Table View"
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('heatmap')}
              className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg transition-all ${
                viewMode === 'heatmap'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'
              }`}
              title="Heatmap View"
            >
              <Grid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* Refresh Button - Icon only on mobile */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg sm:rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-md text-[10px] sm:text-xs font-medium"
          >
            <RefreshCw className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
