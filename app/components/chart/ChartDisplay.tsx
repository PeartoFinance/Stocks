'use client';

import React from 'react';
import { Activity, Brain } from 'lucide-react';
import StockChart from '../StockChart';
import { HistoricalData } from '../../types';

interface ChartDisplayProps {
  data: HistoricalData[];
  processedData: HistoricalData[];
  loading: boolean;
  symbol: string;
  chartType: 'area' | 'candlestick' | 'line' | 'mountain';
  isPositive: boolean;
  isFullscreen: boolean;
  showVolumeProfile: boolean;
  showMovingAverages: boolean;
  showGaps: boolean;
  showCorrelation: boolean;
  percentMode: boolean;
  movingAveragesData: any[];
  volumeProfileData: any[];
  priceGapsData: any[];
  formatPrice: (price: number) => string;
  onToggleFullscreen: () => void;
  className?: string;
}

export default function ChartDisplay({
  data,
  processedData,
  loading,
  symbol,
  chartType,
  isPositive,
  isFullscreen,
  showVolumeProfile,
  showMovingAverages,
  showGaps,
  showCorrelation,
  percentMode,
  movingAveragesData,
  volumeProfileData,
  priceGapsData,
  formatPrice,
  onToggleFullscreen,
  className = ''
}: ChartDisplayProps) {
  if (loading) {
    return (
      <div className={`h-96 md:h-[500px] flex items-center justify-center text-gray-500 dark:text-gray-400 ${className}`}>
        <Activity className="h-8 w-8 animate-spin mr-3" />
        <span className="text-sm">Loading chart data...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`h-96 md:h-[500px] flex items-center justify-center text-gray-500 dark:text-gray-400 ${className}`}>
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Search for a Stock</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Enter a stock symbol or name to view its chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Chart Container */}
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900 dark:bg-slate-900 p-8' : ''}`}>
        {isFullscreen && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-100 dark:text-white">{symbol} - Fullscreen Chart</h2>
            <button
              onClick={() => onToggleFullscreen()}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className={`${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96 md:h-[500px]'} relative`}>
          <StockChart
            data={processedData}
            isPositive={isPositive}
            height={isFullscreen ? window.innerHeight - 120 : 384}
            chartType={chartType}
          />

          {/* Moving Averages Overlay */}
          {showMovingAverages && movingAveragesData.length > 0 && (
            <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-2 rounded text-xs">
              <div className="font-semibold mb-1 text-gray-900 dark:text-gray-100">MA Ribbon</div>
              {movingAveragesData.map((ma: any) => (
                <div key={ma.period} className="flex items-center gap-2">
                  <div className={`w-3 h-0.5 ${ma.period === 8 ? 'bg-blue-500' :
                      ma.period === 13 ? 'bg-green-500' :
                        ma.period === 21 ? 'bg-orange-500' :
                          'bg-red-500'
                    }`} />
                  <span className="text-gray-700 dark:text-gray-300">MA{ma.period}: {ma.data.length > 0 ? formatPrice(ma.data[ma.data.length - 1].value) : 'N/A'}</span>
                </div>
              ))}
            </div>
          )}

          {/* Volume Profile Overlay */}
          {showVolumeProfile && volumeProfileData.length > 0 && (
            <div className="absolute top-2 right-12 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-2 rounded text-xs max-w-32">
              <div className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Volume Profile</div>
              {volumeProfileData.slice(-5).map((vp: any, i: number) => (
                <div key={i} className="flex justify-between gap-2 text-gray-700 dark:text-gray-300">
                  <span>{formatPrice(vp.price)}</span>
                  <span>{(vp.volume / 1e6).toFixed(1)}M</span>
                </div>
              ))}
            </div>
          )}

          {/* Price Gaps Overlay */}
          {showGaps && priceGapsData.length > 0 && (
            <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-2 rounded text-xs">
              <div className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Price Gaps</div>
              {priceGapsData.slice(0, 3).map((gap: any, i: number) => (
                <div key={i} className={`flex items-center gap-1 ${gap.isGapUp ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{gap.isGapUp ? '↑' : '↓'}</span>
                  <span className="text-gray-700 dark:text-gray-300">{gap.gapPercent.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Percent Mode Indicator */}
          {percentMode && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
              Percentage Mode (%)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
