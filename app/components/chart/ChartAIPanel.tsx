'use client';

import React from 'react';
import { Brain } from 'lucide-react';
import AIAnalysisPanel from '../ai/AIAnalysisPanel';

interface ChartAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stockInfo: any;
  period: string;
  chartType: 'area' | 'candlestick' | 'line' | 'mountain';
  dataLength: number;
}

export default function ChartAIPanel({
  isOpen,
  onClose,
  stockInfo,
  period,
  chartType,
  dataLength
}: ChartAIPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Sliding AI Panel */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* AI Panel Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Analysis</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* AI Panel Content */}
          <div className="flex-1 overflow-y-auto">
            <AIAnalysisPanel
              title=""
              pageType="chart"
              pageData={{
                symbol: stockInfo?.symbol,
                name: stockInfo?.name,
                price: stockInfo?.price,
                change: stockInfo?.change,
                changePercent: stockInfo?.changePercent,
                volume: stockInfo?.volume,
                period: period,
                chartType: chartType,
                dataPoints: dataLength
              }}
              quickPrompts={[
                "Analyze chart pattern",
                "Predict price movement",
                "Support/resistance levels",
                "Market sentiment",
                "Risk analysis"
              ]}
              compact={false}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40"
        onClick={onClose}
      />
    </>
  );
}
