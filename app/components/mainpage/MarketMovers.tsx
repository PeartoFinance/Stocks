'use client';

import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number | string;
  peRatio?: number;
  sector?: string;
  isGainer?: boolean;
}

interface MarketMoversProps {
  topGainers: Stock[];
  topLosers: Stock[];
  trendingStocks: Stock[];
  selectedTab: 'gainers' | 'losers' | 'trending' | 'analysis';
  setSelectedTab: (tab: 'gainers' | 'losers' | 'trending' | 'analysis') => void;
  formatPrice: (price: number) => string;
  formatChange: (change: number, percent: number) => { value: string; isPositive: boolean };
  formatVolume: (vol: number) => string;
}

export default function MarketMovers({
  topGainers,
  topLosers,
  trendingStocks,
  selectedTab,
  setSelectedTab,
  formatPrice,
  formatChange,
  formatVolume
}: MarketMoversProps) {
  // Calculate real market analysis data from actual stocks
  const allStocks = [...topGainers, ...topLosers, ...trendingStocks];

  // Calculate real performance metrics
  const avgGain = topGainers.length > 0
    ? topGainers.reduce((sum, stock) => sum + stock.changePercent, 0) / topGainers.length
    : 0;
  const avgLoss = topLosers.length > 0
    ? topLosers.reduce((sum, stock) => sum + Math.abs(stock.changePercent), 0) / topLosers.length
    : 0;
  const totalVolume = allStocks.reduce((sum, stock) => sum + (stock.volume || 0), 0);
  const avgPrice = allStocks.length > 0
    ? allStocks.reduce((sum, stock) => sum + stock.price, 0) / allStocks.length
    : 0;

  // Real sector performance analysis from actual stock data
  const sectorPerformance = allStocks.reduce((acc, stock) => {
    if (stock.sector) {
      if (!acc[stock.sector]) {
        acc[stock.sector] = { total: 0, count: 0, changes: [], volumes: [], prices: [] };
      }
      acc[stock.sector].total += stock.changePercent;
      acc[stock.sector].count += 1;
      acc[stock.sector].changes.push(stock.changePercent);
      acc[stock.sector].volumes.push(stock.volume || 0);
      acc[stock.sector].prices.push(stock.price);
    }
    return acc;
  }, {} as Record<string, { total: number; count: number; changes: number[]; volumes: number[]; prices: number[] }>);

  const sectorAnalysis = Object.entries(sectorPerformance).map(([sector, data]) => ({
    sector,
    avgChange: data.total / data.count,
    volatility: data.changes.length > 1 ? Math.sqrt(data.changes.reduce((sum, change) => sum + Math.pow(change - (data.total / data.count), 2), 0) / data.changes.length) : 0,
    stockCount: data.count,
    avgVolume: data.volumes.reduce((sum, vol) => sum + vol, 0) / data.volumes.length,
    avgPrice: data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length
  })).sort((a, b) => b.stockCount - a.stockCount).slice(0, 6);

  // Real price range analysis from actual stock prices
  const priceRanges = {
    'Under $50': allStocks.filter(s => s.price < 50).length,
    '$50-$100': allStocks.filter(s => s.price >= 50 && s.price < 100).length,
    '$100-$500': allStocks.filter(s => s.price >= 100 && s.price < 500).length,
    'Over $500': allStocks.filter(s => s.price >= 500).length,
  };

  // Real volume distribution from actual trading volumes
  const highVolumeStocks = allStocks.filter(s => (s.volume || 0) > 1000000);
  const mediumVolumeStocks = allStocks.filter(s => (s.volume || 0) > 100000 && (s.volume || 0) <= 1000000);
  const lowVolumeStocks = allStocks.filter(s => (s.volume || 0) <= 100000);

  // Calculate neutral stocks (those not in top gainers or losers)
  const neutralStocks = allStocks.length - topGainers.length - topLosers.length;

  // Chart configurations using real data
  const marketSentimentData = {
    labels: ['Gainers', 'Losers', 'Neutral'],
    datasets: [{
      data: [topGainers.length, topLosers.length, neutralStocks],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(156, 163, 175, 0.8)',
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(156, 163, 175, 1)',
      ],
      borderWidth: 2,
    }]
  };

  const sectorDistributionData = {
    labels: sectorAnalysis.map(s => s.sector),
    datasets: [{
      data: sectorAnalysis.map(s => s.stockCount),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(250, 204, 21, 0.8)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(251, 146, 60, 1)',
        'rgba(147, 51, 234, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(250, 204, 21, 1)',
      ],
      borderWidth: 2,
    }]
  };

  const priceRangeData = {
    labels: Object.keys(priceRanges),
    datasets: [{
      data: Object.values(priceRanges),
      backgroundColor: [
        'rgba(168, 85, 247, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
      ],
      borderColor: [
        'rgba(168, 85, 247, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(251, 146, 60, 1)',
      ],
      borderWidth: 2,
    }]
  };

  const volumeDistributionData = {
    labels: ['High Volume', 'Medium Volume', 'Low Volume'],
    datasets: [{
      data: [highVolumeStocks.length, mediumVolumeStocks.length, lowVolumeStocks.length],
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(107, 114, 128, 0.8)',
      ],
      borderColor: [
        'rgba(245, 158, 11, 1)',
        'rgba(14, 165, 233, 1)',
        'rgba(107, 114, 128, 1)',
      ],
      borderWidth: 2,
    }]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          font: {
            size: 11
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          font: {
            size: 11
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Market Movers</h2>
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedTab('gainers')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedTab === 'gainers'
                ? 'bg-green-100 dark:bg-pearto-green/10 text-green-700'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white'
                }`}
            >
              Gainers
            </button>
            <button
              onClick={() => setSelectedTab('losers')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedTab === 'losers'
                ? 'bg-red-100 dark:bg-pearto-pink/10 text-red-700'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:text-white'
                }`}
            >
              Losers
            </button>
            <button
              onClick={() => setSelectedTab('trending')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedTab === 'trending'
                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'text-slate-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-pearto-luna'
                }`}
            >
              Trending
            </button>
            <button
              onClick={() => setSelectedTab('analysis')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap flex items-center gap-1 ${selectedTab === 'analysis'
                ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                : 'text-slate-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-pearto-luna'
                }`}
            >
              <BarChart3 className="h-3 w-3" />
              Analysis
            </button>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3 lg:p-4">
        {selectedTab === 'analysis' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Charts */}
            <div className="space-y-4">
              {/* Market Sentiment Pie Chart */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-xl">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-400 mb-2 text-center transition-colors duration-300">Market Sentiment</h3>
                <div className="h-40 flex items-center justify-center">
                  <Pie data={marketSentimentData} options={pieChartOptions} />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                  <div className="bg-green-100 dark:bg-pearto-green/10 p-2 rounded-lg text-center transition-colors duration-300">
                    <div className="font-semibold text-green-700">Gainers</div>
                    <div className="text-green-600 dark:text-pearto-green transition-colors duration-300">{topGainers.length}</div>
                    <div className="text-green-500 text-xs">+{avgGain.toFixed(1)}% avg</div>
                  </div>
                  <div className="bg-red-100 dark:bg-pearto-pink/10 p-2 rounded-lg text-center transition-colors duration-300">
                    <div className="font-semibold text-red-700">Losers</div>
                    <div className="text-red-600 dark:text-pearto-pink transition-colors duration-300">{topLosers.length}</div>
                    <div className="text-red-500 text-xs">-{avgLoss.toFixed(1)}% avg</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center transition-colors duration-300">
                    <div className="font-semibold text-slate-700 dark:text-gray-400 transition-colors duration-300">Neutral</div>
                    <div className="text-slate-600 dark:text-gray-400 transition-colors duration-300">{neutralStocks}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs transition-colors duration-300">Trending</div>
                  </div>
                </div>
              </div>

              {/* Price Range Pie Chart */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-xl">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-400 mb-2 text-center transition-colors duration-300">Price Distribution</h3>
                <div className="h-40 flex items-center justify-center">
                  <Pie data={priceRangeData} options={pieChartOptions} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(priceRanges).map(([range, count], i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300">
                      <span className="font-medium">{range}</span>
                      <div className="text-right">
                        <div className="text-slate-600 dark:text-gray-400 transition-colors duration-300">{count} stocks</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs transition-colors duration-300">
                          {count > 0 ? `${((count / allStocks.length) * 100).toFixed(0)}%` : '0%'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volume Distribution Donut Chart */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-3 rounded-xl">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-400 mb-2 text-center transition-colors duration-300">Volume Distribution</h3>
                <div className="h-40 flex items-center justify-center">
                  <Doughnut data={volumeDistributionData} options={donutChartOptions} />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                  <div className="bg-amber-100 dark:bg-amber-500/10 p-2 rounded-lg text-center transition-colors duration-300">
                    <div className="font-semibold text-amber-700 dark:text-amber-400 transition-colors duration-300">High</div>
                    <div className="text-amber-600 dark:text-amber-300 transition-colors duration-300">{highVolumeStocks.length}</div>
                    <div className="text-amber-500 dark:text-amber-400 text-xs transition-colors duration-300">&gt;1M</div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-500/10 p-2 rounded-lg text-center transition-colors duration-300">
                    <div className="font-semibold text-blue-700 dark:text-blue-400 transition-colors duration-300">Medium</div>
                    <div className="text-blue-600 dark:text-blue-300 transition-colors duration-300">{mediumVolumeStocks.length}</div>
                    <div className="text-blue-500 dark:text-blue-400 text-xs transition-colors duration-300">100K-1M</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center transition-colors duration-300">
                    <div className="font-semibold text-slate-700 dark:text-gray-400 transition-colors duration-300">Low</div>
                    <div className="text-slate-600 dark:text-gray-400 transition-colors duration-300">{lowVolumeStocks.length}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs transition-colors duration-300">&lt;100K</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Deep Analysis */}
            <div className="space-y-4">
              {/* Sector Performance Analysis */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-xl">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-400 mb-2 text-center transition-colors duration-300">Sector Performance</h3>
                <div className="space-y-2">
                  {sectorAnalysis.slice(0, 4).map((sector, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs text-slate-900 dark:text-white truncate transition-colors duration-300">{sector.sector}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{sector.stockCount} stocks</div>
                      </div>
                      <div className="text-right ml-2">
                        <div className={`font-bold text-xs ${sector.avgChange >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'}`}>
                          {sector.avgChange >= 0 ? '+' : ''}{sector.avgChange.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Vol: {sector.volatility.toFixed(1)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 rounded-xl">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-400 mb-2 text-center transition-colors duration-300">Top Performers</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs font-medium text-green-700 dark:text-pearto-green mb-1 transition-colors duration-300">Best Gainers</div>
                    <div className="space-y-1">
                      {topGainers.slice(0, 3).map((stock, i) => (
                        <div key={i} className="flex items-center justify-between p-1 bg-green-50 dark:bg-pearto-green/10 rounded text-xs transition-colors duration-300">
                          <span className="font-medium">{stock.symbol}</span>
                          <span className="text-green-600 dark:text-pearto-green transition-colors duration-300">+{stock.changePercent.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-red-700 dark:text-pearto-pink mb-1 transition-colors duration-300">Worst Losers</div>
                    <div className="space-y-1">
                      {topLosers.slice(0, 3).map((stock, i) => (
                        <div key={i} className="flex items-center justify-between p-1 bg-red-50 dark:bg-pearto-pink/10 rounded text-xs transition-colors duration-300">
                          <span className="font-medium">{stock.symbol}</span>
                          <span className="text-red-600 dark:text-pearto-pink transition-colors duration-300">{stock.changePercent.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Summary Stats */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-3 rounded-xl">
                <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 mb-2 text-center transition-colors duration-300">Market Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300">
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 transition-colors duration-300">{allStocks.length}</div>
                    <div className="text-indigo-500 dark:text-indigo-400 transition-colors duration-300">Total Stocks</div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300">
                    <div className="text-lg font-bold text-green-600 dark:text-pearto-green transition-colors duration-300">{avgGain.toFixed(1)}%</div>
                    <div className="text-green-500 dark:text-pearto-green transition-colors duration-300">Avg Gain</div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">{formatPrice(avgPrice)}</div>
                    <div className="text-blue-500 dark:text-blue-400 transition-colors duration-300">Avg Price</div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300">
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400 transition-colors duration-300">{formatVolume(totalVolume)}</div>
                    <div className="text-orange-500 dark:text-orange-400 transition-colors duration-300">Total Volume</div>
                  </div>
                </div>
                <div className="mt-2 text-center p-2 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300">
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium transition-colors duration-300">
                    Market Sentiment: {topGainers.length > topLosers.length ? '📈 Bullish' : topGainers.length < topLosers.length ? '📉 Bearish' : '⚖️ Neutral'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                    Volatility: {sectorAnalysis.length > 0 ? (sectorAnalysis.reduce((sum, s) => sum + s.volatility, 0) / sectorAnalysis.length).toFixed(1) : '0'}%
                  </div>
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-3 rounded-xl">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-400 mb-2 text-center transition-colors duration-300">Risk Analysis</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300">
                    <div className="text-lg font-bold text-red-600 dark:text-pearto-pink transition-colors duration-300">{highVolumeStocks.length}</div>
                    <div className="text-red-500 dark:text-pearto-pink transition-colors duration-300">High Activity</div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300">
                    <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400 transition-colors duration-300">{neutralStocks}</div>
                    <div className="text-yellow-500 dark:text-yellow-400 transition-colors duration-300">Neutral Stocks</div>
                  </div>
                </div>
                <div className="mt-2 text-center p-2 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300">
                  <div className="text-xs text-slate-600 dark:text-gray-400 transition-colors duration-300">
                    🎯 Risk Level: {avgLoss > avgGain ? '⚠️ High' : avgLoss > avgGain * 0.5 ? '⚡ Moderate' : '✅ Low'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {(selectedTab === 'gainers' ? topGainers :
              selectedTab === 'losers' ? topLosers : trendingStocks)
              .slice(0, 5).map((stock, i) => {
                const changeData = formatChange(stock.change, stock.changePercent);
                return (
                  <Link key={i} href={`/stock/${stock.symbol.toLowerCase()}`}>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-pearto-card transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${changeData.isPositive ? 'bg-green-100 dark:bg-pearto-green/10' : 'bg-red-100 dark:bg-pearto-pink/10'
                          }`}>
                          <span className={`font-bold text-xs ${changeData.isPositive ? 'text-green-700' : 'text-red-700'
                            }`}>
                            {stock.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white transition-colors duration-300">{stock.symbol}</div>
                          <div className="text-xs text-slate-600 dark:text-gray-400 truncate transition-colors duration-300">{stock.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block transition-colors duration-300">{stock.sector}</div>
                        </div>
                      </div>
                      <div className="text-right ml-1.5 flex-shrink-0">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white transition-colors duration-300">{formatPrice(stock.price)}</div>
                        <div className={`text-xs font-medium flex items-center justify-end ${changeData.isPositive ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'
                          }`}>
                          {changeData.isPositive ? (
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          )}
                          <span className="hidden sm:inline">{changeData.value}</span>
                          <span className="sm:hidden">{stock.changePercent.toFixed(1)}%</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden lg:block transition-colors duration-300">
                          Vol: {stock.volume ? formatVolume(stock.volume) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        )}
        <Link href="/stocks" className="block mt-3 sm:mt-4 text-center py-2.5 bg-emerald-600 dark:bg-pearto-pink text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-pearto-pink-hover transition-colors font-medium text-xs sm:text-sm">
          View All Market Data →
        </Link>
      </div>
    </div>
  );
}
