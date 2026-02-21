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
    cutout: '65%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        callbacks: {
          label: function (context: any) {
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Market Movers</h2>
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedTab('gainers')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedTab === 'gainers'
                ? 'bg-green-100 dark:bg-pearto-green/10 text-green-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 '
                }`}
            >
              Gainers
            </button>
            <button
              onClick={() => setSelectedTab('losers')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedTab === 'losers'
                ? 'bg-red-100 dark:bg-pearto-pink/10 text-red-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 '
                }`}
            >
              Losers
            </button>
            <button
              onClick={() => setSelectedTab('trending')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedTab === 'trending'
                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-pearto-luna'
                }`}
            >
              Trending
            </button>
            <button
              onClick={() => setSelectedTab('analysis')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap flex items-center gap-1 ${selectedTab === 'analysis'
                ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-pearto-luna'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Market Sentiment */}
            <div className="bg-gradient-to-br from-green-50 to-red-50 dark:from-slate-800 dark:to-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4 text-center">Market Sentiment</h3>
              <div className="h-52 flex items-center justify-center">
                <Doughnut data={marketSentimentData} options={donutChartOptions} />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">Gainers</span>
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">{topGainers.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">Losers</span>
                  </div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">{topLosers.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">Neutral</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{neutralStocks}</span>
                </div>
              </div>
            </div>

            {/* Volume Distribution */}
            <div className="bg-gradient-to-br from-amber-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4 text-center">Volume Distribution</h3>
              <div className="h-52 flex items-center justify-center">
                <Doughnut data={volumeDistributionData} options={donutChartOptions} />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">High (&gt;1M)</span>
                  </div>
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{highVolumeStocks.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">Medium</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{mediumVolumeStocks.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">Low (&lt;100K)</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{lowVolumeStocks.length}</span>
                </div>
              </div>
            </div>

            {/* Price Distribution */}
            <div className="bg-gradient-to-br from-purple-50 to-green-50 dark:from-slate-800 dark:to-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4 text-center">Price Distribution</h3>
              <div className="h-52 flex items-center justify-center">
                <Doughnut data={priceRangeData} options={donutChartOptions} />
              </div>
              <div className="mt-4 space-y-2">
                {Object.entries(priceRanges).map(([range, count], i) => {
                  const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500'];
                  const textColors = ['text-purple-600 dark:text-purple-400', 'text-blue-600 dark:text-blue-400', 'text-green-600 dark:text-green-400', 'text-orange-600 dark:text-orange-400'];
                  return (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[i]}`}></div>
                        <span className="text-xs text-slate-700 dark:text-slate-300">{range}</span>
                      </div>
                      <span className={`text-sm font-medium ${textColors[i]}`}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sector Performance */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Sector Performance</h3>
              <div className="space-y-2">
                {sectorAnalysis.slice(0, 6).map((sector, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs text-slate-900 dark:text-white truncate">{sector.sector}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{sector.stockCount} stocks</div>
                    </div>
                    <div className={`font-medium text-sm ${sector.avgChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {sector.avgChange >= 0 ? '+' : ''}{sector.avgChange.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Top Performers</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">Best Gainers</div>
                  <div className="space-y-1.5">
                    {topGainers.slice(0, 3).map((stock, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-green-50 dark:bg-green-500/10 rounded-lg">
                        <span className="font-medium text-xs text-slate-900 dark:text-white">{stock.symbol}</span>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">+{stock.changePercent.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">Worst Losers</div>
                  <div className="space-y-1.5">
                    {topLosers.slice(0, 3).map((stock, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-red-50 dark:bg-red-500/10 rounded-lg">
                        <span className="font-medium text-xs text-slate-900 dark:text-white">{stock.symbol}</span>
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">{stock.changePercent.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Market Summary */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Market Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-xl">
                  <div className="text-3xl font-medium text-blue-600 dark:text-blue-400">{allStocks.length}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Stocks</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-xl">
                  <div className="text-3xl font-medium text-green-600 dark:text-green-400">{avgGain.toFixed(1)}%</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Avg Gain</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-xl">
                  <div className="text-2xl font-medium text-purple-600 dark:text-purple-400">{formatPrice(avgPrice)}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Avg Price</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-xl">
                  <div className="text-2xl font-medium text-orange-600 dark:text-orange-400">{formatVolume(totalVolume)}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Volume</div>
                </div>
              </div>
              <div className="mt-4 text-center p-4 bg-white dark:bg-slate-700 rounded-xl">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {topGainers.length > topLosers.length ? '📈 Bullish Market' : topGainers.length < topLosers.length ? '📉 Bearish Market' : '⚖️ Neutral Market'}
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
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${changeData.isPositive ? 'bg-green-100 dark:bg-pearto-green/10' : 'bg-red-100 dark:bg-pearto-pink/10'
                          }`}>
                          <span className={`font-medium text-xs ${changeData.isPositive ? 'text-green-700' : 'text-red-700'
                            }`}>
                            {stock.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-xs sm:text-sm text-slate-900 dark:text-white transition-colors duration-300">{stock.symbol}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 truncate transition-colors duration-300">{stock.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 hidden lg:block transition-colors duration-300">{stock.sector}</div>
                        </div>
                      </div>
                      <div className="text-right ml-1.5 flex-shrink-0">
                        <div className="font-medium text-xs sm:text-sm text-slate-900 dark:text-white transition-colors duration-300">{formatPrice(stock.price)}</div>
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
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden lg:block transition-colors duration-300">
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
