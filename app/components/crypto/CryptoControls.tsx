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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search cryptocurrencies..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
          />
        </div>
        
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => onTabChange('all')}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                selectedTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onTabChange('gainers')}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                selectedTab === 'gainers'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/25 scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🚀 Top Gainers
            </button>
            <button
              onClick={() => onTabChange('losers')}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                selectedTab === 'losers'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/25 scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📉 Top Losers
            </button>
          </div>

          {/* View Mode and Refresh */}
          <div className="flex gap-2 items-center">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => onViewModeChange('table')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewModeChange('heatmap')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'heatmap'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Heatmap View"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
