'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  DollarSign, 
  Volume2,
  Hash,
  Target,
  Globe,
  ExternalLink
} from 'lucide-react';
import StockChart from '../StockChart';
import RiskAnalysisChart from './RiskAnalysisChart';
import AIAnalysisPanel from '../ai/AIAnalysisPanel';

interface CryptoDetails {
  id: number;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume: number;
  change: number;
  changePercent: number;
  dayHigh?: number;
  dayLow?: number;
  high52w?: number;
  low52w?: number;
  avgVolume?: number;
  open?: number;
  previousClose?: number;
  lastUpdated: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  currency: string;
  assetType: string;
  countryCode: string;
  isFeatured: boolean;
  isListed: boolean;
  circulatingSupply?: number;
  maxSupply?: number;
}

interface HistoricalData {
  time: string;
  price: number;
  volume: number;
  marketCap: number;
}

interface OverviewTabProps {
  crypto: CryptoDetails;
  historicalData: HistoricalData[];
  chartPeriod: string;
  chartType: 'area' | 'candlestick' | 'line' | 'mountain';
  onPeriodChange: (period: string) => void;
  onChartTypeChange: (type: 'area' | 'candlestick' | 'line' | 'mountain') => void;
  chartLoading: boolean;
}

export default function OverviewTab({ 
  crypto, 
  historicalData, 
  chartPeriod, 
  chartType, 
  onPeriodChange, 
  onChartTypeChange,
  chartLoading 
}: OverviewTabProps) {
  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${volume.toLocaleString()}`;
  };

  const formatNumber = (num: number | undefined | null, decimals = 2): string => {
    if (num == null) return '-';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const periods = ['1D', '1W', '1M', '3M', '1Y', '5Y'];
  const chartTypes = [
    { key: 'area', label: 'Area', icon: BarChart3 },
    { key: 'line', label: 'Line', icon: TrendingUp },
    { key: 'mountain', label: 'Mountain', icon: BarChart3 },
  ];

  const isPositive = crypto.change >= 0;

  return (
    <div className="space-y-6">
      {/* Mobile Compact Stats */}
      <div className="lg:hidden space-y-3 mb-4">
        {/* Today's Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 transition-colors duration-300">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">Today's Stats</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Open", val: crypto.open, icon: TrendingUp },
              { label: "High", val: crypto.dayHigh, icon: TrendingUp },
              { label: "Low", val: crypto.dayLow, icon: TrendingDown },
              { label: "Prev Close", val: crypto.previousClose, icon: BarChart3 },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg transition-colors duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">{item.label}</span>
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-white transition-colors duration-300">
                  {typeof item.val === 'number' ? formatPrice(item.val) : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Volume Stats */}
        <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 transition-colors duration-300">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">Volume & Supply</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Volume 24h", val: formatVolume(crypto.volume) },
              { label: "Circulating Supply", val: crypto.circulatingSupply ? `${(crypto.circulatingSupply / 1e6).toFixed(1)}M` : "N/A" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg transition-colors duration-300">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 transition-colors duration-300">{item.label}</span>
                <p className="text-base font-bold text-slate-900 dark:text-white transition-colors duration-300">{item.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 transition-colors duration-300">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">Key Metrics</h3>
          <div className="space-y-2">
            {[
              { label: 'Market Cap', value: formatMarketCap(crypto.marketCap) },
              { label: 'Max Supply', value: crypto.maxSupply ? `${(crypto.maxSupply / 1e6).toFixed(1)}M` : '∞' },
              { label: 'Market Cap Rank', value: `#${crypto.id}` },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-colors duration-300">
                <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">{item.label}</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white transition-colors duration-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Stats + Chart + AI Analysis Grid */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4 mb-5">
        {/* Key Stats */}
        <div className="lg:col-span-1 bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 transition-colors duration-300">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 transition-colors duration-300">
            Key Statistics
          </h3>
          <div className="space-y-1">
            {[
              { label: 'Market Cap', value: formatMarketCap(crypto.marketCap) },
              { label: 'Volume 24h', value: formatVolume(crypto.volume) },
              { label: 'Circulating Supply', value: crypto.circulatingSupply ? `${(crypto.circulatingSupply / 1e6).toFixed(1)}M` : '-' },
              { label: 'Max Supply', value: crypto.maxSupply ? `${(crypto.maxSupply / 1e6).toFixed(1)}M` : '∞' },
              { label: 'Market Cap Rank', value: `#${crypto.id}` },
              { label: 'Open', value: crypto.open ? formatPrice(crypto.open) : '-' },
              { label: 'Day High', value: crypto.dayHigh ? formatPrice(crypto.dayHigh) : '-' },
              { label: 'Day Low', value: crypto.dayLow ? formatPrice(crypto.dayLow) : '-' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-colors duration-300">
                <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">{item.label}</span>
                <span className="text-xs font-medium text-slate-900 dark:text-white transition-colors duration-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-3">
          <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 transition-colors duration-300">
            {/* Chart Controls */}
            <div className="mb-4 p-3 bg-slate-50 dark:bg-gray-700/50 rounded-xl border border-slate-100 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700  dark:text-pearto-cloud transition-colors duration-300">Duration</span>
                  <div className="flex bg-white  dark:bg-pearto-card rounded-lg p-1 border border-slate-200 dark:border-pearto-border overflow-x-auto transition-colors duration-300">
                    {periods.map((p) => (
                      <button
                        key={p}
                        onClick={() => onPeriodChange(p)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          chartPeriod === p ? "bg-emerald-600 dark:bg-pearto-pink text-white shadow-sm" : "text-slate-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${
                  isPositive ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50 dark:bg-pearto-pink/10"
                }`}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {isPositive ? '+' : ''}{formatNumber(crypto.change)} ({isPositive ? '+' : ''}{formatNumber(crypto.changePercent)}%)
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700  dark:text-pearto-cloud transition-colors duration-300">Type</span>
                <div className="flex bg-white  dark:bg-pearto-card rounded-lg p-1 border border-slate-200 dark:border-pearto-border transition-colors duration-300">
                  {chartTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => onChartTypeChange(type.key as any)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        chartType === type.key ? "bg-blue-600 dark:bg-pearto-blue text-white shadow-sm" : "text-slate-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <type.icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className="h-80 relative">
              {chartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 dark:bg-pearto-card/50 z-10 transition-colors duration-300">
                  <Activity className="h-8 w-8 text-emerald-600 dark:text-pearto-green animate-spin transition-colors duration-300" />
                </div>
              ) : null}
              {historicalData.length > 0 ? (
                <StockChart 
                  data={historicalData.map(item => ({
                    date: item.time,
                    open: item.price,
                    high: item.price,
                    low: item.price,
                    close: item.price,
                    volume: item.volume
                  }))} 
                  isPositive={isPositive} 
                  height={320} 
                  chartType={chartType} 
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-400 transition-colors duration-300">
                  No data available for this period.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Risk Analysis Chart */}
        <div className="lg:col-span-1">
          <RiskAnalysisChart crypto={crypto} />
        </div>
      </div>

      {/* Mobile Chart */}
      <div className="lg:hidden">
        <div className="bg-white rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-colors duration-300">
          {/* Mobile Chart Header */}
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${
              isPositive ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50 dark:bg-pearto-pink/10"
            }`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isPositive ? '+' : ''}{formatNumber(crypto.change)} ({isPositive ? '+' : ''}{formatNumber(crypto.changePercent)}%)
            </div>
          </div>

          {/* Period Selector */}
          <div className="mb-3 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => onPeriodChange(p)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    chartPeriod === p 
                      ? "bg-emerald-600 dark:bg-pearto-pink text-white shadow-sm" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 relative">
            {chartLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 dark:bg-pearto-card/50 z-10 transition-colors duration-300">
                <Activity className="h-6 w-6 text-emerald-600 dark:text-pearto-green animate-spin transition-colors duration-300" />
              </div>
            ) : null}
            {historicalData.length > 0 ? (
              <StockChart 
                data={historicalData.map(item => ({
                  date: item.time,
                  open: item.price,
                  high: item.price,
                  low: item.price,
                  close: item.price,
                  volume: item.volume
                }))} 
                isPositive={isPositive} 
                height={256} 
                chartType={chartType} 
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50  dark:bg-gray-700 rounded-lg text-gray-400 text-sm transition-colors duration-300">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Risk Analysis */}
      <div className="lg:hidden mt-4">
        <RiskAnalysisChart crypto={crypto} />
      </div>

      {/* About Section */}
      <div className="bg-white  dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-pearto-green transition-colors duration-300" />
          </div>
          <h3 className="text-base lg:text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">
            About {crypto.name}
          </h3>
        </div>
        
        {/* Company Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Description */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Overview</h4>
            {crypto.description ? (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">
                {crypto.description}
              </p>
            ) : (
              <p className="text-sm text-slate-400">No description available for this cryptocurrency.</p>
            )}
          </div>
          
          {/* Crypto Details */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 transition-colors duration-300">Details</h4>
            <div className="space-y-2">
              {[
                { label: 'Symbol', value: crypto.symbol },
                { label: 'Asset Type', value: crypto.assetType },
                { label: 'Currency', value: crypto.currency },
                { label: 'Country', value: crypto.countryCode },
                { label: 'Website', value: crypto.website ? 'Available' : '-' },
              ].map((item, i) => (
                item.value && (
                  <div key={i} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors duration-300">
                    <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">{item.label}</span>
                    {item.label === 'Website' && crypto.website ? (
                      <a href={crypto.website} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-emerald-600 dark:text-pearto-green hover:text-emerald-500 flex items-center gap-1 transition-colors duration-300">
                        Visit Site
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs font-medium text-slate-900 dark:text-white transition-colors duration-300">{item.value}</span>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Panel - Bottom (Mobile Only) */}
      <div className="lg:hidden mt-6">
        <AIAnalysisPanel
          title={`${crypto.name} AI Analysis`}
          pageType="crypto-detail"
          pageData={{
            symbol: crypto.symbol,
            name: crypto.name,
            price: crypto.price,
            change: crypto.changePercent,
            volume: crypto.volume,
            marketCap: crypto.marketCap,
            assetType: crypto.assetType,
            high: crypto.dayHigh,
            low: crypto.dayLow,
            isFeatured: crypto.isFeatured
          } as any}
          autoAnalyze={true}
          quickPrompts={[
            `Is ${crypto.symbol} a good investment?`,
            'Technical analysis and price prediction',
            'Market sentiment and trends',
            'Risk assessment and volatility analysis'
          ]}
          compact={false}
          maxHeight="600px"
        />
      </div>
    </div>
  );
}
