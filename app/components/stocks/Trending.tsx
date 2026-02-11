'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, TrendingUp } from 'lucide-react';
import { stockAPI } from '../../utils/api';
import { Stock } from '../../types';
import Link from 'next/link';
import PriceDisplay from '../common/PriceDisplay';

interface TrendingProps {
  className?: string;
}

export default function Trending({ className = '' }: TrendingProps) {
  const [trendingStocks, setTrendingStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setIsLoading(true);
        const response = await stockAPI.getTrendingStocks();

        if (response.success && response.data) {
          setTrendingStocks(response.data);
        }
      } catch (error) {
        console.error('[Trending] Error fetching trending stocks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const formatMarketCap = (value: number | undefined): string => {
    if (!value) return '—';
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    return value.toLocaleString();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border p-4 sm:p-6 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-pearto-luna transition-colors duration-300">Trending Stocks</h2>
              <p className="text-sm text-gray-600 dark:text-pearto-cloud mt-1 transition-colors duration-300">Most talked about and actively traded stocks</p>
            </div>
          </div>
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-pearto-card rounded-xl shadow-sm border border-gray-200 dark:border-pearto-border overflow-hidden transition-colors duration-300">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : trendingStocks.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-gray-500 dark:text-pearto-gray transition-colors duration-300">No trending stocks data available at the moment.</p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="block lg:hidden divide-y divide-gray-200 dark:divide-pearto-border dark:divide-pearto-border transition-colors duration-300">
              {trendingStocks.map((stock, index) => (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4"
                >
                  <Link href={`/stock/${stock.symbol.toLowerCase()}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-gray-900 dark:text-pearto-luna transition-colors duration-300">{stock.symbol}</div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <PriceDisplay amount={stock.price} className="font-bold text-lg" />
                        <div className={stock.change >= 0 ? 'text-green-600 dark:text-pearto-green font-medium' : 'text-red-600 dark:text-pearto-pink font-medium'}>
                          {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-pearto-cloud mb-2 transition-colors duration-300">{stock.name}</div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-pearto-gray transition-colors duration-300">
                      <span>Vol: {formatNumber(stock.volume || 0)}</span>
                      <span>MCap: {formatMarketCap(stock.marketCap)}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block">
              <div className="px-6 py-4 bg-gray-50 dark:bg-pearto-surface border-b border-gray-200 dark:border-pearto-border transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-pearto-luna transition-colors duration-300">
                  {trendingStocks.length} Trending Stocks
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-pearto-border text-sm">
                  <thead className="bg-gray-50 dark:bg-pearto-surface transition-colors duration-300">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">Trending</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">Stock</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">Change</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">Volume</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">Market Cap</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-pearto-gray uppercase transition-colors duration-300">Sector</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-pearto-card divide-y divide-gray-200 dark:divide-pearto-border transition-colors duration-300">
                    {trendingStocks.map((stock, index) => (
                      <motion.tr
                        key={stock.symbol}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50 dark:bg-pearto-surface transition-colors"
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <div className="text-sm font-medium text-gray-900 dark:text-pearto-luna transition-colors duration-300">#{index + 1}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {/* UPDATED: Link wraps the stacked info */}
                          <Link href={`/stock/${stock.symbol.toLowerCase()}`} className="group block">
                            <div className="flex flex-col items-start">
                              <div className="text-sm font-bold text-gray-900 dark:text-pearto-luna group-hover:text-purple-600 transition-colors leading-tight">
                                {stock.symbol}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-pearto-gray truncate max-w-[160px] leading-tight mt-0.5 transition-colors duration-300">
                                {stock.name}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-pearto-luna transition-colors duration-300">
                          <PriceDisplay amount={stock.price} />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`font-medium ${stock.change >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'}`}>
                              {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </div>
                            <div className={`text-sm ml-2 ${stock.change >= 0 ? 'text-green-600 dark:text-pearto-green' : 'text-red-600 dark:text-pearto-pink'}`}>
                              <PriceDisplay amount={stock.change} showSign />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-pearto-luna transition-colors duration-300">
                          {formatNumber(stock.volume || 0)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-pearto-luna transition-colors duration-300">
                          {formatMarketCap(stock.marketCap)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium inline-block">
                            {stock.sector || 'Unknown'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}