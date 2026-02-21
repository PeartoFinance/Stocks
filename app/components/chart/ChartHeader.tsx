'use client';

import React from 'react';
import { RefreshCw, Brain, Maximize2, Radio } from 'lucide-react';
import Link from 'next/link';

interface ChartHeaderProps {
  symbol: string;
  period: string;
  dataLength: number;
  loading: boolean;
  onRefresh: () => void;
  onAIAnalysis: () => void;
  onCompare: () => void;
  onFullscreen: () => void;
  className?: string;
}

export default function ChartHeader({
  symbol,
  period,
  dataLength,
  loading,
  onRefresh,
  onAIAnalysis,
  onCompare,
  onFullscreen,
  className = ''
}: ChartHeaderProps) {
  return (
    <div className={`px-3 sm:px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
            {symbol} - {period} Chart
          </h3>
          <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">
            {dataLength} points • {period === '1D' ? '1-min' : 'Daily'}
          </span>
          <button
            onClick={onAIAnalysis}
            className="hidden sm:flex ml-4 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors items-center gap-1"
          >
            <Brain className="h-3 w-3" />
            AI Analysis
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAIAnalysis}
            className="sm:hidden p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="AI Analysis"
          >
            <Brain className="h-4 w-4" />
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onFullscreen}
            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Open Fullscreen Chart"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <Link
            href={`${process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://pearto.com'}/live?symbol=btc&type=crypto`}
            className="flex px-2 sm:px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors items-center gap-1"
            title="Live Chart"
          >
            <Radio className="h-3 w-3" />
            <span className="hidden sm:inline">Live</span>
          </Link>
          <button
            className="hidden sm:flex px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors items-center gap-1"
            onClick={onCompare}
            title="Compare"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}
