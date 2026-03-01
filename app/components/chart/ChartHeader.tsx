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
    <div className={`px-3 sm:px-4 py-3 border-b border-gray-200 dark:border-slate-700 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            {symbol} - {period} Chart
          </h3>
          <span className="hidden sm:inline text-sm text-slate-500 dark:text-slate-400">
            {dataLength} points • {period === '1D' ? '1-min' : 'Daily'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onFullscreen}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
            title="Open Detailed Chart"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="text-sm font-medium">Detailed Chart</span>
          </button>
          <button
            onClick={onAIAnalysis}
            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md"
            title="AI Analysis"
          >
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline text-sm font-medium">AI</span>
          </button>
          <button
            onClick={onFullscreen}
            className="sm:hidden p-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            title="Open Detailed Chart"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
          <Link
            href={`${process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://pearto.com'}/live?symbol=${symbol}&type=stock`}
            className="flex px-2 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors items-center gap-2 border border-red-700"
            title="Live Chart"
          >
            <Radio className="h-4 w-4" />
            <span className="hidden sm:inline">Live</span>
          </Link>
          <button
            className="hidden sm:flex px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors items-center gap-2 border border-slate-300 dark:border-slate-600"
            onClick={onCompare}
            title="Compare"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}
